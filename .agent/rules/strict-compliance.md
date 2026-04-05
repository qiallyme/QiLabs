---
trigger: always_on
---

# strict-compliance

# QIOS_GLOBAL_ENFORCEMENT_MODE

You are operating inside the QiOS architecture. This is not a normal codebase. It is a governed system with constitutional doctrine.

Before ANY planning, code generation, schema design, refactor, or architectural suggestion, you MUST perform a doctrine alignment step.

━━━━━━━━━━━━━━━━━━━━━━━
MANDATORY DOCTRINE REVIEW
━━━━━━━━━━━━━━━━━━━━━━━

You MUST review the following blueprint files before taking action:

CORE GOVERNANCE (REQUIRED EVERY TIME):
- ./__QiOS_Master_Blueprint_v0.4/docs/01_governance/policies.md
- ./__QiOS_Master_Blueprint_v0.4/docs/01_governance/standards.md
- ./__QiOS_Master_Blueprint_v0.4/docs/03_structure/placement_rules.md
- ./__QiOS_Master_Blueprint_v0.4/docs/04_data/schema.md

CONTEXTUAL DOCTRINE (LOAD BASED ON TASK TYPE):

If task involves STRUCTURE / OBJECTS:
- docs/03_structure/object_model.md
- docs/04_data/objects.md

If task involves DATA / STORAGE:
- docs/04_data/storage.md
- docs/04_data/metadata.md

If task involves PIPELINES / INGESTION / AUTOMATION:
- docs/05_compute/pipelines.md
- docs/05_compute/integrations.md
- docs/05_compute/workers.md

If task involves SYSTEM DESIGN / CROSS-DOMAIN:
- docs/02_architecture/*
- docs/01_governance/decisions.md

If task affects HISTORY OR RULES:
- docs/appendices/changelog.md
- docs/adr/

You may NOT proceed without grounding in these.

━━━━━━━━━━━━━━━━━━━━━━━
NON-NEGOTIABLE QIOS LAWS
━━━━━━━━━━━━━━━━━━━━━━━

You MUST enforce these at all times:

1. 3-BAND MODEL
   - Core → Platform → Domain only
   - No reverse dependency
   - No band leakage

2. SINGLE DOMAIN RULE
   - Every object has ONE canonical home
   - If unclear → STOP and escalate

3. NO DOMAIN LOGIC IN public SCHEMA
   - public = auth-adjacent / global only
   - NEVER place domain tables here

4. TENANT ISOLATION IS MANDATORY
   - Every domain table MUST include tenant_id
   - RLS is NOT optional

5. SPINE-FIRST INGESTION
   - NOTHING becomes canonical without QiArchive registration
   - No direct writes to final tables from UI or integrations

6. DERIVED ≠ TRUTH
   - AI, vector, graph, exports are downstream ONLY
   - They NEVER define canonical state

7. NO PARALLEL SYSTEMS
   - No duplicate schemas
   - No shadow pipelines
   - No second source of truth

8. SCHEMA AUTHORITY
   - Supabase migrations are canonical
   - Docs describe — migrations define truth

━━━━━━━━━━━━━━━━━━━━━━━
PRE-ACTION VALIDATION (REQUIRED)
━━━━━━━━━━━━━━━━━━━━━━━

Before proposing ANY solution, you MUST answer internally:

- What band does this belong to?
- What schema owns this object’s lifecycle?
- Does this require archive_id?
- Does this require tenant_id?
- Is this canonical or derived?
- Does this violate Spine flow?

If ANY answer is unclear → STOP.

━━━━━━━━━━━━━━━━━━━━━━━
OUT-OF-BOUNDS PROTOCOL (HARD STOP)
━━━━━━━━━━━━━━━━━━━━━━━

If your solution violates ANY QiOS law:

DO NOT CONTINUE.

Return:

## 🚨 Out-of-Bounds Alert

1. Deviation
   What exact rule is being broken

2. Ripple-Check
   Impact on:
   - RLS
   - Spine
   - Band model
   - Schema ownership
   - Workers / pipelines

3. Pros & Cons
   Brutally honest tradeoff analysis

4. Approval Request
   Ask user to confirm and run `/update-adr`

NO CODE. NO PARTIAL WORK.

━━━━━━━━━━━━━━━━━━━━━━━
ALLOWED OUTPUT MODES
━━━━━━━━━━━━━━━━━━━━━━━

Depending on task, respond in ONE of these modes:

### MODE 1 — Doctrine Patch
Used for blueprint updates

- Compliance Review
- Patch Plan
- Exact Markdown Changes
- Consistency Check
- Rejected Alternatives

### MODE 2 — Implementation Plan
Used for features

- Domain Placement
- Data Model (schema-aligned)
- Pipeline Flow (Spine-compliant)
- API / Worker Contracts
- Risks

### MODE 3 — Code Generation
ONLY after validation

- Must reference schema + band
- Must respect ingestion flow
- Must NOT invent structure

### MODE 4 — Audit / Review
- Violations found
- Drift detected
- Fix recommendations

━━━━━━━━━━━━━━━━━━━━━━━
REPO-AWARE VALIDATION
━━━━━━━━━━━━━━━━━━━━━━━

Before writing anything, inspect relevant areas:

- /packages/database/src/migrations/
- /packages/database/src/schemas/
- /python_local/
- /workers/
- /apps/
- /packages/

Use repo state for alignment, but:

🚫 NEVER let implementation override doctrine
✅ Blueprint is ALWAYS the authority

━━━━━━━━━━━━━━━━━━━━━━━
SUCCESS CRITERIA
━━━━━━━━━━━━━━━━━━━━━━━

A valid response MUST:

- Preserve single source of truth
- Maintain strict domain ownership
- Respect tenant isolation
- Follow Spine ingestion rules
- Keep derived layers downstream
- Avoid schema drift
- Remain composable across the system

If it “feels clever” but breaks structure → it is wrong.

Prioritize coherence over creativity.