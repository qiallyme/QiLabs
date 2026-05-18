# QiAccess Start Current State Audit

Date: 2026-05-08
Repo: `C:\QiLabs\_QiAccess_Start`
Audit scope: current QiAccess Start app, adjacent legacy surfaces in this repo, deployment clues, and qiserver verification attempts.

## 1. Current app structure

This repo currently contains three different QiAccess-era surfaces plus one API:

1. Current app: root Vite/React SPA in `src/`
2. Legacy static site: `web/`
3. Legacy Homepage/docker setup: `local/`
4. Separate bookmarks API: `worker/`

That split is the main coherence problem. The repo is not one app right now; it is one active SPA plus two older front-door implementations that still look deployable.

High-level tree:

```text
.
|-- src/
|   |-- app/
|   |-- components/
|   |-- data/
|   |-- features/
|   |-- lib/
|   `-- types/
|-- web/
|   |-- index.html
|   |-- add.html
|   |-- css/
|   `-- js/
|-- worker/
|   |-- src/index.ts
|   |-- package.json
|   |-- schema.sql
|   `-- wrangler.jsonc
|-- local/
|   |-- docker-compose.yml
|   |-- config/
|   `-- src/...
|-- package.json
|-- vite.config.ts
|-- tsconfig.json
`-- run_copy.bat
```

Observations:

- `src/` is the real current QiAccess SPA.
- `local/` is an older Homepage-based dashboard stack and should not be mistaken for the current app.
- `web/` is an older hand-authored static portal that still points at real-looking URLs.
- `worker/` is a standalone Cloudflare Worker bookmarks API tied to the old static site.

## 2. Current routes

Source of truth: `src/app/routes.tsx`

Current top-level routes:

| Route | Component | Status |
|---|---|---|
| `/` | `DashboardPage` | Working UI shell, mostly static data |
| `/apps` | `ResourcesPage` | Working UI shell, seeded data + local browser edits |
| `/map` | `StackMapPage` | Working UI shell, seeded relationship graph |
| `/knowledge` | `KnowledgePage` | Broken in current source; prevents clean build |
| `/runbooks` | `RunbooksPage` | Static placeholder |
| `/prompts` | `PromptsPage` | Static placeholder |
| `/settings` | `SettingsPage` | Working local controls, contains placeholder/auth/backend copy |

There are no current routes for:

- `/start`
- `/capture`
- `/quick`
- `/memory`
- `/insights`
- `/system`

There are also no nested System subroutes yet.

## 3. Current components/pages

Core shell:

- `src/app/App.tsx`
- `src/app/routes.tsx`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/Topbar.tsx`
- `src/components/command/CommandBar.tsx`

Feature pages:

- `src/features/dashboard/DashboardPage.tsx`
- `src/features/resources/ResourcesPage.tsx`
- `src/features/stack-map/StackMapPage.tsx`
- `src/features/knowledge/KnowledgePage.tsx`
- `src/features/runbooks/RunbooksPage.tsx`
- `src/features/prompts/PromptsPage.tsx`
- `src/features/settings/SettingsPage.tsx`

Supporting pieces:

- `src/data/resources.ts`: seed registry data
- `src/features/resources/registry-store.tsx`: browser localStorage patch layer
- `src/components/graph/StackMapCanvas.tsx`: React Flow graph
- `src/components/graph/StackPreview.tsx`: lighter dashboard preview
- `src/components/graph/ResourceDetailPanel.tsx`: open/docs/repo/edit panel
- `src/components/cards/ResourceEditorDrawer.tsx`: local edit drawer

## 4. Current service links

Current SPA service/resource list lives in `src/data/resources.ts`.

Present in the SPA:

- QiAccess: `https://access.qially.com`
- qiserver: `http://qiserver`
- Cloudflare
- Supabase
- GitHub
- Google Drive
- Ollama
- Open WebUI
- AnythingLLM
- Portainer
- Cockpit
- Homepage
- Neo4j
- QiNote
- FamilyOS
- Lumara
- IND Loop
- EmpowerQNow

Present in legacy `local/config/services.yaml` but not in the current SPA:

- Paperless
- Qi Queue / n8n-like intake plane

Known infrastructure named in doctrine but missing from the current SPA seed data:

- Wiki.js
- QiNexus as explicit storage backbone
- Paperless as first-class ingestion target
- System submodules as dedicated navigation entities

