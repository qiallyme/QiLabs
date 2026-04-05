# QiOS Local Core

Local-first brain for QiOS: ingestion, embeddings, semantic search, and GINA orchestrator.

## Architecture

This is the **local-first core** that runs on your machine. Cloudflare Workers and Supabase are Phase 2 (optional sync/SaaS layer).

- **Database**: SQLite (`data/vector/qios_local.db`)
- **Runtime**: Python FastAPI service
- **Port**: 7130 (configurable via `QIOS_LOCAL_PORT`)

## Milestones

### ✅ Milestone 1: Local core skeleton + DB
- FastAPI app with `/health` and `/queue` endpoints
- SQLite schema (ingestion_queue, file_history, semantic_profile, worker_status, system_event)
- Database migrations system

### 🚧 Milestone 2: Local ingest path
- `POST /ingest` - enqueue files/notes
- `GET /ingest/{id}` - check ingest status

### 🚧 Milestone 3: Local embeddings + `/query`
- Background embedding worker
- `POST /query` - semantic search

### 🚧 Milestone 4: Local GINA (`/gina/chat`)
- `POST /gina/chat` - orchestrator-aware GINA chat

## Setup

```bash
cd workers/local_core
pip install -r requirements.txt
python qios_local_core.py
```

Service runs on `http://localhost:7130`

## API Endpoints

### `GET /health`
Quick status check.

**Response:**
```json
{
  "status": "ok",
  "db_path": "/path/to/data/vector/qios_local.db"
}
```

### `GET /queue`
Get ingestion queue summary grouped by status.

**Response:**
```json
{
  "total": 123,
  "by_status": {
    "pending": 100,
    "extracted": 20,
    "embedded": 3
  }
}
```

## Database

SQLite database lives at `data/vector/qios_local.db`.

Migrations are in `migrations/` and run automatically on startup.

## Genesis Alignment

- **Layer 0 (Root Integrity)**: Lives under `workers/` as QiWorker
- **Layer 1 (Dark Matter)**: Protects system substrate
- **Layer 6 (Semantic Routing)**: Handles ingestion and routing
- **Layer 7 (Self-Healing)**: Tracks file history and events

This is the **local nervous system** before cloud sync.

