"""Agent router — Legal analysis engine + LLM integration."""

import os
import re
from datetime import datetime, date
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.deps import get_current_user, get_service_client

router = APIRouter()


def _days_until(date_str: str) -> int | None:
    try:
        d = datetime.fromisoformat(date_str[:10]).date()
        return (d - date.today()).days
    except Exception:
        return None


# ═══════════════════════════════════════════════════════════════════
# LEGAL ANALYZER
# ═══════════════════════════════════════════════════════════════════

CLAIM_ELEMENTS = {
    "conversion": [
        "plaintiff had ownership or right to possess the property",
        "defendant intentionally interfered with the property",
        "defendant's interference caused plaintiff damage",
        "property had identifiable value",
    ],
    "breach_of_contract": [
        "valid contract existed between parties",
        "plaintiff performed their obligations",
        "defendant breached the contract",
        "plaintiff suffered damages from the breach",
    ],
    "negligence": [
        "defendant owed a duty of care to plaintiff",
        "defendant breached that duty",
        "breach caused plaintiff's injury",
        "plaintiff suffered measurable damages",
    ],
    "fraud": [
        "defendant made a false representation",
        "defendant knew the representation was false",
        "defendant intended plaintiff to rely on it",
        "plaintiff justifiably relied on the representation",
        "plaintiff suffered damages as a result",
    ],
    "unjust_enrichment": [
        "defendant received a benefit",
        "benefit was at plaintiff's expense",
        "it would be unjust for defendant to retain the benefit",
    ],
}


def _load_all(db, matter_id: str) -> dict:
    return {
        "facts": db.table("facts").select("*").eq("matter_id", matter_id).execute().data or [],
        "evidence": db.table("evidence_items").select("*").eq("matter_id", matter_id).execute().data or [],
        "tasks": db.table("tasks").select("*").eq("matter_id", matter_id).execute().data or [],
        "deadlines": db.table("deadlines").select("*").eq("matter_id", matter_id).execute().data or [],
        "timeline": db.table("timeline_events").select("*").eq("matter_id", matter_id).order("event_date").execute().data or [],
        "witnesses": db.table("witnesses").select("*").eq("matter_id", matter_id).execute().data or [],
        "documents": db.table("documents").select("*").eq("matter_id", matter_id).execute().data or [],
        "issues": db.table("issues").select("*").eq("matter_id", matter_id).execute().data or [],
        "parties": db.table("parties").select("*").eq("matter_id", matter_id).execute().data or [],
    }


def case_summary(matter: dict, data: dict) -> str:
    m = matter
    lines = [
        f"# Case Summary: {m.get('title', 'Unknown')}",
        "",
        f"**Court**: {m.get('court', '—')} | **Case No**: {m.get('case_number', '—')}",
        f"**Jurisdiction**: {m.get('jurisdiction', '—')} | **Phase**: {(m.get('phase') or 'pre-trial').replace('-', ' ').title()}",
        f"**Plaintiff**: {m.get('plaintiff', '—')}",
        f"**Defendant**: {m.get('defendant', '—')}",
    ]
    if m.get("trial_date"):
        days = _days_until(m["trial_date"])
        lines.append(f"**Trial Date**: {m['trial_date'][:10]} ({days} days away)" if days else f"**Trial Date**: {m['trial_date'][:10]}")

    lines += ["", "## Record Counts"]
    counts = {
        "Facts on record": len(data["facts"]),
        "Established facts": sum(1 for f in data["facts"] if f.get("status") == "established"),
        "Disputed facts": sum(1 for f in data["facts"] if f.get("status") == "disputed"),
        "Evidence items": len(data["evidence"]),
        "Timeline events": len(data["timeline"]),
        "Witnesses": len(data["witnesses"]),
        "Open tasks": sum(1 for t in data["tasks"] if t.get("status") in ("open", "in_progress")),
        "Pending deadlines": sum(1 for d in data["deadlines"] if d.get("status") == "pending"),
        "Documents indexed": len(data["documents"]),
    }
    for k, v in counts.items():
        icon = "✓" if v > 0 else "⚠"
        lines.append(f"  {icon} {k}: **{v}**")
    return "\n".join(lines)


