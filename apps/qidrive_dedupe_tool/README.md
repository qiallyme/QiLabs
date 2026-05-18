# QiDrive Dedupe Tool

Safe staged duplicate cleanup for a local Google Drive-synced folder.

## Why this exists

Most duplicate tools are either too aggressive, too vague, or impossible to audit. This one is intentionally boring:

1. Scan the whole drive/folder.
2. Write a manifest snapshot.
3. Build a duplicate action plan.
4. Review the CSV.
5. Move duplicates into quarantine.
6. Never permanently delete files.

## Install

Python 3.10+ recommended.

Optional but recommended for faster hashing:

    pip install blake3

If you skip that, the script uses Python's built-in `blake2b-256`.

## Recommended workflow

### 1. Scan

    python qidrive_dedupe.py scan "G:\My Drive" --db qidrive_manifest.sqlite

or macOS/Linux:

    python qidrive_dedupe.py scan "$HOME/Google Drive/My Drive" --db qidrive_manifest.sqlite

This creates:

- SQLite database
- JSONL manifest
- CSV manifest

### 2. Plan strict duplicates first

Strict means:

- same file name
- same file size
- same content hash

    python qidrive_dedupe.py plan "G:\My Drive" --db qidrive_manifest.sqlite --stage strict

Review the generated CSV inside `plans/`.

### 3. Apply the strict plan

Dry-run first:

    python qidrive_dedupe.py apply "G:\My Drive" --db qidrive_manifest.sqlite --plan "plans/YOUR_PLAN.jsonl"

Actually move files:

    python qidrive_dedupe.py apply "G:\My Drive" --db qidrive_manifest.sqlite --plan "plans/YOUR_PLAN.jsonl" --apply

Duplicates move into:

    _QIDEDUPE_QUARANTINE/strict/original/folder/structure/file.pdf

### 4. Rescan after applying

    python qidrive_dedupe.py scan "G:\My Drive" --db qidrive_manifest.sqlite

### 5. Plan next stage

Same hash and same size, file names may differ:

    python qidrive_dedupe.py plan "G:\My Drive" --db qidrive_manifest.sqlite --stage same_hash_diff_name

Hash only:

    python qidrive_dedupe.py plan "G:\My Drive" --db qidrive_manifest.sqlite --stage hash_only

## Safety rules

- Default mode is dry-run.
- The script never deletes files.
- The quarantine folder is ignored on future scans.
- Original keeper is selected by oldest modified time.
- Tie breaker is shortest path, then alphabetical path.
- Google Drive sync safety: the script pauses every 500 files/actions by default.

## Custom extension scope

Example: PDFs, CSVs, Markdown, and images only:

    python qidrive_dedupe.py scan "G:\My Drive" --allowed-exts pdf,csv,md,jpg,jpeg,png,webp --db qidrive_manifest.sqlite

## Important warning

Do not run `hash_only` blindly on your entire drive unless you are comfortable with the quarantine result. It is usually safe because content hashes are strong, but the review CSV is the approval gate. Read it.
