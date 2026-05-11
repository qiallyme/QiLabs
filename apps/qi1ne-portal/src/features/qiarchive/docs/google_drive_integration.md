# Google Drive Integration Guide

## Overview

Google Drive serves as the **Capture and Archive Layer** for the QiArchive ecosystem. It is designed for cross-device intake and long-term search-independent storage.

## The Drive Folder Model

QiArchive expects a specific folder structure in Google Drive:

- **`QiArchive/00_INBOX/`**: The drop zone for all new captures (Mobile scans, desktop drops, downloads).
- **`QiArchive/10_ARCHIVE_UPLOADED/`**: The permanent home for files successfully processed and uploaded to Paperless.
- **`QiArchive/20_DUPLICATES/`**: Destination for files identified as exact SHA-256 duplicates.
- **`QiArchive/30_REVIEW/`**: Destination for files requiring manual classification or repair.

## Why Drive is NOT a Runtime Volume

- **Latency**: Direct file operations on Drive are too slow for control plane logic.
- **Stability**: Drive sync can be unpredictable; the control plane needs a stable local or staged file system state.
- **Reliability**: We avoid "split brain" scenarios by keeping the processing state local and using Drive as a handoff/storage target.

## Processing Expectations

### 1. The Intake

Files are retrieved from Drive `00_INBOX` and brought into the QiArchive local processing zone.

### 2. The Archive

Once `uploaded` to Paperless:

- The local `staged` copy is moved or copied to Drive `10_ARCHIVE_UPLOADED`.
- The filename used in Drive is the canonical `QDOC` name.

### 3. The Rejection

Duplicates and Review files are moved back to their respective Drive folders to alert the user without polluting the active staged pipeline.
