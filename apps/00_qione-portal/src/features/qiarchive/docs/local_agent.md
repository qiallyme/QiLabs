# QiArchive Local Agent (`qid.py`)

## The Heart of the Pipeline

The **QiArchive Agent** is a local-first Python service that manages document identity and ingestion. It is extended from the core `qid` utility, preserving its robustness while adding specialized document processing capabilities.

## Architecture

The Agent consists of a core orchestrator and several specialized helper modules:

- **hasher.py**: Computes SHA-256 fingerprints.
- **paperless_upload.py**: Handles the API bridge to the Paperless cloud server.
- **file_router.py**: Manages local file movements on the mounted Drive.
- **watcher.py**: Monitors the inbox and ensures file stability before processing.
- **doc_ids.py**: Formats and parses canonical document identifiers (`QDOC`).

## Core Mechanisms

### 1. Identity Management

The Agent uses the `DOC` band (2,000,000+) to allocate document IDs. It maintains a registry (`_qid_registry.json`) that acts as the authoritative ledger of what has been processed.

### 2. Resiliency

- **WAL (Write-Ahead-Log)**: Every operation is logged to `_wal/` before being committed to the registry.
- **Backups**: Rolling backups are taken during every atomic write operation.
- **Locking**: File-based locking prevents registry corruption during concurrent access.

### 3. Verification

The Agent provides an integrity check (`qid.py verify`) to ensure that files on disk match the registry and that metadata is correctly applied.

## Usage

### CLI Commands

- `python qid.py ui`: Launch the minimal desktop management interface.
- `python qid.py list`: View recently assigned document IDs.
- `python qid.py verify --path [FOLDER]`: Verify the integrity of a folder.

### Configuration

The Agent is configured via environmental variables or a `.env` file:

- `PAPERLESS_URL`: endpoint for the search engine.
- `PAPERLESS_API_TOKEN`: authorization token for uploads.
- `DOC_ID_PREFIX`: defaults to `QDOC`.
