# Mom Care — Live Caregiving Support PWA

A production-minded, mobile-first Progressive Web App for real-time caregiving support. Built for a caregiver with ADHD managing a parent with COPD and other recurring care needs.

## What This App Does

Mom Care is a **live care operations console** — not a generic health tracker. It reduces cognitive overload during stressful caregiving moments by answering five questions instantly:

1. **What just happened?** — Recent activity timeline
2. **What is due next?** — Next timer, medication, or treatment
3. **What is unsafe?** — Active medication safety warnings
4. **What to monitor?** — Care guidance and symptom tracking
5. **When to escalate?** — Decision support levels (Monitor → Treat → Call → ER)

## Features

- 🏠 **Live Dashboard** — Current status, timers, cautions, quick actions
- 💊 **Quick Logging** — One-tap medication, treatment, and symptom logging
- 🎤 **Voice Commands** — "Log Tylenol two tablets", "Start ice timer"
- ⏱️ **Concurrent Timers** — Ice, medications, breathing treatments, reassessments
- 🛡️ **Safety Engine** — Acetaminophen tracking, sedation stacking, COPD cautions
- 📋 **Timeline** — Chronological event feed with filters
- 📊 **Decision Support** — Monitor / Treat / Call Doctor / ER classification
- 📱 **PWA** — Installable, offline-capable, mobile-first

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| State | Zustand + localStorage |
| PWA | vite-plugin-pwa (Workbox) |
| Voice | Web Speech API |

## Quick Start

```bash
# From the QiLabs monorepo root:
cd apps/qicare
pnpm install
pnpm run dev
```

The app will start at `http://localhost:5180`

## Install as PWA

### iPhone (Safari)
1. Open `http://localhost:5180` in Safari
2. Tap the **Share** button (square with arrow)
3. Tap **Add to Home Screen**
4. The app will launch in standalone mode

### Android (Chrome)
1. Open the URL in Chrome
2. Tap the install banner or Menu → Add to Home Screen

## Voice Commands

| Command | Action |
|---------|--------|
| "Log Tylenol two tablets" | Logs Tylenol 500mg |
| "Log gabapentin one capsule" | Logs Gabapentin 300mg |
| "Start ice timer" | Creates 20-min ice timer |
| "Log pain level six" | Records pain at 6/10 |
| "Log treatment started" | Starts breathing treatment |
| "Log treatment finished" | Completes treatment, sets next timer |
| "What is due next?" | Shows next upcoming action |

## Safety Rules

The app runs configurable safety checks on every medication log:

- **Duplicate Acetaminophen** — Warns when Tylenol + Lortab overlap
- **Sedation Stacking** — Flags gabapentin + opioid combinations
- **COPD Respiratory** — Extra monitoring for respiratory depressants
- **Opioid Timing** — Enforces minimum intervals between doses
- **Fall Risk** — Accumulation warnings for sedating medications

## Project Structure

```
apps/qicare/
├── public/          # PWA assets, favicon
├── src/
│   ├── types/       # TypeScript type definitions
│   ├── data/        # Medication DB, safety rules, seed data
│   ├── store/       # Zustand stores (care + timers)
│   ├── engine/      # Safety, voice, timer, decision engines
│   ├── hooks/       # React hooks (voice, timers, notifications)
│   ├── components/  # UI components by feature area
│   └── pages/       # Screen-level page components
├── index.html       # Entry with PWA meta tags
├── vite.config.ts   # Vite + Tailwind + PWA config
└── tsconfig.json    # TypeScript config
```

## iPhone/Safari PWA Limitations

- **Push notifications** are limited — timers use local Notification API when available
- **Background execution** pauses when app is minimized on iOS
- **Service Worker** caching works for offline viewing but not background sync
- **Microphone access** requires HTTPS in production (works on localhost)

## Demo Data

The app ships with seed data for a demo care day:
- Patient: 72-year-old female with COPD, chronic knee pain
- Medications: Prednisone, albuterol, ipratropium, Tylenol, gabapentin, Lortab
- Active timers: Ice, pain reassessment, breathing treatment
- Protocols: COPD Flare Day, Knee Pain Day, Fall Watch Mode

## Medical Disclaimer

⚕️ Mom Care supports caregiving decisions but **does not replace professional medical advice**. Drug interaction warnings are informational and may not cover all situations. Always consult a healthcare provider for medical concerns.

## License

Part of the QiLabs ecosystem. Domain band: `qicare`.
