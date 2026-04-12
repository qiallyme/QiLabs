# QID CLI Portable (Embedded Python)

## What this is
A portable, unzip-and-run bundle for QID issuance + Markdown stamping (plus an optional minimal desktop UI).

## One-time setup (to make it fully portable)
1) Download the official **Windows embeddable** Python ZIP for Python 3.11.x (64-bit).
2) Extract it into this folder as: `python/`
   - You should end up with: `python/python.exe`

After that, you can zip this entire folder and move it anywhere.

## Run
- Double-click: `desktop/qid_launcher.bat`

## UI Mode
- Double-click: `desktop/qid_ui.bat`
  or run: `desktop/qid_launcher.bat ui`

## Storage files (do not delete)
- `app/_qid_state.json`
- `app/_qid_registry.json`

## Logs & redundancy
- Logs: `app/_logs/`
- Rolling backups: `app/_backups/rolling/`
- Daily snapshots: `app/_backups/daily/YYYY-MM-DD/`
- Write-ahead log: `app/_wal/qid_wal.jsonl`
