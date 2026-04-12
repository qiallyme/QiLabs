# Repository Classification

## Type

QiArchive is an **infrastructure-first Cloud Orchestrator** with an integrated management dashboard.

## Primary Classification

- cloud backend / orchestrator
- infrastructure automation
- document identity & state authority
- data pipeline

## Secondary Classification

- management dashboard / PWA
- metadata coordination layer
- archival integration bridge

## Not Primary

QiArchive is not primarily:

- a standalone note-taking app
- a public document sharing platform
- a replacement for Paperless-ngx (it is the upstream feeder)

## Architectural Position

QiArchive sits as the **Control Plane** between capture sources and active search engines.

```text
Capture (Drive) → QiArchive (Engine + Console) → Paperless (OCR/Search)
```

## Implications

The repository should prioritize:

- stable API contracts
- state management discipline (The Ledger)
- secure cloud-to-cloud transitions
- lightweight, high-visibility dashboard UI (Console)
- operational failure handling
