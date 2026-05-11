---
title: "Gina Memory Spec"
slug: gina_memory_spec
qi_decimal: 04.10.00-SYS
realm: QiSystem
owner: Gina
tags: [spec, memory, qinote, qinodes, rag, architecture]
version: 0.2.0
status: active
---

# Gina Memory Spec

## 1. Purpose

Gina's "memory" is **not** a separate database.

Gina's memory *is* the QiNote graph:

- Every memory is a QiNode.
- Every QiNode (user or Gina) shares the **same schema** and **same vector index**.
- Retrieval is always unified: no separate "memory mode" or "notes mode."

This spec defines:

1. Memory types  
2. Memory system codes (Memory-*)  
3. How Gina **writes** memory  
4. How Gina **reads** memory  
5. Worker helpers and contracts  

---

## 2. Core principles

1. **Gina = the database**  
   No separate memory store. No shadow DB. No "special" table.  
   Gina's memory is just QiNodes with specific metadata conventions.

2. **All nodes are equal**  
   - Same QiNode shape  
   - Same chunking  
   - Same embeddings  
   - Same RAG index

3. **Automatic retrieval**  
   - All RAG queries pull from:
     - User-created nodes
     - Gina-created Memory-* nodes  
   - No separate "use memory" prompts. Memory is always part of context.

4. **Memory hygiene over hoarding**  
   - Prefer **updating** existing memory nodes over creating duplicates.
   - Use `Memory-Fact` / `Memory-Plan` as *canonical* references.
   - Event & Insight can accumulate, but still dedup obvious spam.

5. **Explicit, typed memory**  
   - Every Gina memory is tagged with:
     - A Memory-* system code (10–15)
     - `app_id = "Gina"`
     - `meta.gina.*` fields describing type, confidence, source

---

## 3. Memory types & system codes

System codes are shared between docs and app code.

### 3.1 System code table

| System       | Code | Purpose                                                    |
|--------------|------|------------------------------------------------------------|
| Core-Sys     | 01   | Core system / root spec / core protocols                  |
| …            | 02–09| Existing systems (see QiD Spec)                            |
| Memory-Fact  | 10   | Stable facts (prefs, identities, attributes)              |
| Memory-Event | 11   | Summarized episodes (AES saga, repossession, key episodes)|
| Memory-Insight | 12 | Patterns & interpretations (triggers, behavior patterns)  |
| Memory-Plan  | 13   | Multi-step plans, roadmaps, sequences                     |
| Memory-Link  | 14   | Cross-links / semantic graph edges                        |
| Memory-Config| 15   | Internal Gina config, switches, sync status, flags        |

> **QiD note:** Error messages and validation must reflect range **01–15** now.

---

### 3.2 Memory types: semantics

#### Memory-Fact (10)

- "Things that are true *until proven otherwise*."
- Examples:
  - User's legal name, pronouns, timezone, address
  - Client's company name, entity type, tax year scope
  - Persistent preferences (language, style, tools)

Use when:
- The info should override older conflicting info.
- Gina will rely on it frequently.

Update rule:
- One canonical node per subject + category when possible.
- New info → update existing node instead of spawning a new one.

---

#### Memory-Event (11)

- "Snapshot of what happened & why it matters."
- Examples:
  - AES power saga summary
  - Tesla repossession story summary
  - Key immigration meeting recap

Use when:
- A conversation or sequence contains multiple messages but needs a single handle.
- You want a referencable summary for future context.

Update rule:
- Append new event nodes over time.  
- Rarely overwritten; occasionally merged if clearly duplicate.

---

#### Memory-Insight (12)

- "Pattern detected / interpretation."
- Examples:
  - "User tends to overload themselves on cross-project days."
  - "Client Z tends to delay providing documents until a deadline is near."
  - "This repo pattern keeps breaking Q's brain; suggest standard tree."

Use when:
- Gina infers a *pattern* or *meta lesson* from repeated behavior.

Update rule:
- Prefer *refining* existing insights over spraying many vague ones.
- Link insights to:
  - Facts they depend on
  - Events that illustrate the pattern

---

#### Memory-Plan (13)

