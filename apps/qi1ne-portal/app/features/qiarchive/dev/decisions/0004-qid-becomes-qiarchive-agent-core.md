# ADR 0004: qid.py Becomes QiArchive Agent Core

- **Status**: Accepted
- **Date**: 2026-03-06
- **Author**: QiLabs Team

## Context

Initially, QiArchive was evolving toward a "Cloud-First Orchestrator" where the bulk of the logic (ID assignment, hashing, routing) would live in a cloud backend (e.g., a FastAPI/Postgres service on Railway).

However, `qid.py` has proven to be a robust, local-first utility that already handles:
- Local state management
- Sequential ID allocation with bands
- WAL (Write-Ahead Logging) and backups
- File integrity verification
- Minimal desktop UI/CLI

The user has Google Drive mounted locally, making a local-first agent more efficient and reliable than a cloud-to-cloud bridge for v1.

## Decision

We will pivot the architecture to center on `qid.py` as the **QiArchive Agent**.

1.  **qid.py as Core**: `qid.py` is not a legacy tool; it is the runtime core of the QiArchive document pipeline.
2.  **Local Registry**: We will continue using the local JSON/Postgres registry and WAL as the authoritative source of identity.
3.  **Extended Capabilities**: `qid.py` will be extended via helper modules (`hasher`, `paperless_upload`, `file_router`, `watcher`) to perform document processing.
4.  **Google Drive Mounting**: We will rely on the local filesystem (mounted Drive) for intake and archival, avoiding direct Google Drive API calls in Phase 1.
5.  **Downstream Paperless**: Paperless-ngx on Railway remains the OCR/Search plane, and the Local Agent will push documents to it via its API.
6.  **Thin Cloud**: The QiArchive Cloud API will be kept intentionally thin, acting as a ledger sync/dashboard rather than the primary engine.

## Consequences

- Faster development by leveraging existing proven Go/Python local logic.
- Reduced complexity (no direct Drive API / Oauth handling yet).
- High reliability for local processing even with intermittent cloud connectivity.
- Shift in documentation to reflect the Agent-centric model.
