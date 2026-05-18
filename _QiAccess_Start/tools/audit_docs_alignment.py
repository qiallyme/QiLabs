from __future__ import annotations

import csv
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from datetime import datetime


# ============================================================
# audit_docs_alignment.py
#
# Purpose:
#   Scan QiAccess/QiDocs documentation for stale legacy language,
#   old QiAlly/business/client platform assumptions, exposure risks,
#   missing current qiserver doctrine, and active-vs-superseded drift.
#
# Root:
#   C:\QiLabs\_QiAccess_Start\docs
#
# Outputs:
#   docs\30_audits\docs_alignment_audit_YYYYMMDD_HHMMSS.md
#   docs\30_audits\docs_alignment_audit_YYYYMMDD_HHMMSS_findings.csv
#   docs\30_audits\docs_alignment_audit_YYYYMMDD_HHMMSS_summary.csv
# ============================================================


REPO_ROOT = Path(r"C:\QiLabs\_QiAccess_Start")
DOCS_ROOT = REPO_ROOT / "docs"
AUDIT_OUT = DOCS_ROOT / "30_audits"

SCAN_EXTENSIONS = {".md", ".yaml", ".yml", ".json"}

IGNORE_DIR_PARTS = {
    ".git",
    ".venv",
    "node_modules",
    "__pycache__",
    ".obsidian",
    ".obsidian-qidocs",
    ".smart-env"
}

REFERENCE_PATH_MARKERS = [
    "70_appendices/07_superseded_sources",
    "30_audits",
]

LEGACY_PATTERNS = {
    "client_portal_language": [
        r"\bclient portals?\b",
        r"\bclient-facing\b",
        r"\btenant\b",
        r"\btenants\b",
        r"\bmulti-tenant\b",
        r"\bCRM\b",
        r"\bclient onboarding\b",
        r"\bservice delivery\b",
    ],
    "old_qially_suite_language": [
        r"\bQiSuite\b",
        r"\bQiPortals\b",
        r"\bQiCRM\b",
        r"\bQiPortal\b",
        r"\bQiOne\b",
    ],
    "old_business_priority": [
        r"\bbusiness-first\b",
        r"\bclients? first\b",
        r"\bclient work is primary\b",
        r"\bbusiness delivery\b",
        r"\bproduct-delivery\b",
    ],
    "old_stack_assumptions": [
        r"\bMkDocs\b",
        r"\bMaterial Theme\b",
        r"\bPNPM\b",
        r"\bNext\.js\b",
        r"\bpgvector\b",
        r"\bSupabase\b",
    ],
    "public_exposure_risk_language": [
        r"\bpublicly expose\b",
        r"\bexpose publicly\b",
        r"\b0\.0\.0\.0\b",
        r"\bpublic dashboard\b",
        r"\bpublic admin\b",
        r"\bopen internet\b",
    ],
}

CURRENT_PATTERNS = {
    "qiaccess_start": [
        r"\bQiAccess Start\b",
        r"\bcognitive front door\b",
        r"\boperational front door\b",
        r"\bfront door\b",
    ],
    "qiserver_runtime": [
        r"\bqiserver\b",
        r"\bself-hosted runtime\b",
        r"/srv/qios",
        r"/srv/qios/repos",
        r"/srv/qios/stacks",
        r"/srv/qios/data",
    ],
    "current_services": [
        r"\bPaperless\b",
        r"\bPaperless-ngx\b",
        r"\bn8n\b",
        r"\bOllama\b",
        r"\bAider\b",
        r"\bWiki\.js\b",
        r"\bOpen WebUI\b",
        r"\bNocoDB\b",
        r"\bPortainer\b",
        r"\bCockpit\b",
        r"\bNeo4j\b",
    ],
    "access_boundary": [
        r"\bPrivate Only\b",
        r"\bPublic Restricted\b",
        r"\bPublic Safe\b",
        r"\bprivate/protected\b",
        r"\badmin services\b",
        r"\badmin/control services\b",
    ],
    "markdown_vault": [
        r"\bObsidian\b",
        r"\bWiki\.js-compatible\b",
        r"\bMarkdown doctrine vault\b",
    ],
    "no_supabase_yet": [
        r"\bNo Supabase\b",
        r"\bSupabase should not be added\b",
        r"\bunless it has a specific job\b",
        r"\bfuture/conditional\b",
    ],
}

REQUIRED_ACTIVE_FACTS = {
    "repos_stacks_data_split": r"/srv/qios/repos|/srv/qios/stacks|/srv/qios/data",
    "ollama_localhost": r"127\.0\.0\.1:11434",
    "paperless_localhost": r"127\.0\.0\.1:8010",
    "qidocs_wikijs_boundary": r"Wiki\.js|Markdown doctrine vault|Obsidian",
    "aider_repo_rule": r"Aider|nested Git|nested git|/srv/qios/repos",
    "paperless_10_doc_test": r"10 documents|max 10|ten documents",
    "private_admin_services": r"private/protected|Private Only|admin/control services|admin services",
}