- "A structured multi-step intention."
- Examples:
  - QiNote rollout phases
  - Immigration binder pipeline
  - AES power-usage reduction plan
  - "Job search app MVP" checklist

Use when:
- There is a clear "steps" sequence or roadmap.
- Gina will need to track progress or remind the user.

Update rule:
- Plans evolve. Update the same node where possible:
  - Add step status
  - Add `meta.gina.progress`
  - Add completion timestamps

---

#### Memory-Link (14)

- "Graph edges with intent."
- Purpose:
  - Explicit semantic relationships:
    - event → plan
    - fact → insight
    - client → immigration project
    - repo → project area

Use when:
- Two or more nodes should be discoverable as a cluster.
- You want RAG to pull them together as a package.

Shape:
- Usually a tiny node:
  - source_qid
  - target_qid
  - relation type (e.g. "supports", "causes", "is_about", "alternate_view")

---

#### Memory-Config (15)

- "Internal knobs and switches for Gina."
- Examples:
  - Embedding backfill status
  - Which Realms/Orbits are indexed or excluded
  - Disabled features / experimental flags
  - System-level preferences for RAG (top_k, filters)

Use when:
- Config affects how Gina *behaves* or *retrieves*, not user content.

> These nodes are not user-facing content, but still QiNodes for uniformity.

---

## 4. Memory QiNode shape

All Gina memory nodes are standard QiNodes with `app_id = "Gina"` and a `meta.gina` block.

### 4.1 Core shape

Required fields (conceptual):

```ts
type GinaMemoryMeta = {
  gina: {
    type: "fact" | "event" | "insight" | "plan" | "link" | "config";
    system_code: number;          // 10–15
    confidence: number;           // 0–1
    source: "chat" | "import" | "worker" | "manual";
    source_ref?: string;          // message id, file, task, etc
    created_by: "Gina" | "User";
    updated_at?: string;          // ISO datetime
    tags?: string[];
  };
  // Normal QiNode meta fields continue here...
};
```

Key conventions:

* `app_id = "Gina"` for all Gina-written memories.
* `system_code` must match Memory-* assignment:
  * 10 → fact
  * 11 → event
  * 12 → insight
  * 13 → plan
  * 14 → link
  * 15 → config
* `confidence`:
  * `>= 0.8` → strong
  * `0.5–0.79` → tentative, mention as "likely"
  * `< 0.5` → avoid using unless explicitly queried

---

## 5. When Gina writes memory

### 5.1 Automatic write triggers

Gina should create/update memory when:

1. **New stable fact appears**
   * Example: "My AES provider is AES Indiana and my address is X."
   * Action:
     * Upsert `Memory-Fact` for that entity.

2. **Long-running saga gains new chapter**
   * Example: another AES update, immigration milestone, repossession status.
   * Action:
     * Update existing Event node or create a new one linked to the saga.

3. **Recognizable pattern emerges**
   * Example: repeated ADHD planning struggles with location/visualization.
   * Action:
     * Create or refine `Memory-Insight`.

4. **Explicit multi-step plan is defined**
   * Example: "Let's build the job app in 3 phases: schema, UI, Supabase."
   * Action:
     * Create/update `Memory-Plan`.

5. **Strong cross-link is needed**
   * Example:
     * A node describes Zai's immigration case.
     * Another describes his job search.
   * Action:
     * Create `Memory-Link` connecting them.

6. **System behavior toggles**
   * Example: enabling/disabling Realms, rollout of new vector index.
   * Action:
     * Create/update `Memory-Config`.

### 5.2 Write hygiene rules

* Before `createGinaMemory()`:
  * `findExistingMemoryNode()` must:
    * Match on subject key (e.g. user_id + category + type).
    * Prefer updating over duplicating, especially for facts & plans.
* On updates:
  * Preserve history in `content` or a small change log.
  * Bump `meta.gina.updated_at`.

---

## 6. How Gina reads memory

### 6.1 Retrieval

All semantic search / RAG queries must:

* Include both:
  * User-created nodes
  * Gina-created Memory-* nodes
* Apply Realm/Orbit filters where relevant.

Logic:

