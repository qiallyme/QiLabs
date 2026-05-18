# QiDrive Dedupe Interactive Tool

This version follows the no-command workflow.

## How to run

Double-click:

    RUN_QIDRIVE_DEDUPE.bat

Or run the Python file directly. If no command is provided, it opens interactive mode.

## What it does

- Scans a Google Drive local folder.
- Creates manifest snapshots.
- Creates reviewable duplicate plans.
- Dry-runs before moving anything.
- Quarantines duplicates only after explicit approval.
- Never deletes files.

## Stages

1. Strict  
   Same filename + same size + same content hash.

2. Same hash, different name allowed  
   Same size + same content hash.

3. Hash only  
   Same content hash only.

## Safety

Real apply requires:

- choosing a plan
- saying you reviewed the CSV
- typing `QUARANTINE`

Files move to:

    _QIDEDUPE_QUARANTINE

The original relative folder structure is preserved.