## 5. Current deployment path

Verified locally:

- Repo path: `C:\QiLabs\_QiAccess_Start`
- Root app build system: Vite + TypeScript (`package.json`, `vite.config.ts`)
- Worker deployment mechanism: Cloudflare Wrangler in `worker/`
- Legacy Homepage stack: Docker Compose in `local/docker-compose.yml`
- Legacy qiserver sync path: `run_copy.bat` copies `local/config/*` to `/srv/qios/stacks/_qiaccess_start/config`

What appears to exist:

- Current SPA is intended to be a static build from the repo root.
- Old static portal is in `web/`.
- Old worker API is intended for `https://api.access.qially.com/bookmarks`.
- Old Homepage stack appears intended to run on qiserver from `/srv/qios/stacks/_qiaccess_start`.

What is not verified from this machine:

- Exact live deployment target for the current Vite SPA
- Exact restart command used on qiserver
- Exact domain routing for `access.qially.com`
- Whether `access.qially.com` is serving the SPA, the old static site, or something else right now

Why not verified:

- Live SSH verification attempt using `qiadmin@100.121.111.106` failed with `Permission denied (publickey,password)`.

## 6. Current build command and result

Root app build command:

```bash
npm run build
```

Result on 2026-05-08:

- Failed

Errors:

1. Real source error in `src/features/knowledge/KnowledgePage.tsx`
   - `TS2657: JSX expressions must have one parent element`
   - `TS1005: ':' expected`
   - The conditional render is malformed around lines 72-113.
2. Local environment write error
   - `TS5033: Could not write file 'tsconfig.app.tsbuildinfo': EPERM`

Interpretation:

- The current checked-in SPA source is not cleanly buildable.
- Even if the `.tsbuildinfo` write issue is environmental, `KnowledgePage.tsx` is still a real blocking source error.

Worker build/deploy path:

- `worker/package.json` exposes `npm run dev` and `npm run deploy`
- `worker/README.md` documents deployment to `qiaccessstartworker.qilife.workers.dev`

## 7. Current environment/config files, without exposing secrets

Root SPA:

- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `tailwind.config.js`
- `postcss.config.cjs`

Runtime/env handling:

- `src/lib/supabase/client.ts` reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- No root `.env` file is committed in this repo snapshot

Worker:

- `worker/package.json`
- `worker/tsconfig.json`
- `worker/wrangler.jsonc`
- `worker/schema.sql`

Legacy Homepage:

- `local/docker-compose.yml`
- `local/config/services.yaml`
- `local/config/bookmarks.yaml`
- `local/config/settings.yaml`
- `local/config/widgets.yaml`
- `local/config/docker.yaml`

Potentially sensitive config container:

- `local/k3d/.envrc` exists but was not opened in this audit

## 8. What already matches the blueprint

These parts are directionally aligned:

- QiAccess is treated as a front door, not a system of record.
- The app already behaves like a launcher + registry + map shell.
- There is already a working command/search surface in `CommandBar.tsx`.
- There is already a working launcher/registry surface in `ResourcesPage.tsx`.
- There is already a stack relationship surface in `StackMapPage.tsx`.
- The current app avoids overbuilt in-app auth and assumes Cloudflare/Zero Trust at the edge.
- qiserver, Open WebUI, Ollama, Portainer, Cockpit, and Google Drive are already part of the current mental model.

## 9. What conflicts with the blueprint

Major conflicts:

1. Navigation doctrine is wrong
   - Current top-level nav is `Dashboard, Apps, Stack Map, Knowledge, Runbooks, Prompts, Settings`
   - Required doctrine is `Home, Start, Capture, Knowledge, Memory, Insights, System`

2. Missing required roots
   - No `Start`
   - No `Capture`
   - No `Memory`
   - No `Insights`
   - No `System`

3. Extra top-level sections that should be folded down
   - `Apps`
   - `Map`
   - `Runbooks`
   - `Prompts`
   - `Settings`

4. System doctrine is not modeled
   - No `/system/*` subroutes
   - No first-class modules for access, server, storage, integrations, settings, blueprint, roadmap, security, diagnostics

5. Current app still centers generic resource inventory, not daily-use workflow
   - No fast capture path
   - No mobile quick capture route
   - No explicit Paperless intake flow
   - No QiNexus bucket view