```text
query → chunk index (user + Gina) → top_k → rerank → synthesize
```

Workers **must not** special-case memory collections.

Memory is discovered by content, not by table separation.

### 6.2 Usage rules

When Gina answers:

* Facts:
  * Treat `Memory-Fact` with high confidence as ground truth
    unless contradicted by newer, explicit user input.
* Events:
  * Use `Memory-Event` to compress history instead of re-deriving it.
* Insights:
  * Use, but express as:
    * "It seems like…" / "Pattern I'm seeing is…"
  * Avoid hard claims when confidence < 0.8.
* Plans:
  * When user asks "what were we doing with X?":
    * Load `Memory-Plan` first, then relevant Events.
* Links:
  * Use `Memory-Link` to pull context clusters (e.g. all Zai immigration nodes).
* Config:
  * Used internally to steer worker behavior (e.g. which Realms are "hot").

---

## 7. Worker helpers

### 7.1 `ginaMemory.ts`

Defines:

* `createGinaMemory(input)`:
  * Build QiNode with `app_id = "Gina"` and `meta.gina.*`.
  * Chunk content.
  * Generate embeddings.
  * Insert into QiNodes + vectors.

* `updateGinaMemory(id, patch)`:
  * Merge updated content + meta.
  * Regenerate chunks/embeddings if content changed.

* `findExistingMemoryNode(criteria)`:
  * Looks up existing memory using:
    * user/client id
    * `meta.gina.type`
    * category (e.g. "timezone", "energy_usage", "immigration_case")
  * Returns matching node or `null`.

Contract:

* Workers must call `findExistingMemoryNode()` before `createGinaMemory()`.

### 7.2 `rag.ts`

* Comment + invariant:
  * All RAG queries **always** include both user + Gina nodes.
  * No separate or special "memory index."

### 7.3 Worker README

Must include:

1. Examples:
   * Creating a Memory-Fact from a chat.
   * Summarizing a long saga into Memory-Event.
   * Creating a Memory-Plan for an app build.
2. Explanation of:
   * Memory-* system codes.
   * `meta.gina` fields.
   * When to update vs create.

---

## 8. Integration: QiD & app code

### 8.1 QiD Spec

* System codes table extended to 10–15 for Memory-*.
* Validation / docs updated so:
  * SystemCode range is **01–15**.
  * Errors mention 01–15, not 01–09.

### 8.2 `systems.ts`

* All 6 Memory-* systems added with:

```ts
isGinaMemory: true;
description: "...";
```

* Used by UI to:
  * Style memory nodes differently if needed
  * Filter them in dev tools or admin views

### 8.3 `utils.ts`

* `SystemCode` type extended to include `10 | 11 | 12 | 13 | 14 | 15`.
* `isValidSystemCode()` checks full 01–15 range.

### 8.4 `qid.ts`

* Error message updated to:
  * "System code must be between 01 and 15."
* Any other references to system range updated.

---

## 9. Testing checklist

1. **SystemCode validity**
   * Try issuing invalid codes (00, 16) → proper error.
   * Use 10–15 → accepted.

2. **Memory creation**
   * Trigger Gina to store:
     * A fact (timezone)
     * An event (AES summary)
     * A plan (job app MVP)
   * Confirm QiNodes created with correct `system_code` and `meta.gina.type`.

3. **Deduplication**
   * Change a fact (new address / new preference).
   * Confirm existing Memory-Fact updates instead of duplicating.

4. **RAG retrieval**
   * Ask question that depends on:
     * Old chat + Memory-Fact.
   * Confirm answer uses saved memory, not guesswork.

5. **Links**
   * Create Memory-Link between:
     * Zai immigration binder
     * Zai personal profile
   * Ask cross-cutting queries and verify both show up in context.

6. **Config impact**
   * Flip some `Memory-Config` flag (e.g. disable a Realm).
   * Confirm RAG respects that choice.

---

## 10. Future extensions

* `meta.gina.priority` to bias retrieval for critical plans.
* "Aging" of events/insights:
  * Decrease weight for very old low-confidence insights.
* Per-client / per-project memory scoping:
  * Realms/Orbits mapped more explicitly into Supabase policies.

