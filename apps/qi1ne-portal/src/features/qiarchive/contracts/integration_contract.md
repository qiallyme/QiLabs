# Integration Contract

## Purpose

This contract defines the communication protocols and integration boundaries between QiArchive, Paperless, and external layers.

## Integration Principles

### 1. QiArchive is Upstream

Paperless is a **downstream consumer** of QiArchive. All documents must be processed by the **QiArchive Engine** (Identity assigned, renamed, manifested) before entering Paperless.

### 2. API-First Handoff

- **Preferred Bridge**: API upload to the Paperless `post_document` endpoint.
- **Why**: Eliminates physical coupling and enables stable **Cloud-to-Cloud** transmission between the QiArchive Engine and the Paperless Repository.
- **Integrity**: Each upload must transmit the `QDOC` ID as the document title or in a way that preserves identity sync.

### 3. Google Drive Integration (Asynchronous)

- **Handoff from Drive**: The **QiArchive Engine** monitored Google Drive `00_INBOX`.
- **Handoff to Drive**: Successful processing triggers the Engine to move/copy the canonical file to the Drive archive folders.
- **Non-Coupling**: The system must not depend on real-time Drive sync for runtime processing state.

### 4. Machine-to-Machine Authority

- No manual uploads to Paperless (Gatekeeper: Engine).
- No manual renaming in Google Drive after ingestion.
- No direct database writes to the Paperless/Postgres instance from the QiArchive Engine.

## Success Conditions

- A handoff is successful if Paperless returns an HTTP 201 Created.
- An archive operation is successful if the file is confirmed in the Drive `10_ARCHIVE_UPLOADED` path.
