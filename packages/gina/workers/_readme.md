---
title: "QiWorkers README"
slug: "workers_readme"
realm: QiOS
realm_slug: "qios"
qi_decimal: "1.00.00-WRK"
qid:
type: doc
node: file
keywords: ["README","QiOS","folder"]
tags: ["README","QiOS","governance"]
context: "QiOS folder documentation"
created: 2025-11-24
updated: 2025-11-24
version: "1.0.0"
status: canonical
system: qios
naming_strategy: slug_only
sort: 0
related: []
parents: []
children: []
siblings: []
references: []
graph_weight: 5
orbit: inner
entangled: []
summary:
sensitivity: internal
classification: business_internal
---

## Purpose
Autonomous modules that enforce governance and run OS tasks.

## What Belongs Here
- Ingestion workers
- Linting workers
- Routing workers
- Vectorizers
- Dedupe / quarantine

## What Does NOT Belong Here
- UI apps
- Manual docs

## Related Realms / Systems
- workflows/
- rules/
- data/

## Governing Rules
- Layer 1 DarkMatter Physics
- Layer 6 Semantic Routing
- Layer 7 Self-Healing

## Naming & Metadata Notes
One worker per folder. Config stored in data/policies when needed.

## Examples
- `workers/ingestion/`
- `workers/linter/`

## Used By (Workers / Apps / Workflows)
- GINA Orchestrator

## Change Log
- 2025-11-24: README created.
