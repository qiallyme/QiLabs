# Cloudflare Pages Build Settings

> **📖 For complete setup guide, see `CLOUDFLARE_SETUP.md`**

## Quick Reference

### Build Settings (in Cloudflare Dashboard)

**Framework preset:** Vite  
**Build command:** `npm run build`  
**Build output directory:** `dist`  
**Root directory:** (leave empty, or set to `apps/QiBP` if deploying from monorepo root)

**Node version:** `18.x` or `20.x` (recommended: `20.x`)

### Environment Variables

No environment variables required (webhook URL is hard-coded in the app).

---

## Alternative: Using `wrangler.toml` (for Cloudflare Workers/Pages)

If deploying via Wrangler CLI, create a `wrangler.toml` file:

```toml
name = "qibp-tracker"
compatibility_date = "2024-01-01"

[site]
bucket = "./dist"

[build]
command = "npm run build"
cwd = "."

[[redirects]]
from = "/*"
to = "/index.html"
status = 200
```

---

## Manual Deployment Steps

1. **Build locally:**
   ```bash
   cd apps/QiBP
   npm install
   npm run build
   ```

2. **Deploy to Cloudflare Pages:**
   - Go to Cloudflare Dashboard → Pages
   - Create new project
   - Upload `dist` folder, OR
   - Connect GitHub repo and set build settings above

3. **Custom domain (optional):**
   - Add custom domain in Pages settings
   - Update DNS records as instructed

---

## SPA Routing Support

For client-side routing (if you add routes later), create `public/_redirects`:

```
/*    /index.html   200
```

This ensures all routes serve `index.html` for React Router compatibility.

