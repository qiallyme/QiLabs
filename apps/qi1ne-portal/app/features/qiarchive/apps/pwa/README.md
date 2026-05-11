# QiArchive PWA Dashboard

This is the mobile-friendly dashboard for monitoring your local QiArchive Agent.

## Setup

1. `cd apps/pwa`
2. `npm install`
3. `npm run dev`

## Deployment (Cloudflare Pages)

1. Connect your GitHub repo to Cloudflare Pages.
2. Select the `apps/pwa` directory as the build root.
3. Build command: `npm run build`
4. Build output directory: `dist`
5. Environment variables:
   - `VITE_API_URL=https://qiarchive-api-production.up.railway.app`

## Mobile Installation

1. Open the URL on your iPhone (Safari) or Android (Chrome).
2. Tap "Share" (iOS) or the three-dot menu (Android).
3. Select **"Add to Home Screen"**.
4. The app now lives in your app drawer as a standalone utility.
