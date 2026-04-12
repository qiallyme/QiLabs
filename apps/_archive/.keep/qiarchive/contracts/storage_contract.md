# Storage Contract

## Purpose

This contract defines the storage responsibilities, data locations, and source-of-truth logic for the QiArchive ecosystem.

## Layer Responsibilities

### 1. Google Drive (Intake & Archive)

Google Drive is the **long-term blob store** and **external intake layer**.

- **Role**: Capture, Intake (Inbox), and Permanent Archive (Backup).
- **Not a Runtime Volume**: Google Drive is NOT used as a mounted volume for the QiArchive control plane or Paperless.
- **Archive Policy**: Successful ingestion results in a canonical copy being moved to `QiArchive/10_ARCHIVE_UPLOADED`.

### 2. QiArchive (Cloud Engine & Console)

QiArchive is the **identity and state authority**.

- **Role**: Cloud-native orchestration, QDOC ID assignment, Renaming, Manifesting, Dashboard API.
- **Components**:
  - **Engine**: The background service for file processing and handoff.
  - **Console**: Lightweight PWA/Dashboard for pipeline visibility.
- **Storage**: Uses **QiArchive Postgres** as the authoritative status ledger (The Manifest).
- **Not a Blob Store**: QiArchive does not act as the long-term storage for document binaries; it delegates to Google Drive and Paperless.

### 3. Paperless on Railway (Active Repository)

Paperless is the **search and indexing engine**.

- **Role**: Active OCR, Full-text search, Previews, and operational UI.
- **Storage**: Stores the active, searchable copy in its mounted Railway volume.
- **Not the Sole Truth**: The Railway volume is a high-availability active repo, but identity and backup remain with QiArchive and Google Drive.

## Source of Truth Rules

- **Identity**: QiArchive (the manifest) is the source of truth for `QDOC` identity and hash mapping.
- **Binary Persistence**: Google Drive (`10_ARCHIVE_UPLOADED`) is the primary source of truth for long-term binary preservation.
- **Search Content**: Paperless is the source of truth for extracted text and OCR data.

## Retention Policy

- Files in `00_INBOX` are transient.
- Files in `10_ARCHIVE_UPLOADED` are permanent.
- Files in Railway volume are managed as an active working set.
- Manifests must be backed up independently.
