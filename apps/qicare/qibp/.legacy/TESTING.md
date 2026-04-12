# Testing BP Tracker

## Quick Start

### 1. Install Dependencies

```bash
cd apps/QiBP
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

This will:
- Start Vite dev server on `http://localhost:5173`
- Automatically open in your browser
- Hot reload on file changes

### 3. Test the App

1. **Enter BP Reading:**
   - Type systolic (e.g., 120)
   - Type diastolic (e.g., 80)
   - Optionally add pulse

2. **Symptom Check:**
   - Tap "Yes" or "No" for symptoms
   - Or skip (optional)

3. **Daily Checklist:**
   - Check "Aspirin taken" if applicable
   - Check "Water goal met" if applicable

4. **Send:**
   - Click "Send Result"
   - Data is sent to Zoho Flow webhook
   - Form resets on success

### 4. Test PWA Features (Mobile)

#### On iPhone:

1. **Deploy the app** (or use ngrok/tunnel for local testing):
   ```bash
   # Option 1: Use ngrok to expose localhost
   npx ngrok http 5173
   
   # Option 2: Build and deploy
   npm run build
   # Then serve the dist/ folder
   ```

2. **Open in Safari:**
   - Visit the URL on your iPhone
   - Tap Share button
   - Select "Add to Home Screen"

3. **Test from Home Screen:**
   - Tap the app icon
   - Should see splash screen
   - App opens in standalone mode (no browser UI)

### 5. Check Webhook Data

The app sends data to:
```
https://flow.zoho.com/886846795/flow/webhook/incoming?zapikey=...
```

**Payload structure:**
```json
{
  "systolic": 120,
  "diastolic": 80,
  "pulse": 70,
  "category": "Normal",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "readableDate": "1/15/2025, 10:30:00 AM",
  "person": "Friend",
  "source": "bp_tracker_v1",
  "hasSymptoms": false,
  "aspirinTaken": true,
  "waterDone": true
}
```

Check your Zoho Flow webhook logs to verify data is received.

## Troubleshooting

### Port Already in Use

If port 5173 is taken:
```bash
# Change port in vite.config.js
server: {
  port: 3000,  // or any other port
}
```

### Icons Missing

The app will work without icons, but for full PWA experience:
- Create `icons/bp-icon-192.png` (192x192)
- Create `icons/bp-icon-512.png` (512x512)

### CORS Issues

The app uses `mode: 'no-cors'` for webhook requests, so you won't see response data. This is expected - the request still goes through.

### Local Testing Webhook

For local webhook testing, you can use:
- [webhook.site](https://webhook.site) - Get a test URL
- [RequestBin](https://requestbin.com) - Another test endpoint
- Update `WEBHOOK_URL` in `app.jsx` temporarily

## Build for Production

```bash
npm run build
```

Output will be in `dist/` folder. Serve with any static host:
- Netlify
- Vercel
- GitHub Pages
- Your own server

