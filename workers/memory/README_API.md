# QiMemory Worker API Documentation

## Local Development

### Setup

1. **Create `.dev.vars` for local development:**
   ```bash
   cd cloud/worker
   cp .env .dev.vars  # or create manually
   ```

2. **Start the dev server:**
   ```bash
   wrangler dev
   ```
   
   The Worker will be available at `http://127.0.0.1:8787`.

### Health Check

Test that the Worker is running:

```bash
curl -s http://127.0.0.1:8787/health
```

Expected response:
```json
{"ok":true}
```

### Status Check

Get comprehensive health status including environment variables, Supabase connectivity, and RPC function verification:

```bash
curl -s http://127.0.0.1:8787/status
```

Expected response:
```json
{
  "time": "2025-01-15T10:30:00.000Z",
  "env_ok": [],
  "supabase_ok": true,
  "supabase_payload": {
    "embeddings_rows": 12345,
    "files_indexed": 234,
    "bytes_indexed": 56789012,
    "running": 0,
    "last_finished": "2025-01-15T10:00:00Z",
    "recent_errors_24h": 0
  },
  "rpc_ok": true
}
```

If environment variables are missing:
```json
{
  "time": "2025-01-15T10:30:00.000Z",
  "env_ok": ["OPENAI_API_KEY", "SUPABASE_URL"],
  "supabase_ok": false,
  "supabase_payload": null,
  "rpc_ok": false
}
```

### Query Test

Send a query to the `/query` endpoint:

```bash
curl -s -X POST http://127.0.0.1:8787/query \
  -H "Content-Type: application/json" \
  -d '{"query":"What is QiMemory?"}'
```

With custom match count:

```bash
curl -s -X POST http://127.0.0.1:8787/query \
  -H "Content-Type: application/json" \
  -d '{"query":"Summarize QiMemory architecture","k":10}'
```

Expected response:
```json
{
  "answer": "QiMemory is...",
  "matches": [
    {
      "id": "...",
      "text": "...",
      "similarity": 0.85,
      ...
    }
  ]
}
```

## Deployment

### Before Deploying

1. **Sync secrets to Cloudflare:**

   **macOS/Linux:**
   ```bash
   ./sync-secrets.sh
   ```

   **Windows (PowerShell):**
   ```powershell
   .\sync-secrets.ps1
   ```

2. **Verify secrets are set:**
   ```bash
   wrangler secret list
   ```

   Should show:
   - `OPENAI_API_KEY` (encrypted)
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `CHAT_MODEL` (optional)

### Deploy

```bash
wrangler deploy
```

### Test Deployed Endpoint

After deployment, test the live endpoint:

```bash
curl -s https://qimemory-worker.YOUR_SUBDOMAIN.workers.dev/health

curl -s -X POST https://qimemory-worker.YOUR_SUBDOMAIN.workers.dev/query \
  -H "Content-Type: application/json" \
  -d '{"query":"What is QiMemory?"}'
```

## Monitoring

### Tail Logs

Watch real-time logs from the deployed Worker:

```bash
wrangler tail
```

This shows:
- Request IDs
- Query lengths and token estimates
- Timing for each step (embeddings, Supabase RPC, chat completion)
- Errors with diagnostic information

### Log Format

Each request logs:
```
[requestId] Query: X chars (~Y tokens), k=Z
[requestId] Embedding: Xms, vector length: 3072
[requestId] Supabase RPC: Xms, matches: Y, response size: Z bytes
[requestId] Chat completion: Xms, answer length: Y
[requestId] Query complete: Xms total | query: Y chars | matches: Z | ctx: A chars | answer: B chars
```

## API Endpoints

### GET /health

Health check endpoint.

**Response:**
```json
{"ok": true}
```

### GET /status

Comprehensive health status endpoint. Checks:
- Environment variables (returns list of missing vars)
- Supabase connectivity (calls `get_kb_status` RPC)
- RPC function availability (tests `match_kb` with zero vector)

**Response:**
```json
{
  "time": "ISO 8601 timestamp",
  "env_ok": ["list of missing env vars if any"],
  "supabase_ok": true,
  "supabase_payload": {
    "embeddings_rows": 12345,
    "files_indexed": 234,
    "bytes_indexed": 56789012,
    "running": 0,
    "last_finished": "timestamp",
    "recent_errors_24h": 0
  },
  "rpc_ok": true
}
```

**Note:** This endpoint does not log secrets or sensitive information.

### POST /query

Query the knowledge base with RAG.

**Request Body:**
```json
{
  "query": "string (required, max 8000 chars)",
  "k": 6  // optional, 1-20, default: 6
}
```

**Response:**
```json
{
  "answer": "Generated answer from context",
  "matches": [
    {
      "id": "match_id",
      "text": "matched text",
      "similarity": 0.85,
      ...
    }
  ]
}
```

**Error Responses:**
- `400` - Invalid input (InputTooLarge, InvalidInput, ParseError)
- `500` - Missing environment variables
- `502` - EmbeddingFailed or SupabaseRPCFailed

### OPTIONS /*

CORS preflight handler. Returns `204 No Content` with appropriate CORS headers.

## Environment Variables

Required secrets (set via `wrangler secret put` or `sync-secrets.sh/.ps1`):
- `OPENAI_API_KEY` - OpenAI API key for embeddings and chat
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key

Optional:
- `CHAT_MODEL` - Chat model name (default: `gpt-4o-mini`)

## Troubleshooting

See `docs/TROUBLESHOOTING.md` for detailed troubleshooting guide.

