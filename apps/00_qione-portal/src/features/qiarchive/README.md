# QiArchive

QiArchive is a **cloud-native document orchestrator, identity layer, and management console**.

It transforms document handling into a disciplined infrastructure pipeline, acting as the high-integrity bridge between capture (Google Drive) and search (Paperless-ngx).

## The QiArchive Agent

QiArchive is built around a **local-first portable agent** (`qid.py`) that handles document identity and ingestion.

1. **The Agent**: A local core (`qid.py`) that manages hashing, IDs, and ingestion as the authoritative engine.
2. **The Console**: (Coming soon) A thin management dashboard for pipeline visibility across machines.
3. **The Ledger**: A centralized registry tracking the canonical state of every document.

## System Roles

- **QiArchive Agent (Control Plane)**: The local identity and state authority (based on `qid.py`). Assigns `QDOC` IDs.
- **Google Drive (Storage Plane)**: The intake (`00_INBOX`) and backup (`10_ARCHIVE_UPLOADED`) layer, typically accessed via local mount.
- **Paperless-ngx (Discovery Plane)**: The OCR, search, and indexing repository hosted on Railway.

## Core Principles

- **Identity-First** — Documents are identified and named *before* entering search engines.
- **Local-First Processing** — High-integrity ingestion via a portable local runtime (logs/WAL/backups).
- **Mounted Drive Model** — Uses local filesystem mounts for simplicity and reliability.
- **Visibility-Driven** — Real-time tracking of every document from inbox to indexed state.

## High-Level Architecture

```text
Capture (Local Mount) → QiArchive Agent (qid.py) → Paperless (Railway)
```

## Current Project Status

- **v1 Ingest Core**: Robust local logic for hashing, ID assignment, and manifest tracking based on `qid.py`.
- **Infrastructure**: Paperless-ngx is operational on Railway and manual processing works.
- **Next Phase (Agent v1.1)**:
  - Extending `qid.py` with helper modules (`watcher`, `hasher`, `uploader`, `router`).
  - Automating the **Drive → Agent → Paperless** ingestion flow.
  - Standing up a thin **QiArchive Cloud API** for multi-machine ledger sync.

## Postponed Features

To ensure the stability of the core pipeline, the following are explicitly out of scope for the current MVP:

- AI-driven metadata extraction (metadata guessing).
- RAG / Vector database integration.
- LLM bots or chat interfaces.

---

## Authoritative Repositories

- `contracts/`: Operational rules and storage logic.
- `docs/`: Architecture blueprints and integration guides.

## License

TBD