6. Current repo still carries legacy surfaces that compete with the new doctrine
   - `web/`
   - `local/`
   - `worker/` tied to old bookmark flow

7. Current Settings page pushes a Supabase-forward story
   - That conflicts with the current instruction to not add Supabase now

## 10. What is static/fake/demo-only

Current SPA:

- `src/data/resources.ts` is a seed file, not live discovery
- Service `status` values are asserted metadata, not health-checked
- Topbar status chips are hard-coded to online
- Dashboard "Today / Active Work" is hard-coded
- Dashboard "Current Priority" is hard-coded
- Dashboard "Phase" is hard-coded
- `RunbooksPage.tsx` is a hard-coded array
- `PromptsPage.tsx` is a hard-coded array
- `AuthBoundary.tsx` is explicitly a placeholder
- Settings "Supabase readiness" is informational copy, not an active integration

Legacy static site:

- `web/index.html` is a hand-authored static card wall
- Connectivity indicator in `web/js/main.js` is a lightweight fetch heuristic, not a robust health system

## 11. What is operational

Operational in the current SPA:

- Router + lazy route setup
- App shell layout
- Sidebar/topbar shell
- Registry search/filter/select flow
- Resource detail drawer and local editing flow
- localStorage persistence for resource patches
- Export/reset of local registry patches
- Stack map visualization from seeded relationships
- Link launching from the registry/detail cards

Operational in legacy pieces:

- `local/docker-compose.yml` is a real compose file for Homepage
- `run_copy.bat` is a real sync script targeting qiserver
- `worker/src/index.ts` is a real CRUD API implementation for bookmarks on D1

Operational but unverified live:

- Cloudflare Worker deployment described in `worker/README.md`
- qiserver Homepage stack path implied by `run_copy.bat`
- service URLs in `src/data/resources.ts` and `local/config/services.yaml`

## 12. What needs refactored

Shortest safe refactor targets:

1. Navigation and folder model
   - Re-map the current app into the seven-root doctrine without deleting working components.

2. Data organization
   - Split generic `resources.ts` into doctrine-aligned static modules:
     - `launcherApps.ts`
     - `serviceLinks.ts`
     - `storageBuckets.ts`
     - `knowledgeLinks.ts`
     - `systemModules.ts`
     - `roadmapPhases.ts`

3. Route structure
   - Fold current `Apps` into `Start`
   - Fold current `Stack Map` into `Home` or `System`
   - Fold current `Runbooks`, `Prompts`, and `Settings` into `System`

4. Page naming
   - Rename page purpose without deleting working guts
   - Example: keep `ResourcesPage` behavior, but move it under `Start`

5. Doctrine gaps
   - Add `Capture`
   - Add `Memory`
   - Add `Insights`
   - Add `System` and its subroutes

6. Build stability
   - Fix `KnowledgePage.tsx`
   - Resolve the TypeScript build write issue in a non-destructive way

## 13. What needs built for daily use

Highest-value gaps for actual daily use:

1. `Start` as the clean launcher root
   - tools, services, projects, system entries

2. `Capture`
   - quick thought dump
   - file drop targets
   - Paperless consume target
   - QiNexus inbox target
   - timeline note target

3. `System`
   - explicit qiserver, Paperless, Open WebUI, Portainer, Cockpit, storage, diagnostics surfaces

4. `Knowledge`
   - explicit Wiki.js linking, not generic note textarea only

5. `Storage`
   - doctrine places this under System
   - QiNexus buckets need to become visible and browsable conceptually

6. `Memory` and `Insights`
   - placeholders are acceptable until ingestion exists, but they should be doctrine-correct placeholders

7. Ingestion proof
   - first real pipeline should be Capture -> Paperless consume / QiNexus inbox / note timeline

## 14. What is risky to touch

Highest risk items:

1. `local/`
   - It appears to be tied to a real qiserver stack path.

2. `run_copy.bat`
   - It targets `/srv/qios/stacks/_qiaccess_start/config`, which may still matter for live operations.

3. `web/` + `worker/`
   - These may still be the currently deployed public access experience or part of it.

4. `src/data/resources.ts`
   - It currently drives the SPA. Changes are safe if mapped carefully, but a blunt rewrite would break the current launcher/map shell.

5. Any assumptions about qiserver live state
   - Live SSH verification failed due auth, so server changes should not be made blindly.

