# Wrangler Secrets Guide

## Local Development (`.dev.vars`)

For local development, create a `.dev.vars` file in the `worker/` directory:

```bash
# From the worker directory
cd worker
cp .dev.vars.example .dev.vars
```

Then edit `.dev.vars` and fill in your actual values:

```bash
# .dev.vars (this file is gitignored)
SUPABASE_URL=https://your-actual-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
OPENAI_API_KEY=sk-your-actual-openai-key
ZOHO_MCP_URL=https://qizohomcp-906243217.zohomcp.com/mcp/message
ZOHO_MCP_KEY=your-actual-zoho-key
```

**Note:** `.dev.vars` is automatically gitignored, so your secrets won't be committed.

---

## Production Secrets (`wrangler secret put`)

For production, use Wrangler's secret commands. Secrets are encrypted and stored securely by Cloudflare.

### Set a single secret:

```bash
# From the worker directory
cd worker

# Set Supabase URL (if needed as a secret, or use vars in wrangler.toml)
wrangler secret put SUPABASE_URL

# Set Supabase Service Role Key
wrangler secret put SUPABASE_SERVICE_ROLE_KEY

# Set OpenAI API Key
wrangler secret put OPENAI_API_KEY

# Set Zoho MCP Key (if using)
wrangler secret put ZOHO_MCP_KEY
```

When you run `wrangler secret put <KEY>`, it will prompt you to enter the value interactively (or you can pipe it).

### Set secret from file or environment variable:

```bash
# From environment variable
echo $OPENAI_API_KEY | wrangler secret put OPENAI_API_KEY

# From file (be careful with this!)
cat .dev.vars | grep OPENAI_API_KEY | cut -d'=' -f2 | wrangler secret put OPENAI_API_KEY
```

### List all secrets:

```bash
wrangler secret list
```

### Delete a secret:

```bash
wrangler secret delete SUPABASE_SERVICE_ROLE_KEY
```

---

## Environment-Specific Secrets

If you have multiple environments (staging, production), specify the environment:

```bash
# For production (default)
wrangler secret put OPENAI_API_KEY --env production

# For a different environment
wrangler secret put OPENAI_API_KEY --env staging
```

---

## Quick Setup Commands

### One-time setup for local development:

```bash
cd worker
cp .dev.vars.example .dev.vars
# Then edit .dev.vars with your actual values
```

### One-time setup for production:

```bash
cd worker
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put OPENAI_API_KEY
# Optional:
wrangler secret put ZOHO_MCP_KEY
```

---

## Where to Get Your Secrets

- **Supabase**: https://supabase.com/dashboard/project/_/settings/api
  - `SUPABASE_URL`: Project URL
  - `SUPABASE_SERVICE_ROLE_KEY`: Service role key (⚠️ keep this secret!)

- **OpenAI**: https://platform.openai.com/api-keys
  - `OPENAI_API_KEY`: Your API key (starts with `sk-`)

- **Zoho MCP**: From your Zoho MCP integration setup
  - `ZOHO_MCP_URL`: Your MCP endpoint
  - `ZOHO_MCP_KEY`: Your MCP authentication key

---

## Troubleshooting

### Secrets not working in local dev?
- Make sure `.dev.vars` is in the `worker/` directory (same level as `wrangler.toml`)
- Restart `wrangler dev` after creating/updating `.dev.vars`
- Check that variable names match exactly (case-sensitive)

### Secrets not working in production?
- Verify secrets are set: `wrangler secret list`
- Check that you're deploying to the correct environment
- Ensure variable names in code match the secret names exactly

### Want to test production secrets locally?
You can't - use `.dev.vars` for local testing. Production secrets are only available when the worker runs in Cloudflare's environment.

