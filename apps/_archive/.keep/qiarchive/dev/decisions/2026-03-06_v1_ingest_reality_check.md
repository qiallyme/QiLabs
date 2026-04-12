# v1 Ingestion Reality Check

## Date: 2026-03-06

## Status

Verified SUCCESS.

## Core Objective

Prove that the identity-first ingestion pipeline works without errors for basic document operations.

## Test Procedure

1. **Test Case 1 (Unique)**: `alpha.pdf` (Valid PDF)
2. **Test Case 2 (Unique)**: `bravo.pdf` (Different PDF)
3. **Test Case 3 (Duplicate)**: `alpha_copy.pdf` (Exact byte-for-byte duplicate of `alpha.pdf`)
4. **Test Case 4 (Unsupported)**: `ignore_me.txt` (Text file)

## Expected Behavior

- `alpha.pdf` and `bravo.pdf` should be assigned sequential IDs (QDOC-2026-000001 and 02).
- `alpha_copy.pdf` should be identified as a duplicate and moved to quarantine without a new ID assigned.
- `ignore_me.txt` should remain in the inbox (skipped).
- All processed files should land in `data/01_STAGED/` with canonical names `{doc_id}__{slug}__undated.pdf`.
- Manifest, JSONL, Rename Map, and Dedupe reports should all be updated.

## Actual Results

- **Outcome**: All behaviors match expectations perfectly.
- **Processed**: 2 files (`alpha`, `bravo`) land in `01_STAGED`.
- **Deduplicated**: 1 file (`alpha_copy`) land in `20_QUARANTINE`.
- **Skipped**: 1 file (`ignore_me.txt`) remained in `00_INBOX`.
- **Consistency**: Manifest row counts and JSONL lines are in sync.

## v1 Scope Boundary

- **In-Scope**: Identity (QDOC), SHA-256 Dup Check, Renaming, Manifesting, Staging.
- **Out-of-Scope**: OCR, Paperless API, metadata inference, date extraction, cloud sync, UI/Frontend.

## Conclusion

The architecture is now "real." We have successfully separated the **Identity/Authority Layer** from the downstream processing engine.
