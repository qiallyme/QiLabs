# QiOS Local Core Worker

## Overview

The worker is a Python process that continuously processes items from the `ingestion_queue` table:
1. Fetches pending items
2. Extracts text (already done in ingest)
3. Generates embeddings via OpenAI
4. Writes to `semantic_profile` table
5. Updates queue status

## Architecture

**Local-Core Workers:**
- Just Python processes running loops
- No registration commands
- Automatically write status to `worker_status` table when running
- Poll `ingestion_queue` for pending items
- Process in batches

## Usage

```bash
cd workers/local_core
python worker.py
```

## Environment Variables

- `OPENAI_API_KEY` - Required for embeddings
- `EMBEDDING_MODEL` - Default: `text-embedding-3-small`
- `WORKER_NAME` - Default: `local-worker-01`
- `WORKER_BATCH_SIZE` - Default: `5` (items per batch)
- `WORKER_SLEEP_MS` - Default: `300` (ms between batches)

## What It Does

1. **Poll Queue**: Fetches up to `BATCH_SIZE` pending items
2. **Mark In Progress**: Updates status to `in_progress`
3. **Generate Embedding**: Calls OpenAI embeddings API
4. **Write to semantic_profile**: Inserts embedding + metadata
5. **Mark Complete**: Updates status to `embedded`
6. **Sleep**: Waits `SLEEP_MS` before next batch

## Status Updates

Worker writes to `worker_status` table:
- `idle` - No items to process
- `processing` - Currently processing items
- `error` - Encountered an error
- `offline` - Shut down

## Error Handling

- Items that fail embedding are marked `error` in queue
- Worker continues processing other items
- Errors are logged in queue item's `meta.error` field

