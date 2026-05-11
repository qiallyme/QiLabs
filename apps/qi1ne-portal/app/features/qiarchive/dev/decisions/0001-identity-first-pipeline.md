# ADR 0001: Identity-First Pipeline (Model A)

## Context

We needed to decide where the primary responsibility for document identity and naming should reside: in QiArchive or in the downstream engine (Paperless-ngx).

## Decision: Model A

QiArchive assigns the permanent `QDOC` identity and canonical filename **before** handoff to Paperless.

## Rationale

- **Portability**: The file system remains a durable source of truth. If the Paperless database is lost, the files themselves still carry their identity and searchable metadata in their names.
- **Tool Independence**: Any future engine (not just Paperless) can consume the staged files without needing to re-identify them.
- **Stability**: Sequential ID increments are handled in a single, controllable script before ingestion triggers.
- **Collision Control**: We prevent duplicates from ever entering the Paperless consumer, reducing clutter and API noise.

## Consequences

- Need a `data/01_STAGED` folder as the identity-handoff point.
- The manifest must be updated *before* the file moves to the Paperless consumer.
- Any filename improvements (tags, better dates) must update both the physical file and the manifest record.
