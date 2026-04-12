# Dev Folder Rules

This folder exists for non-authoritative development support material.

## Allowed Content

- IDE notes
- scratch docs
- temporary planning
- decision drafts
- prompts
- implementation notes
- local experiments
- work-in-progress thoughts

## Not Allowed

Do not treat anything in `dev/` as production truth.

Authoritative material belongs in:

- `contracts/`
- `docs/`
- `schemas/`
- `config/`

## Intent

The purpose of `dev/` is to keep temporary thought debris out of the root and out of authoritative repo surfaces.

## Roadmap & TODO (v1 -> v2)

### Phase 1: Identity & Dedup (DONE ✅)

- [x] Initial repo structure and contracts.
- [x] SHA-256 hashing and exact duplicate detection.
- [x] Sequential QDOC identity assignment.
- [x] Canonical renaming and manifest logging (CSV/JSONL).
- [x] File staging and quarantine.

### Phase 2: Paperless Integration (IN PROGRESS 🏗️)

- [x] Create `contracts/handoff_contract.md`.
- [x] Create `docs/paperless_integration.md`.
- [x] Implement initial `scripts/ops/handoff_to_paperless.py`.
- [x] Create `deploy/paperless/Dockerfile` for Railway deployment.
- [x] Create `docs/railway_deployment.md` with variable mapping.
- [ ] Connect `data/01_STAGED/` to Paperless-ngx consume directory (via Docker mount).
- [ ] Deploy the Paperless service on Railway.
- [ ] Verify OCR and metadata indexing in Paperless.

### Phase 3: Metadata Enrichment

- [ ] Implement `slug_utils` refinement (better title extraction).
- [ ] Add basic date inference (extracting date from filename if present).
- [ ] Multi-format support (PNG, JPG, TIFF).
- [ ] Basic auto-tagging based on folder/source hints.

### Phase 4: Reliability & Ops

- [ ] Makefile automation for the full cycle.
- [ ] Health monitoring script.
- [ ] Backup/Export automation.

## Promotion Rule

If something in `dev/` becomes stable and important, promote it into the correct authoritative location.
