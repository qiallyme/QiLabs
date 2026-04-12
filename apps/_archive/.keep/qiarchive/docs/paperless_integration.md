# Paperless Integration Guide

## The Role of Paperless-ngx

In the QiArchive architecture, Paperless-ngx serves as the **Active Engagement Layer**. It is NOT the source of document identity, but the engine that makes those identities searchable.

* **Host**: Railway (managed Cloud).
* **Databases**: PostgreSQL (managed), Redis (managed).
* **Persistence**: Railway Volume mounted at `/paperless`.

## Integration Mechanism: API Upload

We use the Paperless REST API as the sole bridge for document ingestion.

### Why API vs. Volume Handoff?

* **Stability**: API calls provide immediate success/failure feedback (HTTP 201 vs. 500).
* **Decoupling**: The **QiArchive Engine** (Cloud) doesn't need to know about the Railway file system layout for Paperless.
* **Identity Sync**: We send the `QDOC` ID as the document title during upload, creating an immediate, searchable link between the manifest and the engine.

## Authenticating

* Integration is secured via a **Token-based Authorization** header.
* Token is generated in the Paperless Admin UI.

## Proven Capabilities

As of **2026-03-06**, the following have been successfully verified:

* [x] Paperless running on Railway with separate Postgres/Redis.
* [x] Manual upload and OCR of QDOC-formatted files.
* [x] API connectivity via Python `requests` library.
* [x] Successful mapping of Railway service variables to Paperless requirements.

## Current Limitations

* **Tag Sync**: Currently, tags are assigned manually in Paperless; future versions will sync tags from `config/tags_seed.yaml` via API.
* **Correspondent Sync**: Currently manual.
* **Indexing Feedback**: The pipeline pushes to Paperless but does not yet "wait" or "verify" when a document has completed OCR/indexing.
