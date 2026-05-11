# Implementation Notes - v1 (Identity & Dedup)

## Current Status

v1 is fully functional and verified with a 4-file reality check.

## Key Logic

- **Orchestrator**: `scripts/ingest/main.py`
- **Identity Assignment**: IDs are sequential `QDOC-2026-NNNNNN` based on the current manifest content.
- **Deduplication**: SHA-256 fingerprinting. Exact matches are moved to `data/20_QUARANTINE/` and logged in `dedupe_report.csv`.
- **Naming**: `QDOC-YYYY-NNNNNN__slug__undated.pdf`. Slugs are derived from filename stems, lowercased, and underscored.
- **Staging**: Processed files land in `data/01_STAGED/` before they are handed off to Paperless.
- **Logging**: Dual-format manifest (CSV + JSONL) for maximum portability and developer visibility.

## Known Limitations (for v2+)

- **Extensions**: Currently PDF only in the orchestrator check.
- **Date Inference**: Hardcoded as `undated`.
- **Metadata**: Title is based on original filename stem before slugification.
- **ID Persistence**: If the manifest is deleted, the ID sequence restarts at 000001 (unless `START_ID` is set in `.env`).

## Reality Check Log (2026-03-06)

- [x] Unique files assigned sequential IDs.
- [x] Duplicate bytes detected -> Quarantined -> Mapped correctly.
- [x] Unsupported types ignored.
- [x] Staged paths match naming contract.
