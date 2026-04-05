# Secrets Management

## Setup

1. Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```
   ```powershell
   # Windows PowerShell
   Copy-Item .env.example .env
   ```

2. Edit `.env` and add your actual credentials:
   ```
   OPENAI_API_KEY=sk-...
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJ...
   CHAT_MODEL=gpt-4o-mini
   ```

## Local Development

For local development, copy `.env` to `.dev.vars`:
```bash
cp .env .dev.vars
```
```powershell
# Windows PowerShell
Copy-Item .env .dev.vars
```

Then run `wrangler dev` - it will automatically load `.dev.vars`.

**Note:** `.dev.vars` is gitignored and never committed. It's only used locally by Wrangler.

## Deploying Secrets

Before deploying, sync your secrets to Cloudflare:

**macOS/Linux:**
```bash
./sync-secrets.sh
```

**Windows (PowerShell):**
```powershell
.\sync-secrets.ps1
```

The scripts will:
- ✅ Check that `.env` exists
- ✅ Validate required keys are present
- ✅ Sync each secret to Cloudflare Worker
- ✅ Show clear success/error messages

## Verify Secrets

Check that secrets are set:
```bash
wrangler secret list
```

Should show:
- `OPENAI_API_KEY` (encrypted)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `CHAT_MODEL`

## Deploy

After secrets are synced, deploy:
```bash
wrangler deploy
```

## Quick Verification

Test locally:
```bash
# Start dev server (auto-loads .dev.vars)
wrangler dev

# In another terminal, test the endpoint
curl -X POST http://127.0.0.1:8787/query \
  -H "Content-Type: application/json" \
  -d '{"query":"test"}'
```

After deploy:
```bash
# Watch logs
wrangler tail

# Test deployed endpoint
curl -X POST https://qimemory-worker.YOUR_SUBDOMAIN.workers.dev/query \
  -H "Content-Type: application/json" \
  -d '{"query":"test"}'
```

## Important Notes

- **Local Development:** Use `.dev.vars` for local testing. Wrangler automatically loads `.dev.vars` when running `wrangler dev`. Never commit `.dev.vars` to git.

- **Production Deployment:** Always run `sync-secrets.sh` (macOS/Linux) or `sync-secrets.ps1` (Windows) before deploying to sync secrets from `.env` to Cloudflare.

- **Required Secrets:**
  - `OPENAI_API_KEY` - Required for embeddings and chat completions
  - `SUPABASE_URL` - Required for RPC calls
  - `SUPABASE_ANON_KEY` - Required for Supabase authentication

- **Optional Secrets:**
  - `CHAT_MODEL` - Chat model name (default: `gpt-4o-mini`). If not set, the Worker will return matches but no generated answer.

