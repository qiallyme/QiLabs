# Status Model

## Overview

The status model defines the document lifecycle, managed by the **QiArchive Agent** (`qid.py`) and recorded in the local high-integrity registry.

## Detailed Status Definitions

### `inbox`

The document has been discovered in a capture zone (`00_INBOX`) by `watcher.py` but has not yet been processed.

### `staged`

The document has a SHA-256 fingerprint, a sequential `QDOC` ID, and a canonical filename. It is recorded in the local registry with WAL (Write-Ahead-Log) protection.

### `duplicate`

The document's hash matches an existing registry entry. The file is moved to the duplicate folder via `file_router.py`.

### `review`

The document requires manual oversight (e.g., malformed file). The Agent's UI or logs highlight these for the user.

### `upload_pending` (or `staged`)

The document is unique and assigned an ID, awaiting transmission to the Paperless API via `paperless_upload.py`.

### `uploaded`

The Paperless API has confirmed receipt (202 Accepted). The Agent records the successful handoff in the registry and moves the file to the local Archive.

### `indexed`

Paperless has completed background indexing. The document is verified as searchable in the search UI.

## Transition Flow

```text
Discovery (inbox)
  ↓
Identification (staged)
  ↓
API Handoff (upload_pending -> uploaded)
  ↓
Verification (indexed)
```

## Dashboard Visibility

The **QiArchive Console** provides real-time counts and detail views for documents in every status, allowing the user to manage the health of the entire pipeline.