---

## 11. Behavioral rules & edge cases

### 11.1 Deduplication strategy

**Rule:** Before creating any Memory-* node, check for existing nodes.

**For Memory-Fact:**
- Match on: `realm` + `orbit` + `category` (e.g. "timezone", "address")
- If found: **UPDATE** existing node
- Exception: Only create new if category is genuinely different (e.g. "work_address" vs "home_address")

**For Memory-Plan:**
- Match on: `realm` + `orbit` + `plan_name` (extracted from title)
- If found: **UPDATE** existing node with new steps/status
- Exception: Only create new if it's a completely different plan

**For Memory-Event:**
- Match on: `realm` + `orbit` + `event_series` (e.g. "AES saga")
- If found within 7 days: **APPEND** to existing node or create linked event
- If found > 7 days old: **CREATE NEW** (new chapter in saga)

**For Memory-Insight:**
- Match on: `realm` + `orbit` + `insight_topic` (e.g. "procrastination pattern")
- If found: **REFINE** existing node (merge patterns, increase confidence)
- Exception: Only create new if topic is genuinely different

### 11.2 Confidence thresholds

**High confidence (≥ 0.8):**
- User explicitly stated fact
- Multiple sources confirm same pattern
- Can be stated as fact: "Your timezone is EST"

**Medium confidence (0.5–0.79):**
- Inferred from behavior
- Single strong signal
- Must be hedged: "It seems like you prefer..."

**Low confidence (< 0.5):**
- Weak signal, single occurrence
- Speculative
- Only use if explicitly queried: "I'm not certain, but..."

### 11.3 Memory aging

**Facts:**
- Never age out (always relevant)
- Update when contradicted

**Events:**
- Weight decreases after 30 days
- Still retrievable but lower priority

**Insights:**
- Low confidence (< 0.5) age out after 90 days
- High confidence (≥ 0.8) persist indefinitely
- Medium confidence reviewed every 60 days

**Plans:**
- Active plans (recent updates) always high priority
- Stale plans (> 90 days no updates) lower priority
- Completed plans archived but still searchable

### 11.4 Spam prevention

**Maximum nodes per trigger:**
- Single conversation end: Max 3 new memory nodes
- Fact updates: Max 1 per category
- Event creation: Max 1 per saga per day

**Merge rules:**
- If 3+ similar insights exist: Merge into one canonical insight
- If 2+ events describe same episode: Merge with timestamps

**Quality gates:**
- Memory node must have:
  - Non-empty `title`
  - Non-empty `body` (or `meta.gina.source_qids` for links)
  - Valid `system_code` matching `meta.gina.type`
- Reject if:
  - Title is generic ("Note", "Memory", "Fact")
  - Body is < 10 characters
  - Confidence is 0 (uncertainty)

### 11.5 Update vs create decision tree

```
Is this a Memory-Fact or Memory-Plan?
  YES → findExistingMemoryNode() → UPDATE if found
  NO → Continue

Is this a Memory-Event?
  YES → findExistingMemoryNode() within 7 days → APPEND if found
  NO → Continue

Is this a Memory-Insight?
  YES → findExistingMemoryNode() → REFINE if found
  NO → Continue

Is this a Memory-Link?
  YES → Check if link already exists → SKIP if found
  NO → Continue

Is this a Memory-Config?
  YES → findExistingMemoryNode() → UPDATE if found
  NO → Continue

All else → CREATE NEW
```

---

## 12. Enforcement

This spec is **enforceable** through:

1. **Type system:** `SystemCode` type only allows 01–15
2. **Validation:** `isValidSystemCode()` rejects invalid codes
3. **Worker contracts:** `findExistingMemoryNode()` must be called before `createGinaMemory()`
4. **RAG invariant:** All queries include user + Gina nodes (no special paths)
5. **Testing:** Checklist in Section 9 must pass

**Violations:**
- Creating memory without checking for existing → violates hygiene rule
- Using separate "memory index" → violates unified retrieval principle
- Creating duplicate facts → violates deduplication strategy

---

**This spec makes the unified brain enforceable, not just philosophical.**
