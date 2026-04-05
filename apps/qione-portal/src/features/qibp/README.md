# QiBP

## Overview

# BP Tracker - PWA Setup

## PWA Features

This app is configured as a Progressive Web App (PWA) that can be installed on iOS/Android devices.

### Installation on iPhone

1. Open the app URL in Safari
2. Tap the Share button
3. Select **"Add to Home Screen"**
4. The app will appear as a standalone app icon
5. When opened from the home screen, it runs in full-screen mode (no browser UI)

### Required Icons

You need to create two icon files for the PWA:

- `/public/icons/bp-icon-192.png` (192x192 pixels)
- `/public/icons/bp-icon-512.png` (512x512 pixels)

**Icon Design Suggestions:**
- Simple heart or BP monitor icon
- Blue theme (#2563eb) to match the app
- Rounded corners (iOS will add them automatically)
- Transparent background

You can use any image editor or online tool to create these. The icons will be used for:
- Home screen icon on iOS/Android
- App launcher icon
- Splash screen (on some platforms)

### Files Structure

```
apps/QiBP/
├── app.jsx              # Main React component with splash screen
├── index.html           # HTML entry point with PWA meta tags
├── manifest.json        # PWA manifest configuration
├── icons/               # Icon files (create these)
│   ├── bp-icon-192.png
│   └── bp-icon-512.png
└── text.py              # Webhook URL reference
```

**Note:** Icon files should be placed in an `icons/` folder at the root level (or in `public/icons/` if your bundler serves from a public directory). The manifest references them as `/icons/bp-icon-192.png`.

### Splash Screen

The app includes a built-in splash screen that:
- Shows for 1.2 seconds on app launch
- Displays the BP Tracker logo and "Powered by QiAlly"
- Fades out smoothly to the main app

### Notes

- The webhook URL is hard-coded and cannot be changed via settings
- Google Sheet URL can be configured in Settings for dashboard functionality
- All data is sent to Zoho Flow webhook automatically



---

## Cloudflare Setup

# ✅ Cloudflare Pages Setup - BP Tracker

## Build Settings (Cloudflare Dashboard)

### Required Settings:

**Framework preset:** `Vite`  
**Build command:** `npm run build`  
**Build output directory:** `dist`  
**Root directory:** (leave empty, or `apps/QiBP` if deploying from monorepo)

**Environment:**
- Node version: `18` or `20` (recommended: `20`)
- Build image: `Ubuntu (latest)`

### Optional Environment Variables:

```
NODE_VERSION=20
CI=FALSE
```

---

## ✅ Required Files (Already Configured)

### 1. `vite.config.js`
✅ Includes `base: "./"` - **Critical for Cloudflare**

### 2. `public/manifest.json`
✅ PWA manifest for iPhone installation

### 3. `public/_redirects`
✅ SPA routing support (`/* → /index.html 200`)

### 4. `public/QiBPAppIcon.png`
✅ App icon for home screen

### 5. `public/introvideo.mp4`
✅ Intro video for splash screen

### 6. `index.html`
✅ Includes all PWA meta tags:
- Manifest link
- Apple mobile web app tags
- Theme color
- Apple touch icon

---

## 🚀 Deployment Steps

### Option 1: GitHub Integration (Recommended)

1. Push code to GitHub
2. Go to Cloudflare Dashboard → Pages
3. Create new project → Connect to GitHub
4. Select repository
5. Set build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Root directory: (empty or `apps/QiBP`)
6. Deploy!

### Option 2: Direct Upload

1. Build locally:
   ```bash
   cd apps/QiBP
   npm install
   npm run build
   ```

2. Upload `dist` folder via Cloudflare Dashboard → Pages → Upload

### Option 3: Wrangler CLI

```bash
npm install -g wrangler
wrangler pages deploy dist --project-name=qibp-tracker
```

---

## ✅ What's Already Done

- ✅ `vite.config.js` with `base: "./"`
- ✅ `public/manifest.json` configured
- ✅ `public/_redirects` for SPA routing
- ✅ `index.html` with all PWA meta tags
- ✅ App icon in public folder
- ✅ Intro video in public folder
- ✅ Hard-coded webhook URL (no env vars needed)

---

## 🔍 Verification Checklist

After deployment, verify:

- [ ] App loads at your Cloudflare Pages URL
- [ ] CSS/styles load correctly (check `base: "./"` worked)
- [ ] Icons display on home screen
- [ ] Intro video plays on app open
- [ ] Can add to iPhone home screen
- [ ] Webhook POSTs work (test with a BP reading)
- [ ] Dashboard loads Google Sheet data

---

## 🐛 Common Issues

### Assets Not Loading
- **Fix:** Ensure `base: "./"` is in `vite.config.js` ✅ (Already done)

### 404 on Refresh
- **Fix:** Ensure `public/_redirects` exists ✅ (Already done)

### Icons Not Showing
- **Fix:** Check `manifest.json` icon paths match actual files ✅ (Already done)

### Video Not Playing
- **Fix:** Ensure video is in `public/` folder ✅ (Already done)

---

## 📝 Notes

- **No Worker needed** for v1 - direct webhook POSTs work fine
- **No environment variables** needed - webhook URL is hard-coded
- **PWA works** out of the box with current setup
- **iPhone installation** works via Safari → Share → Add to Home Screen

---

## 🎯 TL;DR

**Cloudflare Settings:**
```
Build command: npm run build
Output directory: dist
Node version: 20
```

**Everything else is already configured!** ✅

Just connect your repo and deploy.



---

