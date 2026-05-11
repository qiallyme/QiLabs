# ADR 0002: Cloud Paperless & Google Drive Integration Architecture

## Context

We needed to finalize the roles of cloud hosting (Railway), external capture (Google Drive), and the local control plane (QiArchive) to ensure a stable, scalable document pipeline.

## Decision

1. **Google Drive** is the **Intake and Backup Layer**, NOT a runtime volume.
2. **Paperless-ngx** is the **Cloud OCR/Search Engine**, hosted on Railway.
3. **QiArchive** remains the **Identity and State Authority** (Control Plane).
4. **API Integration** is the preferred bridge between QiArchive and Paperless.
5. **AI/RAG/Bots** are intentionally postponed until the ingestion pipeline is stable.

## Rationale

### Why Drive as Intake/Backup?

- It provides a friction-less "mobile capture" layer.
- It ensures documents remain portable and backed up outside of Railway's transient volume system.
- Avoiding it as a "mounted volume" prevents performance bottlenecks and sync-related race conditions.

### Why Paperless on Railway?

- It provides a high-availability, searchable UI without requiring local hardware.
- Managed services (Postgres, Redis) on Railway reduce operational overhead.

### Why API vs. Volume Handoff?

- Decouples the control plane from the specific cloud implementation.
- Provides immediate HTTP 201 feedback for handoff success, which can trigger status updates in the manifest.

### Why Postpone AI?

- AI and RAG systems are only as good as the underlying data discipline.
- Locking in identity, deduplication, and searchability is the prerequisite for meaningful AI workflows.

## Consequences

- Requires a local processing zone or "stage" before cloud upload.
- Requires script-based orchestration for the Drive -> QiArchive -> Paperless flow.
- Manifests must track `paperless_id` and `upload_status`.