def gap_analysis(data: dict) -> str:
    all_text = " ".join(
        (f.get("statement") or "") + " " + (f.get("excerpt") or "")
        for f in data["facts"]
    ).lower()
    doc_text = " ".join(
        (d.get("title") or "") + " " + (d.get("extracted_text") or "")[:500]
        for d in data["documents"]
    ).lower()
    combined = all_text + " " + doc_text

    lines = ["## Gap Analysis — Elements Coverage", ""]
    for claim, elements in CLAIM_ELEMENTS.items():
        lines.append(f"### {claim.replace('_', ' ').title()}")
        covered = 0
        for el in elements:
            keywords = [w for w in el.lower().split() if len(w) > 4]
            hit = sum(1 for kw in keywords if kw in combined)
            score = hit / len(keywords) if keywords else 0
            if score > 0.4:
                lines.append(f"  ✅ {el}")
                covered += 1
            elif score > 0.1:
                lines.append(f"  ⚠ {el}  ← *partially supported*")
            else:
                lines.append(f"  ❌ {el}  ← **MISSING**")
        pct = int(covered / len(elements) * 100) if elements else 0
        lines.append(f"  *Coverage: {covered}/{len(elements)} ({pct}%)*\n")
    return "\n".join(lines)


def evidence_strength(data: dict) -> str:
    lines = ["## Evidence Strength Assessment", ""]
    ev, facts, docs, witnesses = data["evidence"], data["facts"], data["documents"], data["witnesses"]
    if not ev and not facts and not docs:
        return "No evidence, facts, or documents on record yet."

    scores = {}
    est = sum(1 for f in facts if f.get("status") == "established")
    scores["Facts"] = (est, len(facts))
    auth = sum(1 for e in ev if e.get("status") in ("authenticated", "admitted"))
    scores["Exhibits"] = (auth, len(ev))
    served = sum(1 for w in witnesses if w.get("subpoena_status") == "served")
    scores["Witness Subpoenas"] = (served, len(witnesses))

    for label, (got, total) in scores.items():
        if total == 0:
            lines.append(f"**{label}**: No records")
            continue
        pct = int(got / total * 100)
        bar = "█" * (pct // 10) + "░" * (10 - pct // 10)
        color = "✅" if pct >= 70 else "⚠" if pct >= 30 else "❌"
        lines.append(f"{color} **{label}**: [{bar}] {pct}% ({got}/{total})")
    return "\n".join(lines)


def timeline_analysis(data: dict) -> str:
    events = sorted(data["timeline"], key=lambda e: e.get("event_date", ""))
    if not events:
        return "No timeline events recorded."
    lines = [
        "## Chronological Analysis", "",
        f"**{len(events)} events** spanning {events[0]['event_date'][:10]} → {events[-1]['event_date'][:10]}",
        "",
    ]
    critical = [e for e in events if e.get("significance") == "critical"]
    if critical:
        lines.append("### Critical Events")
        for e in critical:
            lines.append(f"  🔴 {e['event_date'][:10]}: {e['title']}")
    lines.append("\n### Timeline Gaps (>90 days)")
    gaps_found = 0
    for i in range(1, len(events)):
        try:
            d1 = datetime.fromisoformat(events[i - 1]["event_date"][:10]).date()
            d2 = datetime.fromisoformat(events[i]["event_date"][:10]).date()
            gap = (d2 - d1).days
            if gap > 90:
                lines.append(f"  ⚠ {gap}-day gap: {events[i-1]['event_date'][:10]} → {events[i]['event_date'][:10]}")
                gaps_found += 1
        except Exception:
            pass
    if not gaps_found:
        lines.append("  ✅ No major gaps detected")
    return "\n".join(lines)


def deadline_risk(data: dict) -> str:
    deadlines = sorted(data["deadlines"], key=lambda d: d.get("deadline_date", ""))
    lines = ["## Deadline Risk Assessment", ""]
    if not deadlines:
        return "No deadlines recorded."
    urgent, warning, ok = [], [], []
    for d in deadlines:
        if d.get("status") != "pending":
            continue
        days = _days_until(d["deadline_date"])
        if days is None:
            continue
        if days <= 7:
            urgent.append((days, d))
        elif days <= 30:
            warning.append((days, d))
        else:
            ok.append((days, d))
    if urgent:
        lines.append("### 🔴 CRITICAL (≤7 days)")
        for days, d in urgent:
            lines.append(f"  **{d['deadline_date'][:10]}** ({days}d) — {d['title']}")
    if warning:
        lines.append("\n### ⚠ Warning (8-30 days)")
        for days, d in warning:
            lines.append(f"  {d['deadline_date'][:10]} ({days}d) — {d['title']}")
    if ok:
        lines.append("\n### ✅ On Track (>30 days)")
        for days, d in ok:
            lines.append(f"  {d['deadline_date'][:10]} ({days}d) — {d['title']}")
    return "\n".join(lines)


def trial_readiness(data: dict) -> str:
    lines = ["## Trial Readiness Score", ""]
    checks = []
    facts, ev, wit, docs, dl, tasks = (
        data["facts"], data["evidence"], data["witnesses"],
        data["documents"], data["deadlines"], data["tasks"],
    )

    def check(label, passed, detail=""):
        checks.append((label, passed, detail))

    check("Facts documented", len(facts) >= 5, f"{len(facts)} facts")
    check("Evidence catalogued", len(ev) >= 3, f"{len(ev)} exhibits")
    check("Evidence authenticated", any(e.get("status") in ("authenticated", "admitted") for e in ev), "")
    check("Witnesses identified", len(wit) >= 1, f"{len(wit)} witnesses")
    check("Timeline documented", len(data["timeline"]) >= 5, f"{len(data['timeline'])} events")
    check("No missed deadlines", not any(d.get("status") == "missed" for d in dl), "")
    check("Open tasks < 10", sum(1 for t in tasks if t.get("status") == "open") < 10, "")
    check("Documents indexed", len(docs) >= 1, f"{len(docs)} documents")

    passed_count = sum(1 for _, p, _ in checks if p)
    total = len(checks)
    score = int(passed_count / total * 100) if total else 0
    bar = "█" * (score // 10) + "░" * (10 - score // 10)
    lines.append(f"**Score: {score}/100** [{bar}]")
    lines.append(f"*{passed_count}/{total} checks passed*\n")
    for label, passed, detail in checks:
        icon = "✅" if passed else "❌"
        suffix = f" — {detail}" if detail else ""
        lines.append(f"  {icon} {label}{suffix}")
    return "\n".join(lines)


def contradiction_scan(data: dict) -> str:
    facts = data["facts"]
    lines = ["## Contradiction Analysis", ""]
    explicit = [f for f in facts if f.get("category") == "contradiction" or f.get("status") == "disputed"]
    if explicit:
        lines.append(f"### Flagged Contradictions ({len(explicit)})")
        for f in explicit:
            lines.append(f"  ❌ [{(f.get('category') or '').upper()}] {f['statement']}")
    negation_pairs = []
    for i, f1 in enumerate(facts):
        s1 = (f1.get("statement") or "").lower()
        for f2 in facts[i + 1:]:
            s2 = (f2.get("statement") or "").lower()
            words1 = set(s1.split())
            words2 = set(s2.split())
            shared = words1 & words2 - {"the", "a", "an", "is", "was", "were", "and", "or", "to", "of", "in"}
            if len(shared) > 3:
                neg1 = any(w in s1 for w in ["not", "never", "no", "didn't", "wasn't"])
                neg2 = any(w in s2 for w in ["not", "never", "no", "didn't", "wasn't"])
                if neg1 != neg2:
                    negation_pairs.append((f1, f2))
    if negation_pairs:
        lines.append(f"\n### Potential Conflicts ({len(negation_pairs)})")
        for f1, f2 in negation_pairs[:5]:
            lines.append(f"  ⚠ A: {f1['statement'][:100]}")
            lines.append(f"     B: {f2['statement'][:100]}\n")
    if not explicit and not negation_pairs:
        lines.append("  ✅ No contradictions detected.")
    return "\n".join(lines)


# ═══════════════════════════════════════════════════════════════════
# INTENT ROUTING
# ═══════════════════════════════════════════════════════════════════

INTENT_MAP = {
    "summary": [r"summar", r"overview", r"about.*case", r"tell me about"],
    "gap": [r"gap", r"missing", r"lack", r"element", r"prove"],
    "evidence": [r"evidence", r"exhibit", r"strength"],
    "timeline": [r"timeline", r"chronol", r"sequence"],
    "deadlines": [r"deadline", r"due date", r"upcoming"],
    "readiness": [r"ready", r"trial.*ready", r"readiness", r"score"],
    "contradiction": [r"contradict", r"conflict", r"inconsist"],
    "next_steps": [r"next step", r"what.*do", r"recommend", r"suggest"],
}


def detect_intent(query: str) -> str:
    q = query.lower()
    for intent, patterns in INTENT_MAP.items():
        if any(re.search(p, q) for p in patterns):
            return intent
    return "retrieval"


# ═══════════════════════════════════════════════════════════════════
# LLM INTEGRATION
# ═══════════════════════════════════════════════════════════════════

def _llm_available() -> tuple[bool, str]:
    if os.environ.get("OPENAI_API_KEY"):
        return True, "openai"
    if os.environ.get("ANTHROPIC_API_KEY"):
        return True, "anthropic"
    return False, ""


def _call_llm(query: str, context: str, matter: dict, provider: str) -> str:
    system = (
        f"You are an expert legal case strategist for: {matter.get('title', 'this case')}. "
        f"Court: {matter.get('court', '')}, {matter.get('jurisdiction', '')}. "
        "Synthesize the case analysis into clear, actionable legal advice. "
        "Cite facts and exhibits. Identify risks and recommend actions."
    )
    prompt = f"Case Analysis:\n{context}\n\nQuestion: {query}"
    try:
        if provider == "openai":
            from openai import OpenAI
            r = OpenAI().chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "system", "content": system}, {"role": "user", "content": prompt}],
                max_tokens=1000,
            )
            return r.choices[0].message.content or ""
        elif provider == "anthropic":
            import anthropic
            r = anthropic.Anthropic().messages.create(
                model="claude-opus-4-5",
                max_tokens=1000,
                system=system,
                messages=[{"role": "user", "content": prompt}],
            )
            return r.content[0].text
    except Exception as e:
        return f"[LLM error: {e}]"
    return ""


