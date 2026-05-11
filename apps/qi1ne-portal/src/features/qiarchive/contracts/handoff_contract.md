# Handoff Contract

## Purpose

This contract defines the transition of documents from the QiArchive authority layer (`data/01_STAGED`) to downstream processing engines (like Paperless-ngx).

## Core Rule

Only documents that have been **identified, renamed, and manifested** by QiArchive are eligible for handoff.

## Rules for Handoff

### 1. Identity Continuity

The filename assigned in `data/01_STAGED` is the **canonical identity**. Downstream tools must NOT rename or modify this filename stem.

### 2. Method (Local vs. Remote)

#### Local Handoff (Model L - Copy)

For local Docker environments, files are **COPIED** from `01_STAGED` to the consumer directory.

#### Remote Handoff (Model R - API)

For cloud-hosted environments (e.g., Railway), files are **POSTED** to the Paperless API (`/api/documents/post_document/`).

The document identity (canonical filename) must be preserved in the `title` parameter or transmitted as the `file` name during the POST request.

### 3. Idempotency

The handoff script should track which files have already been sent to avoid duplicate consumption in the engine. For API handoff, the successful HTTP response (201 Created) serves as the authority for the handoff being complete.

### 4. Integrity

A SHA-256 check should be performed before and after handoff to ensure file integrity was maintained during transport.

### 5. Permissioning

Files in the consumer directory should be given appropriate permissions (e.g., owned by `paperless:paperless`) so they can be processed by the engine without manual intervention.

## Allowed Actions for Engines

Engines (Paperless) are allowed to:

- OCR the content.
- Update internal metadata tags.
- Index for search.
- Create internal thumbnails or media versions.

Engines are **NOT** allowed to:

- Overwrite the original `QDOC` filename.
- Assign their internal IDs as the primary identity for the document within the QiArchive ecosystem.
