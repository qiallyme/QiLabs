# CareLite

Standalone daily-use care cockpit built from the `CareLite` spec in `C:\QiLabs\_QiAccess_Start\docs\10_core\40_service_apps\120_applications\CareLite`.

Current implementation:

- Separate app from MomsCare
- Local-first storage in `localStorage`
- Big-button dashboard for daily care logging
- Spec-shaped item rules and oxygen tank logic
- Recent activity feed with void support
- Lean settings screen for rule and oxygen profile edits

Not wired yet:

- Supabase `carelite` schema
- Shared auth or patient selection
- Cross-app data sync with MomsCare

Commands:

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

Note: local `vite build` may fail on this Windows machine with `spawn EPERM` from `esbuild`, but `npm run typecheck` passes.
