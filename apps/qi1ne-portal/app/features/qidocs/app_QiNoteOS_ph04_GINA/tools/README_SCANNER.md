# QiOS Local FS Scanner Integration

## Overview

The Local FS Scanner is the entry point for the QiOS ingestion pipeline. It:
1. Scans the QiOS file tree
2. Respects ignore patterns from `rules/fs_ignore.yaml`
3. Computes SHA-256 hashes for all files
4. Generates snapshot and event logs
5. Loads events into the `ingestion_queue` table

## Components

### 1. FS Scanner (`tools/fs_scanner.py`)
- Walks the QiOS tree
- Applies ignore patterns
- Hashes files with SHA-256
- Generates:
  - `data/outputs/fs_scan_snapshot.json` - Full file state
  - `data/outputs/fs_scan_events.jsonl` - Event log (adds/changes/removes)

**Usage:**
```bash
# Dry run (no writes)
python tools\fs_scanner.py --dry-run

# Manual scan (writes snapshot + events)
python tools\fs_scanner.py --manual-push

# Scheduled scan (for cron)
python tools\fs_scanner.py
```

### 2. Queue Loader (`tools/queue_loader.py`)
- Reads `fs_scan_events.jsonl`
- Inserts/updates `ingestion_queue` in Supabase
- Handles deduplication by `file_path`
- Extracts metadata (slug, realm, mime type, etc.)

**Usage:**
```bash
# Dry run (no database writes)
python tools\queue_loader.py --dry-run

# Load all events
python tools\queue_loader.py

# Load limited events
python tools\queue_loader.py --limit 100
```

**Requirements:**
- `SUPABASE_URL` environment variable
- `SUPABASE_SERVICE_ROLE_KEY` environment variable
- `supabase-py` package: `pip install supabase`

### 3. Scanner Scheduler (`tools/scanner_scheduler.ps1`)
- Runs scanner + queue loader in sequence
- Designed for daily cron/scheduled task execution

**Usage:**
```powershell
powershell -ExecutionPolicy Bypass -File tools\scanner_scheduler.ps1
```

### 4. Windows Task Scheduler Setup
- `tools/windows_task_scheduler.xml` - Task definition
- `tools/install_scheduler.ps1` - Installation script

**Installation:**
```powershell
# Run as Administrator
powershell -ExecutionPolicy Bypass -File tools\install_scheduler.ps1
```

## Pipeline Flow

```text
1. Scanner runs (daily/manual)
   ↓
2. Generates fs_scan_events.jsonl
   ↓
3. Queue Loader reads events
   ↓
4. Inserts into ingestion_queue (status: pending)
   ↓
5. Ingestion Worker picks up pending items
   ↓
6. Processes and creates semantic_profile
```

## Testing

### Test Scanner
```bash
python tools\fs_scanner.py --dry-run
```

### Test Queue Loader
```bash
# First, generate events
python tools\fs_scanner.py --manual-push

# Then test loader
python tools\queue_loader.py --dry-run --limit 5
```

### Test Full Pipeline
```powershell
powershell -ExecutionPolicy Bypass -File tools\test_pipeline.ps1
```

## Environment Variables

Create a `.env` file in the root directory:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Or set in PowerShell:
```powershell
$env:SUPABASE_URL = "https://your-project.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "your-service-role-key"
```

## Troubleshooting

### Scanner not ignoring files
- Check `rules/fs_ignore.yaml` format
- Ensure patterns use forward slashes (`**/.git/**` not `**\.git\**`)
- Verify pattern matching logic in `is_ignored()` function

### Queue Loader fails
- Verify Supabase credentials in environment
- Check network connectivity to Supabase
- Verify `ingestion_queue` table exists (run migration `001_ingestion_queue.sql`)
- Check event file exists: `data/outputs/fs_scan_events.jsonl`

### Scheduled task not running
- Verify task is registered: `Get-ScheduledTask -TaskName "QiOS-Daily-Scanner"`
- Check task history: Task Scheduler → Task Scheduler Library → QiOS-Daily-Scanner → History
- Verify script paths are correct (use absolute paths if needed)

## Output Files

- `data/outputs/fs_scan_snapshot.json` - Full file state snapshot
- `data/outputs/fs_scan_events.jsonl` - Event log (JSONL format, one event per line)

## Next Steps

After scanner integration:
1. Verify ingestion worker is deployed and running
2. Check `ingestion_queue` table for pending items
3. Monitor worker logs for processing status
4. Test UI endpoints (`/health`, `/queue`, `/workers`)

