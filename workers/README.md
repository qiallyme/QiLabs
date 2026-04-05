# QiOne Canonical Workers Layer

This directory stores strictly canonical, deployed Cloudflare/V8 workers for the Qi ecosystem.

- `_shared/`: shared configurations and constants
- `ingestion/`: API gateway and document intake
- `embedder/`: Vectorizing document text into the database
- `metadata_naming/`: File renaming standardizer
- `semantic_router/`: Intent router
- `orchestrator/`: Master workflow controller
- `self_heal/`: Eventual consistency and cleanup
- `resource_graph/`: Relationship and tag linker