## 15. Recommended next 7 tasks

1. Fix the current source break in `KnowledgePage.tsx` so the SPA builds again.
2. Freeze legacy surfaces in place by documenting `src/` as current, `web/` as old static, and `local/` as old Homepage stack; do not delete them yet.
3. Refactor navigation to the seven-root doctrine using the existing SPA shell and components, not a rewrite.
4. Move current `ResourcesPage` behavior into `Start` and preserve existing working launch links.
5. Create `System` plus its subroutes and relocate current `Settings`, service status, runbooks, prompts, and infra links there.
6. Add a static `Capture` surface focused on Paperless consume, QiNexus inbox, and timeline-note entry points.
7. Re-attempt qiserver live verification with working SSH credentials so Paperless, Open WebUI, Ollama, and deployment paths can be confirmed before deeper integration.

## Current routes/pages/service/status matrix

| Route | Page component | Main linked service/data source | Working / Placeholder / Broken | Notes |
|---|---|---|---|---|
| `/` | `DashboardPage` | `src/data/resources.ts`, `StackPreview` | Working shell | Uses hard-coded priority/focus/phase copy and seeded statuses |
| `/apps` | `ResourcesPage` | `src/data/resources.ts`, localStorage patches | Working shell | Strongest reusable piece for future `Start` |
| `/map` | `StackMapPage` | `src/data/resources.ts` + React Flow | Working shell | Strong reusable piece; route name conflicts with seven-root doctrine |
| `/knowledge` | `KnowledgePage` | local notes over seeded resources | Broken | Current source has malformed JSX and blocks build |
| `/runbooks` | `RunbooksPage` | hard-coded `runbooks` array | Placeholder | Should likely fold into `System` |
| `/prompts` | `PromptsPage` | hard-coded `prompts` array | Placeholder | Should likely fold into `System` |
| `/settings` | `SettingsPage` | local registry export/reset, placeholder auth, Supabase env probe | Working shell with doctrine conflict | Control functions work locally; page positioning/content needs reframe |

## Current deployment flow summary

Current evidence supports this picture:

- Current repo work is a Vite SPA at the repo root.
- Old qiserver homepage stack still exists in `local/` and appears to deploy config to `/srv/qios/stacks/_qiaccess_start`.
- Old static site exists in `web/`.
- Old bookmark API exists in `worker/`.

Known commands:

- Root SPA build: `npm run build`
- Worker deploy: `cd worker && npm run deploy`
- Legacy config sync: `run_copy.bat`

Unverified but likely:

- Legacy Homepage restart on qiserver would be from `/srv/qios/stacks/_qiaccess_start`
- It probably uses `docker compose up -d` or equivalent, but that was not proven in this audit

## qiserver audit status

Attempted live verification:

- SSH target: `qiadmin@100.121.111.106`
- Result: `Permission denied (publickey,password).`

Because of that, the following requested live items remain unverified in this audit:

- running containers
- compose stack locations on qiserver
- service folder tree under `/srv/qios`
- Paperless container status/logs
- Open WebUI/Ollama live state
- installed Ollama models
- whether Open WebUI currently sees Ollama

## Smallest safe refactor plan

This is the smallest safe path that preserves the working app and avoids breaking deployment:

1. Keep `src/` as the active app and treat `web/` and `local/` as legacy surfaces for now.
2. Fix the current build break first, without redesigning the app.
3. Replace top-level nav only:
   - `/` -> Home
   - `/start` -> reuse current launcher/registry behavior
   - `/capture` -> new static ingestion page
   - `/quick` -> mobile quick capture
   - `/knowledge` -> keep, but refocus on Wiki.js and knowledge links
   - `/memory` -> placeholder
   - `/insights` -> placeholder
   - `/system` -> fold in settings, runbooks, prompts, infra links
4. Keep existing working link cards and graph components; just remap them into the right doctrine locations.
5. Move seed data into doctrine-aligned static files instead of one generic `resources.ts`.
6. Do not touch qiserver deployment, DNS, or worker routing until live server access is verified.

Bottom line:

The shortest path to daily use is not a rebuild. It is:

- stabilize the current SPA build
- collapse the SPA into the seven roots
- preserve the existing launcher/map mechanics
- add a real Capture surface
- make Paperless/QiNexus ingestion the first explicit operational workflow
