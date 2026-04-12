# Status Contract

## Purpose

This contract defines the allowed document processing statuses and the rules governing their transitions.

## Allowed Statuses

| Status | Definition |
| :--- | :--- |
| `inbox` | File detected in the inbox, no processing started. |
| `staged` | Hashed, ID assigned, renamed, and logged in manifest. Local processing complete. |
| `duplicate` | File matches an existing SHA-256 hash. Halted. |
| `review` | Failed automated classification or requires human intervention. |
| `upload_pending` | Unique and staged, awaiting API handoff to Paperless. |
| `uploaded` | Confirmed successful receipt by Paperless API. |
| `indexed` | Verified as OCR'd and searchable in Paperless (verified via API). |
| `error` | Processing or transmission failed unexpectedly. |

## Transition Rules

1. **New File**: `inbox` -> `staged` (or `duplicate`).
2. **Post-Identity**: `staged` -> `upload_pending`.
3. **Transmission**: `upload_pending` -> `uploaded`.
4. **Archival**: Upon reaching `uploaded`, the file may be moved to the Drive archive path.
5. **Exceptions**: Any stage can move to `error` or `review` if a contract is violated.

## Persistence

Status must be recorded in the persistent QiArchive manifest. The status in the manifest is the **authoritative state** of the document within the pipeline.
