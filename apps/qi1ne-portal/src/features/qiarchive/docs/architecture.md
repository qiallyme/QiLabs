# Architecture Overview

## The Local-First Agent

QiArchive uses a **Local Agent** (`qid.py`) as its authoritative engine. This agent coordinates document identity and state across local storage and cloud services.

```text
Capture Layer (Drive Mount) ↔ QiArchive Agent (qid.py) → Active Repo (Paperless)
```

## The Four Pillars

QiArchive is built on the strict separation of these four entities:

### 1. QiArchive Agent (The Local Engine)

- **Primary Type**: Local-First portable runtime (based on `qid.py`).
- **Responsibilities**:
  - **Monitoring**: Watches the locally mounted `00_INBOX`.
  - **Fingerprinting**: Executes SHA-256 hashing and deduplication.
  - **Identity Authority**: Assigns `QDOC` IDs and manages the registry.
  - **Routing**: Orchestrates file moves to Archive/Duplicate/Review folders.
  - **Handoff**: Pushes documents to the Paperless API using `paperless_upload.py`.
  - **Durable Logging**: Maintains WAL and backups for high-integrity ingestion.

### 2. QiArchive Cloud (The Thin Control Plane)

- **Primary Type**: Cloud API & Ledger Sync.
- **Responsibilities**:
  - **Ledger Sync**: Aggregates registry data from multiple local agents.
  - **Global Visibility**: Provides a thin API for the management dashboard.
  - **External Integrations**: Future home for webhooks and upstream cloud triggers.

### 3. Google Drive (The Durable Storage Layer)

- **Primary Type**: Locally mounted Blob Store / Intake.
- **Responsibilities**:
  - **Capture**: Entry point for scans and uploads.
  - **Archive**: Permanent, searchable-independent backup (`10_ARCHIVE_UPLOADED`).
  - **Mounted Access**: Provides a standard filesystem interface for the local agent.

### 4. Paperless-ngx (The Search Repository)

- **Primary Type**: Active Document Database / OCR Engine.
- **Responsibilities**:
  - **OCR**: Optical character recognition and full-text extraction.
  - **Discovery**: The primary user-facing search and retrieval interface.
  - **Previews**: Generation of thumbnails and optimized web previews.

## Summary Data Flow

1. **Ingress**: File dropped in `Drive/00_INBOX`.
2. **Detection**: **QiArchive Engine** is notified or polls the Drive folder.
3. **Identity**: Engine assigns `QDOC` ID, hashes, and renames in its local processing cache.
4. **Ledger**: Engine records the `staged` state in **QiArchive Postgres**.
5. **Handoff**: Engine `POST`s the file to **Paperless API**.
6. **Archival**: On success, Engine moves the original to `Drive/10_ARCHIVE_UPLOADED`.
7. **Visibility**: **QiArchive Console** reflects the state throughout the process.

## Strategic Boundaries

- **Identity Authority**: QiArchive (The Engine) is the boss of naming.
- **OCR Authority**: Paperless is the boss of text extraction.
- **Archive Authority**: Google Drive is the boss of permanent binary storage.
- **AI/RAG (Postponed)**: Advanced vectorization and LLM workflows will be added as a separate service downstream of the `indexed` state.
