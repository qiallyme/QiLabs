---
title: "QiRules README"
slug: "rules_readme"
realm: QiOS
realm_slug: "qios"
qi_decimal: "7.00.00-RUL"
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
Governance logic and registries that define OS behavior.

## What Belongs Here
- qirules_*.yaml
- folder_registry.yaml
- realms_registry.yaml

## What Does NOT Belong Here
- Seeds
- Schemas

## Related Realms / Systems
- data/sheets/qios_rules_*.csv

## Governing Rules
- All layers

## Naming & Metadata Notes
Rules are immutable once versioned except via semver bump.

## Examples
- `rules/qios_rules_v1_1.yaml`

## Used By (Workers / Apps / Workflows)
- QiOS Linter

## Change Log
- 2025-11-24: README created.