# ═══════════════════════════════════════════════════════════════════
# API ENDPOINT
# ═══════════════════════════════════════════════════════════════════

class AgentQuery(BaseModel):
    query: str


@router.post("/ask")
async def agent_ask(matter_id: str, body: AgentQuery, user: dict = Depends(get_current_user)):
    db = get_service_client()

    # Get matter
    matter_result = db.table("matter").select("*").eq("id", matter_id).eq("user_id", user["id"]).single().execute()
    if not matter_result.data:
        return {"response": "Matter not found.", "intent": "error"}

    matter = matter_result.data
    data = _load_all(db, matter_id)
    intent = detect_intent(body.query)

    # Route to analysis
    analysis_map = {
        "summary": lambda: case_summary(matter, data),
        "gap": lambda: gap_analysis(data),
        "evidence": lambda: evidence_strength(data),
        "timeline": lambda: timeline_analysis(data),
        "deadlines": lambda: deadline_risk(data),
        "readiness": lambda: trial_readiness(data),
        "contradiction": lambda: contradiction_scan(data),
    }

    if intent in analysis_map:
        base = analysis_map[intent]()
    elif intent == "next_steps":
        lines = ["## Recommended Next Steps", ""]
        pending_dl = sorted(
            [d for d in data["deadlines"] if d.get("status") == "pending"],
            key=lambda d: d.get("deadline_date", ""),
        )
        if pending_dl:
            dl = pending_dl[0]
            days = _days_until(dl["deadline_date"])
            lines.append(f"1. 🔴 **Deadline in {days} days**: {dl['title']}")
        urgent_tasks = [t for t in data["tasks"] if t.get("priority") in ("urgent", "high") and t.get("status") == "open"]
        for t in urgent_tasks[:3]:
            lines.append(f"2. 🔴 **Urgent task**: {t['title']}")
        if not data["evidence"]:
            lines.append("3. 📂 Add and catalogue evidence exhibits")
        if len(data["facts"]) < 10:
            lines.append(f"4. 📝 Add more facts ({len(data['facts'])} currently)")
        if not data["timeline"]:
            lines.append("5. 📅 Build a chronological timeline")
        base = "\n".join(lines)
    else:
        # General retrieval — keyword match
        q_low = body.query.lower()
        keywords = [w for w in q_low.split() if len(w) > 3]
        def matches(text: str) -> bool:
            return any(kw in (text or "").lower() for kw in keywords)
        rel_facts = [f for f in data["facts"] if matches(f.get("statement", "") + (f.get("excerpt") or ""))][:8]
        lines = [f'## Results for "{body.query}"', ""]
        if rel_facts:
            lines.append(f"**Relevant Facts** ({len(rel_facts)})")
            for f in rel_facts:
                lines.append(f"  • {f['statement'][:160]}")
        if not rel_facts:
            lines.append("No records found. Try: 'case summary', 'gap analysis', 'trial readiness'")
        base = "\n".join(lines)

    # Optional LLM enhancement
    llm_ok, provider = _llm_available()
    if llm_ok and len(base) > 50:
        try:
            enhanced = _call_llm(body.query, base, matter, provider)
            if enhanced and not enhanced.startswith("["):
                return {"response": enhanced, "intent": intent, "source": f"{provider} + {intent}"}
        except Exception:
            pass

    return {"response": base, "intent": intent, "source": f"local ({intent})"}