HIGH_VALUE_ACTIVE_FILES = [
    "10_blueprint/_index.md",
    "10_blueprint/README.md",
    "10_blueprint/10_governance/01_principles.md",
    "10_blueprint/10_governance/05_policies.md",
    "10_blueprint/20_architecture/03_system_model.md",
    "10_blueprint/20_architecture/06_service_boundaries.md",
    "10_blueprint/30_data/13_storage.md",
    "10_blueprint/30_data/16_structure.md",
    "10_blueprint/40_compute/04_integrations.md",
    "10_blueprint/40_compute/06_qiserver_runtime_profile.md",
    "10_blueprint/40_compute/07_tech_stack.md",
    "10_blueprint/50_applications/01_portal.md",
    "10_blueprint/50_applications/03_tools.md",
    "10_blueprint/standards/repo_rules.yaml",
    "10_blueprint/registry/infrastructure_registry.yaml",
]


@dataclass
class Finding:
    file: str
    line: int
    category: str
    severity: str
    match: str
    context: str


def normalized_rel(path: Path) -> str:
    return str(path.relative_to(DOCS_ROOT)).replace("\\", "/")


def is_reference_file(rel_path: str) -> bool:
    return any(marker in rel_path for marker in REFERENCE_PATH_MARKERS)


def should_scan(path: Path) -> bool:
    if not path.is_file():
        return False
    if path.suffix.lower() not in SCAN_EXTENSIONS:
        return False
    parts = set(path.parts)
    if parts.intersection(IGNORE_DIR_PARTS):
        return False
    return True


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="utf-8", errors="replace")


def count_patterns(text: str, pattern_map: dict[str, list[str]]) -> dict[str, int]:
    scores: dict[str, int] = {}
    for group, patterns in pattern_map.items():
        scores[group] = sum(
            len(re.findall(pattern, text, flags=re.IGNORECASE))
            for pattern in patterns
        )
    return scores


def scan_line_patterns(
    rel_path: str,
    lines: list[str],
    pattern_map: dict[str, list[str]],
    severity: str,
) -> list[Finding]:
    findings: list[Finding] = []

    for i, line in enumerate(lines, start=1):
        for category, patterns in pattern_map.items():
            for pattern in patterns:
                if re.search(pattern, line, flags=re.IGNORECASE):
                    findings.append(
                        Finding(
                            file=rel_path,
                            line=i,
                            category=category,
                            severity=severity,
                            match=pattern,
                            context=line.strip()[:350],
                        )
                    )
    return findings


def classify_file(rel_path: str, text: str) -> dict[str, object]:
    legacy = count_patterns(text, LEGACY_PATTERNS)
    current = count_patterns(text, CURRENT_PATTERNS)

    legacy_total = sum(legacy.values())
    current_total = sum(current.values())

    if is_reference_file(rel_path):
        status = "reference_or_audit"
    elif legacy_total and not current_total:
        status = "likely_stale"
    elif legacy_total and current_total:
        status = "mixed_review"
    elif current_total:
        status = "current_or_aligned"
    else:
        status = "neutral_or_unknown"

    row: dict[str, object] = {
        "file": rel_path,
        "status": status,
        "legacy_hits": legacy_total,
        "current_hits": current_total,
    }

    for key, value in legacy.items():
        row[f"legacy::{key}"] = value
    for key, value in current.items():
        row[f"current::{key}"] = value

    return row


def missing_required_facts(rel_path: str, text: str) -> list[Finding]:
    if is_reference_file(rel_path):
        return []

    # Only require doctrine facts in core active files.
    if rel_path not in HIGH_VALUE_ACTIVE_FILES:
        return []

    findings: list[Finding] = []
    for fact_name, pattern in REQUIRED_ACTIVE_FACTS.items():
        if not re.search(pattern, text, flags=re.IGNORECASE):
            findings.append(
                Finding(
                    file=rel_path,
                    line=0,
                    category=f"missing_current_fact::{fact_name}",
                    severity="review",
                    match=pattern,
                    context="Important current doctrine/fact not found in this active target file.",
                )
            )
    return findings


def write_csv(output_base: Path, findings: list[Finding], summaries: list[dict[str, object]]) -> None:
    findings_path = output_base.with_name(output_base.name + "_findings.csv")
    summary_path = output_base.with_name(output_base.name + "_summary.csv")

    with findings_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["file", "line", "category", "severity", "match", "context"],
        )
        writer.writeheader()
        for finding in findings:
            writer.writerow(asdict(finding))

    fieldnames = sorted({key for row in summaries for key in row.keys()})
    preferred = ["file", "status", "legacy_hits", "current_hits"]
    fieldnames = preferred + [name for name in fieldnames if name not in preferred]

    with summary_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in summaries:
            writer.writerow(row)


