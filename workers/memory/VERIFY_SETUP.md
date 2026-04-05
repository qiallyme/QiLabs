# Quick Setup Verification

## ✅ Pre-Deploy Checklist

### 1. Environment File
```bash
# Check .env.example exists
ls .env.example

# Copy to .env (if not done)
cp .env.example .env
# Edit .env and fill in your keys
```

### 2. Git Ignore
Verify `.gitignore` excludes:
- `.env`
- `.dev.vars`
- `.wrangler`
- `node_modules`

### 3. Local Dev Setup
```bash
# Copy .env to .dev.vars for local dev
cp .env .dev.vars

# Start dev server (auto-loads .dev.vars)
wrangler dev
```

### 4. Test Local Endpoint
In another terminal:
```bash
curl -X POST http://127.0.0.1:8787/query \
  -H "Content-Type: application/json" \
  -d '{"query":"test"}'
```

Expected: JSON response with `answer` and `matches` fields.

### 5. Sync Secrets to Cloudflare

**macOS/Linux:**
```bash
./sync-secrets.sh
```

**Windows:**
```powershell
.\sync-secrets.ps1
```

### 6. Verify Secrets
```bash
wrangler secret list
```

Should show all 4 secrets.

### 7. Deploy
```bash
wrangler deploy
```

### 8. Test Deployed Endpoint
```bash
# Watch logs
wrangler tail

# Test endpoint
curl -X POST https://qimemory-worker.YOUR_SUBDOMAIN.workers.dev/query \
  -H "Content-Type: application/json" \
  -d '{"query":"test"}'
```

## Troubleshooting

**If secrets sync fails:**
- Check `.env` has all required keys
- Verify Wrangler is authenticated: `wrangler login`

**If local dev fails:**
- Check `.dev.vars` exists and has correct values
- Verify `wrangler dev` is running from `cloud/worker/` directory

**If deployed endpoint returns 500:**
- Check `wrangler tail` for error details
- Verify secrets are set: `wrangler secret list`
- Check Worker code for error messages with `step` field

