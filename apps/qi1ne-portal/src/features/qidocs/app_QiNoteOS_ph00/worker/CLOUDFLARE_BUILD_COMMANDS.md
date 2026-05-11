# Cloudflare Worker Build & Deploy Commands

## Quick Reference

### From `worker/` directory:

```bash
# Type check (verify TypeScript compiles)
npm run type-check
# or
tsc --noEmit

# Build check (dry run - validates without deploying)
npm run build
# or
wrangler deploy --dry-run

# Deploy to production
npm run deploy
# or
wrangler deploy

# Run locally with hot reload
npm run dev
# or
wrangler dev
```

### From root directory (using pnpm workspace):

```bash
# Build worker (dry run)
pnpm build:worker

# Deploy worker
pnpm --filter @qinote/worker deploy

# Dev worker
pnpm dev:worker
```

---

## Detailed Commands

### Type Checking
```bash
cd worker
npm run type-check
```
Validates TypeScript without generating output. Use this before deploying.

### Build (Dry Run)
```bash
cd worker
npm run build
```
Validates the worker configuration and TypeScript compilation without actually deploying. Good for CI/CD checks.

### Deploy to Production
```bash
cd worker
npm run deploy
```

Or with environment:
```bash
wrangler deploy --env production
```

**Before deploying, make sure you've set your secrets:**
```bash
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put OPENAI_API_KEY
```

### Local Development
```bash
cd worker
npm run dev
```

Starts local dev server with hot reload. Uses `.dev.vars` for environment variables.

### Preview Deployment
```bash
wrangler deploy --env preview
```

Deploys to a preview environment (if configured).

---

## Environment-Specific Deploys

Your `wrangler.toml` has a production environment configured. To deploy to it:

```bash
wrangler deploy --env production
```

---

## Build Process

**Important:** Cloudflare Workers don't require a traditional build step. Wrangler:
1. Automatically compiles TypeScript
2. Bundles your code
3. Uploads to Cloudflare

The `build` script in `package.json` is actually a dry-run deploy, not a build step.

---

## CI/CD Integration

For GitHub Actions or other CI/CD:

```yaml
# Example GitHub Actions step
- name: Deploy Worker
  run: |
    cd worker
    npm install
    npm run type-check
    wrangler deploy
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

---

## Troubleshooting

### "No build step needed"
Your `wrangler.toml` says "No build step needed - Wrangler handles TypeScript compilation". This is correct - just run `wrangler deploy`.

### Type errors before deploy
Run `npm run type-check` first to catch TypeScript errors.

### Secrets not working in production
Make sure you've set them with `wrangler secret put <KEY>`.

### Local dev not working
Check that `.dev.vars` exists and has your secrets.

---

## Common Workflow

```bash
# 1. Type check
cd worker && npm run type-check

# 2. Test locally
npm run dev

# 3. Dry run deploy (optional)
npm run build

# 4. Deploy
npm run deploy
```