def write_markdown(output_path: Path, findings: list[Finding], summaries: list[dict[str, object]]) -> None:
    by_status: dict[str, list[dict[str, object]]] = {}
    for row in summaries:
        by_status.setdefault(str(row["status"]), []).append(row)

    def count(status: str) -> int:
        return len(by_status.get(status, []))

    lines: list[str] = []
    lines.append("# QiAccess Docs Alignment Audit")
    lines.append("")
    lines.append(f"Generated: `{datetime.now().isoformat(timespec='seconds')}`")
    lines.append(f"Root: `{DOCS_ROOT}`")
    lines.append("")
    lines.append("## Summary")
    lines.append("")
    lines.append(f"- Files scanned: **{len(summaries)}**")
    lines.append(f"- Likely stale files: **{count('likely_stale')}**")
    lines.append(f"- Mixed review files: **{count('mixed_review')}**")
    lines.append(f"- Current/aligned files: **{count('current_or_aligned')}**")
    lines.append(f"- Reference/audit files: **{count('reference_or_audit')}**")
    lines.append(f"- Neutral/unknown files: **{count('neutral_or_unknown')}**")
    lines.append(f"- Total findings: **{len(findings)}**")
    lines.append("")

    lines.append("## Highest Priority Active Review Files")
    lines.append("")
    priority = [
        row for row in summaries
        if row["status"] in {"likely_stale", "mixed_review"}
    ]
    priority = sorted(
        priority,
        key=lambda row: (
            0 if row["status"] == "likely_stale" else 1,
            -int(row["legacy_hits"]),
            int(row["current_hits"]),
            str(row["file"]),
        ),
    )[:50]

    lines.append("| File | Status | Legacy Hits | Current Hits |")
    lines.append("|---|---:|---:|---:|")
    for row in priority:
        lines.append(
            f"| `{row['file']}` | {row['status']} | {row['legacy_hits']} | {row['current_hits']} |"
        )
    lines.append("")

    lines.append("## High-Value Active File Status")
    lines.append("")
    lookup = {row["file"]: row for row in summaries}
    lines.append("| File | Status | Legacy Hits | Current Hits |")
    lines.append("|---|---:|---:|---:|")
    for file in HIGH_VALUE_ACTIVE_FILES:
        row = lookup.get(file)
        if row:
            lines.append(
                f"| `{file}` | {row['status']} | {row['legacy_hits']} | {row['current_hits']} |"
            )
        else:
            lines.append(f"| `{file}` | missing | 0 | 0 |")
    lines.append("")

    lines.append("## Findings")
    lines.append("")
    for finding in findings[:300]:
        line_ref = f":{finding.line}" if finding.line else ""
        lines.append(f"### `{finding.file}{line_ref}`")
        lines.append("")
        lines.append(f"- Severity: `{finding.severity}`")
        lines.append(f"- Category: `{finding.category}`")
        lines.append(f"- Match: `{finding.match}`")
        lines.append("")
        lines.append("> " + finding.context.replace("\n", " "))
        lines.append("")

    if len(findings) > 300:
        lines.append(f"_Showing first 300 findings out of {len(findings)}. See CSV for full detail._")
        lines.append("")

    output_path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    if not DOCS_ROOT.exists():
        raise SystemExit(f"Docs root does not exist: {DOCS_ROOT}")

    AUDIT_OUT.mkdir(parents=True, exist_ok=True)

    files = sorted(path for path in DOCS_ROOT.rglob("*") if should_scan(path))

    findings: list[Finding] = []
    summaries: list[dict[str, object]] = []

    for path in files:
        rel_path = normalized_rel(path)
        text = read_text(path)
        lines = text.splitlines()

        summaries.append(classify_file(rel_path, text))
        findings.extend(scan_line_patterns(rel_path, lines, LEGACY_PATTERNS, "legacy_review"))
        findings.extend(scan_line_patterns(rel_path, lines, CURRENT_PATTERNS, "current_marker"))
        findings.extend(missing_required_facts(rel_path, text))

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_base = AUDIT_OUT / f"docs_alignment_audit_{timestamp}"

    write_csv(output_base, findings, summaries)
    write_markdown(output_base.with_suffix(".md"), findings, summaries)

    print("Audit complete.")
    print(f"Files scanned: {len(summaries)}")
    print(f"Findings: {len(findings)}")
    print(f"Markdown report: {output_base.with_suffix('.md')}")
    print(f"Findings CSV: {output_base.with_name(output_base.name + '_findings.csv')}")
    print(f"Summary CSV: {output_base.with_name(output_base.name + '_summary.csv')}")


if __name__ == "__main__":
    main()
