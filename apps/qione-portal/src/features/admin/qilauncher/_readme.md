---
title: "QiOS Launcher README"
slug: "launcher_readme"
realm: QiOS
realm_slug: "qios"
qi_decimal: "1.01.00-APP"
qid:
type: doc
node: file
keywords: ["README","QiOS","launcher","ui","dashboard"]
tags: ["README","QiOS","governance","ui"]
context: "QiOS Launcher UI application documentation"
created: 2025-11-25
updated: 2025-11-25
version: "0.1.0"
status: draft
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
summary: "Dashboard UI for monitoring and controlling QiOS runtime, worker health, queue status, and file processing"
sensitivity: internal
classification: system_darkmatter
---

## Purpose
Real-time dashboard for monitoring and controlling QiOS runtime, worker health, queue status, and file processing history.

## What Belongs Here
- React/Vite frontend application
- UI components for worker status, queue monitoring, error display
- API client for orchestrator endpoints
- Dashboard views and controls

## What Does NOT Belong Here
- Worker logic (belongs in `workers/`)
- Backend API (belongs in `workers/orchestrator/`)
- Shared components (belongs in `components/`)

## Related Realms / Systems
- `workers/orchestrator/` - Provides API endpoints
- `docs/ui_contracts_v1.md` - API contract definitions
- `docs/launcher_ui_mindmap.md` - UI architecture

## Governing Rules
- Layer 0 Root Integrity
- QiApps ontology

## Naming & Metadata Notes
Standard React/Vite application structure.

## Examples
- `apps/launcher/src/App.jsx` - Main dashboard component
- `apps/launcher/src/App.css` - Dashboard styles

## Used By (Workers / Apps / Workflows)
- Human operators
- System administrators

## Change Log
- 2025-11-25: Initial Launcher UI created with React/Vite.

