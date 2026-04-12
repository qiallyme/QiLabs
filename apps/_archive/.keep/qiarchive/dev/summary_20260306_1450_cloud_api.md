# QiArchive Development Log: 2026-03-06

## 🚀 Today's Milestones

### 1. Local Agent Reconstruction (`qid.py`)

- **Core Retention**: Pivot confirmed—`qid.py` is the authoritative core of the QiArchive Agent, not a legacy utility.
- **ID Reformatting**: Standardized canonical document IDs to `QDOC-YYYY-NNNNNN` (e.g., `QDOC-2026-000003`).
- **DOC Band**: Activated the `2,000,000 - 2,999,999` range for document-specific allocations.

### 2. Implementation of Helper Modules (`app/agent/`)

- **`hasher.py`**: Reliable SHA-256 fingerprinting for deduplication.
- **`paperless_upload.py`**: Standard-library (`urllib`) based upload bridge to Paperless-ngx on Railway.
- **`file_router.py`**: Handles physical file movement on the mounted G: drive into buckets (`10_ARCHIVE_UPLOADED`, `20_DUPLICATES`, `30_REVIEW`).
- **`watcher.py`**: Monitors inbox for new arrivals and ensures file stability before processing.
- **`doc_ids.py`**: Canonical formatting and parsing for QDOC identifiers.

### 3. Local Operational Setup

- **`.env` Integration**: Wired all folder paths and API tokens to environment variables.
- **G: Drive Compatibility**: Configured paths to work with locally mounted Google Drive:
  - `G:\My Drive\QiArchive\00_INBOX`
  - `G:\My Drive\QiArchive\10_ARCHIVE_UPLOADED`
  - etc.

### 4. Verification & Smoke Testing

- **`smoke_test.py`**: Created a robust end-to-end test script.
- **Verified Success Paths**: Confirmed local file drop -> Hash -> ID -> Rename -> Paperless Upload -> Archival.
- **Verified Fail/Duplicate Paths**: Confirmed routing to `20_DUPLICATES` and `30_REVIEW` buckets.

### 5. Cloud Sync Plane Scaffold (`apps/api/`)

- **FastAPI Backend**: Scaffolded a thin cloud engine to serve as the global ledger and sync plane.
- **Postgres Models**: Defined `Document` and `DocumentEvent` models for tracking state history.
- **Railway Readiness**: Created deployment guides and documentation for the cloud API standing up.

## 📍 Current State

- **Local Agent**: Functional and ready for production ingest.
- **Cloud API**: Scaffolded and ready for Railway deployment.
- **Documentation**: Updated architecture, workflow, and status models to reflect the local-first "Agent" reality.

## ⏭️ Next Actions

1. Deploy `qiarchive-postgres` and `qiarchive-api` on Railway.
2. Wire the Local Agent to sync events to the Cloud API.
3. Stand up the minimal management dashboard summary.
