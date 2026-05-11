# QiOS Local-First Quick Start Guide

## What Needs to Be Running

For the full QiOS local-first stack, you need:

1. **Ollama** - Local LLM and embedding service (port 11434)
2. **Local Core Service** - FastAPI service for GINA chat and RAG (port 7130)
3. **Ingestion Worker** - Processes files from ingestion queue (optional but recommended)
4. **Agent Service** - HTTP API for agent commands (port 5050, optional)

## Quick Start (Automated)

**Use the startup script:**

```powershell
cd C:\QiOS_v1
.\start_qios_local.ps1
```

This script will:
- Check if Ollama is running and start it if needed
- Start Local Core service in a new window
- Optionally start the ingestion worker
- Optionally start the agent service
- Run a status check
- Optionally run sanity tests

## Manual Start (Step by Step)

### 1. Start Ollama

```powershell
ollama serve
```

In another terminal, pull required models:
```powershell
ollama pull nomic-embed-text
ollama pull llama3.2
```

### 2. Start Local Core Service

```powershell
cd C:\QiOS_v1\workers\local_core
python qios_local_core.py
```

This starts the FastAPI service on `http://localhost:7130`

### 3. Start Ingestion Worker (Optional)

In a new terminal:
```powershell
cd C:\QiOS_v1\workers\local_core
python worker.py
```

This processes files from the `ingestion_queue` table in Supabase.

### 4. Start Agent Service (Optional)

In a new terminal:
```powershell
cd C:\QiOS_v1
python qios_agent.py
```

This starts the agent HTTP API on `http://localhost:5050`

## Verify Everything is Working

### Quick Status Check

```powershell
cd C:\QiOS_v1\workers\local_core
python check_status.py
```

This shows:
- Environment variables (which are set)
- Ollama status and available models
- Supabase connection status
- Local core service health

### Run Tests

```powershell
cd C:\QiOS_v1\workers\local_core
python tests/test_sanity_checks.py
```

This runs comprehensive tests:
- Database migration check
- Ollama health
- RAG pipeline
- GINA chat
- Function calling
- Failure modes

### Manual API Test

Test GINA chat:
```powershell
curl -X POST http://localhost:7130/gina/chat `
  -H "Content-Type: application/json" `
  -d '{\"messages\": [{\"role\": \"user\", \"content\": \"Who are you?\"}]}'
```

Or use PowerShell:
```powershell
$body = @{
    messages = @(
        @{
            role = "user"
            content = "Who are you?"
        }
    )
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:7130/gina/chat" -Method POST -Body $body -ContentType "application/json"
```

## Troubleshooting

### Ollama Not Running
- Check: `curl http://localhost:11434/api/tags`
- Start: `ollama serve`
- Pull models: `ollama pull nomic-embed-text` and `ollama pull llama3.2`

### Local Core Service Not Starting
- Check port 7130 is not in use: `netstat -an | findstr 7130`
- Check `.env` file exists and has correct variables
- Check Python dependencies: `pip install -r requirements.txt`

### Supabase Connection Issues
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env`
- Check Supabase dashboard for project status
- Verify migration `004_standardize_embedding_768.sql` has been applied

### RAG Not Working
- Check embeddings exist: `SELECT COUNT(*) FROM semantic_profile WHERE embedding IS NOT NULL;`
- Verify RPC function exists: Check Supabase SQL Editor
- Check Ollama embedding model is correct (nomic-embed-text, 768 dimensions)

## Service Endpoints

### Local Core Service (Port 7130)
- `GET /health` - Health check
- `POST /gina/chat` - GINA chat endpoint
- `GET /queue` - Ingestion queue status
- `POST /ingest` - Ingest a file
- `GET /query` - RAG search
- `POST /tools/invoke` - Invoke a tool

### Agent Service (Port 5050)
- `POST /start/dev-stack` - Start dev stack (calls PowerShell script)

## Environment Variables

Required in `.env` file:
```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
OLLAMA_LLM_MODEL=llama3.2

# Local Core
QIOS_LOCAL_PORT=7130
QIOS_LOCAL_CORE_URL=http://localhost:7130

# Agent (optional)
QIOS_AGENT_URL=http://localhost:5050
```

## Next Steps

Once everything is running:
1. Ingest some files to populate the semantic profile
2. Test GINA chat with questions about your content
3. Test function calling by asking GINA to start workers
4. Monitor worker logs for ingestion progress
