# ADR 0003: Pivot to Cloud Orchestrator & Console (PWA)

## Context

We initially designed QiArchive as a local script pipeline feeding a cloud-hosted Paperless instance. However, to achieve full operational visibility and reliable automation without requiring a local machine to be "on," we need to transition to a cloud-first architecture.

## Decision

QiArchive will be reclassified as a **Cloud Platform** consisting of:

1. **QiArchive Engine**: A backend service responsible for orchestrating document flow.
2. **QiArchive Console**: A web-based dashboard (PWA) for managing the document ledger.
3. **Cloud Ledger**: A dedicated Postgres database for tracking document status and metadata.

## Rationale

### Why a Cloud Orchestrator?

- **Always-On**: Decouples document processing from local hardware availability.
- **Reliability**: Centralizes error handling and retries in a controlled cloud environment.
- **Scalability**: Allows for future hooks, webhooks, and multi-user intake sources.

### Why a Dashboard/PWA?

- **Visibility**: Provides an immediate "pulse" of the pipeline (how many docs in inbox vs. processed).
- **Mobile Access**: Allows the user to review and resolve document conflicts or metadata gaps from any device.
- **Low Overhead**: A lightweight UI is faster to build and maintain than a heavy native app but provides 90% of the value.

### Why Postgres vs. CSV?

- **Concurrency**: Necessary for a web dashboard and background engine to access state simultaneously.
- **Integrity**: Enforces relational data constraints (e.g., unique hashes, sequential IDs).

## Consequences

- Requires a backend framework selection (FastAPI/Python is the logical choice given existing scripts).
- Requires a frontend approach (e.g., Next.js, Vite, or even a simple HTMX console).
- Shift from `document_manifest.csv` to a relational `documents` table as the authority.
- Requires cloud storage for the temporary "processing cache" before handoff.

## Postponed (Out of Scope)

- No vector database or RAG yet.
- No AI bots yet.
- The immediate goal is "Visible, Automated Pipe" (Intake -> Identify -> Upload -> Archive).
