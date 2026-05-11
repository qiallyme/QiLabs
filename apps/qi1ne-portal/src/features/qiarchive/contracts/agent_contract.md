# Agent Operating Contract

## Overview

The **QiArchive Agent** (based on `qid.py`) is the primary local runtime responsable for the document-ingestion pipeline. It serves as the bridge between the local/mounted Google Drive filesystem and the downstream Paperless search repository.

## Responsibilities

1. **Discovery**: Local folder watching (`watcher.py`) with file stability checks.
2. **Identification**: SHA-256 hashing (`hasher.py`) and ID allocation via `qid.py`.
3. **Registry**: Management of the local document ledger (`_qid_registry.json`).
4. **Resiliency**: WAL (Write-Ahead-Log) indexing and rolling backups of the registry.
5. **Handoff**: Pushing documents to Paperless-ngx API (`paperless_upload.py`).
6. **Archival**: Routing files to the correct Drive folders (`file_router.py`).
7. **Visibility**: CLI output and minimal desktop UI for system status.

## Data Integrity

- **Root IDs**: Canonical IDs follow the `DOC` band (2,000,000 - 2,999,999).
- **External Format**: `QDOC[YYYY-]#######`.
- **Deduplication**: SHA-256 hashes are the source of truth for uniqueness.
- **Fail-Safe**: Documents are only moved to `10_ARCHIVE_UPLOADED` after the Paperless API returns success.

## Local Filesystem Assumptions

- **Inbox**: Configurable local directory (typically `00_INBOX` on mounted Drive).
- **Archive**: Folder for successfully uploaded documents (`10_ARCHIVE_UPLOADED`).
- **Duplicates**: Folder for redundant files (`20_DUPLICATES`).
- **Review**: Folder for malformed or ambiguous files (`30_REVIEW`).
- **Persistence**: Registry and logs are kept in `app/agent` or configurable local paths.

## Contract Compliance

The Agent must ensure:

1. No document is processed twice.
2. Every document receives a unique QDOC ID.
3. Every document uploaded to Paperless is properly archived locally.
4. All errors are logged to `_logs/` for future audit.
