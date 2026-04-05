---
title: QID CLI Dev Doc
category: tooling
keywords: [qid, qiid, cli, bands, registry, locking, backups, logging, portability]
---

# QID CLI — Developer Document

This bundle includes:
- `app/qid.py` (single-file stdlib-only tool)
- `desktop/*.bat` launchers (CLI + UI)
- shortcut creators (`.vbs` and `.ps1`)
- automatic logs and backups directories

## Build goals
1) Portable: keep state/registry inside `app/`
2) Safe: atomic writes + lock + rolling backups + daily snapshots
3) Auditable: JSONL activity log + write-ahead log
4) Low friction UI: Tkinter wrapper (`python qid.py ui`)

## Logs and recovery
- Activity: `app/_logs/qid_activity.jsonl`
- Errors: `app/_logs/qid_errors.log`
- WAL: `app/_wal/qid_wal.jsonl`
- Rolling backups: `app/_backups/rolling/*`
- Daily snapshots: `app/_backups/daily/YYYY-MM-DD/*`

## Shipping checklist
- Include `app/_qid_state.json` and `app/_qid_registry.json`
- Include `python/` if using embedded Python
- Zip entire `QID_CLI_PORTABLE/` directory
