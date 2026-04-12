# Folder Contract

## Purpose

This contract defines the required folder structure and the role of each folder.

## Core Rule

Every document must enter through exactly one inbox folder.

## Working Folders

### `data/00_INBOX/`

Single ingestion gate for new files.

Allowed:

- newly captured files
- downloaded PDFs
- scanned files
- imported documents awaiting processing

Not allowed:

- manually curated archive files
- exports from other folders
- duplicate storage of already archived documents

### `data/01_STAGED/`

Pre-processed documents with assigned `QDOC` identity and canonical filename.

Use for:

- files awaiting final move into Paperless consumption
- audit trail of processed pipeline outputs

Allowed:

- renamed, valid document PDFs
- files mapped in the manifest but not yet fully archived

### `data/10_REVIEW/`

Manual review queue for files requiring intervention.

Use for:

- ambiguous titles
- ambiguous dates
- poor OCR
- unsupported formats
- low-confidence classification

### `data/20_QUARANTINE/`

Files removed from normal flow due to exact duplication, corruption, or errors.

Use for:

- exact duplicates
- malformed files
- processing failures requiring isolation

### `data/30_EXPORTS/`

Generated output for external use.

Use for:

- bundles
- copies for sharing
- generated packages
- non-authoritative output artifacts

### `data/90_MANIFESTS/`

Portable metadata and tracking records.

Use for:

- CSV manifests
- JSONL manifests
- rename maps
- dedupe reports

## Rule of Authority

Paperless-managed storage is system-managed and should not be manually reorganized.

## Rule of Cleanliness

No new top-level operational folders may be introduced without updating this contract first.
