# Local Development Guide

## Quick Start

1. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and fill in your values
   ```

2. **Create `.dev.vars` for local development:**
   ```bash
   cp .env .dev.vars
   ```
   
   Wrangler automatically loads `.dev.vars` when running `wrangler dev`, so you don't need to manually export variables.

3. **Start the Worker locally:**
   ```bash
   cd cloud/worker
   wrangler dev
   ```
   
   The Worker will start on `http://127.0.0.1:8787` and automatically load secrets from `.dev.vars`.

## Testing the Endpoint

Test the `/query` endpoint with curl:
```bash
curl -X POST http://127.0.0.1:8787/query \
  -H "Content-Type: application/json" \
  -d '{"query":"what is QiMemory?"}'
```

## Pages UI Development

For the Pages UI (`cloud/pages/chat/index.html`):

**Option 1: Simple static server (recommended for local dev):**
```bash
cd cloud/pages
npx serve .
# Or: python -m http.server 8000
```

Then open `http://localhost:8000/chat/` in your browser.

**Option 2: Deploy to Cloudflare Pages:**
See `../pages/README_PAGES.md` for deployment instructions.

## Fallback Mode

If the `/query` route isn't configured (e.g., running Pages locally without Worker routing), the chat UI will fall back to direct API calls. Click **Settings** in the UI and paste:
- Supabase URL
- Supabase Anon Key
- OpenAI API Key
- Chat Model (optional, defaults to `gpt-4o-mini`)

The UI will then make direct API calls instead of routing through the Worker.

