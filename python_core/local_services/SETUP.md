# QiOS Local Core - Setup Guide

Quick setup to get the local-first cognitive stack running.

## Prerequisites

1. **Python 3.8+** with pip
2. **Ollama** installed and running
3. **Supabase** project with vector extension
4. **Environment variables** configured

## Step 1: Install Dependencies

```bash
cd workers/local_core
pip install -r requirements.txt

# If requirements.txt doesn't exist, install manually:
pip install fastapi uvicorn httpx supabase python-dotenv
```

## Step 2: Set Up Ollama

### Install Ollama
- **Windows**: Download from https://ollama.com/download
- **Mac**: `brew install ollama`
- **Linux**: `curl -fsSL https://ollama.com/install.sh | sh`

### Start Ollama
```bash
ollama serve
```

### Pull Required Models
```bash
ollama pull nomic-embed-text
ollama pull llama3.2
```

### Verify Ollama
```bash
curl http://localhost:11434/api/tags
```

Should return list of available models.

## Step 3: Configure Environment Variables

Create `.env` file in project root (`C:\QiOS_v1\.env`):

```env
# Ollama (Local-First)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
OLLAMA_LLM_MODEL=llama3.2

# Supabase (Canonical Semantic Store)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# QiOS Agent (Optional)
QIOS_AGENT_URL=http://localhost:5050

# Local Core Port (Optional)
QIOS_LOCAL_PORT=7130
```

**Get Supabase credentials:**
1. Go to Supabase Dashboard → Your Project
2. Settings → API
3. Copy:
   - Project URL → `SUPABASE_URL`
   - `anon` `public` key → `SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

## Step 4: Run Database Migration

In Supabase SQL Editor, run:

```sql
-- See: data/migrations/004_standardize_embedding_768.sql
```

Or apply via Supabase MCP if available.

## Step 5: Start Local Core Service

```bash
cd workers/local_core
python qios_local_core.py
```

Should see:
```
[CONFIG] Loaded .env from ...
Starting QiOS Local Core on http://0.0.0.0:7130
```

## Step 6: Verify Setup

Run the test suite:

```bash
python tests/test_sanity_checks.py
```

All tests should pass (or at least not fail on connection errors).

## Troubleshooting

### "Cannot connect to Ollama"
- Check Ollama is running: `curl http://localhost:11434/api/tags`
- Start Ollama: `ollama serve`
- Check `OLLAMA_BASE_URL` in `.env`

### "Supabase client not initialized"
- Check `.env` file exists in project root
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Check credentials are correct (no extra spaces)

### "Cannot connect to local_core"
- Check service is running: `python qios_local_core.py`
- Check port 7130 is not in use
- Verify `QIOS_LOCAL_PORT` in `.env` matches

### "Model not found"
- Pull the model: `ollama pull nomic-embed-text`
- Check model name matches `OLLAMA_EMBEDDING_MODEL` in `.env`

## Next Steps

Once setup is complete:

1. Run full test suite: `python tests/test_sanity_checks.py`
2. Ingest some documents to populate semantic_profile
3. Test GINA chat with real queries
4. Run manual failure mode tests

