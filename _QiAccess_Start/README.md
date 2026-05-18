# QiAccess Start

QiAccess Start is the front door for the QiAccess personal system.

It is the portal layer, not the server itself and not the full knowledge base.

## What It Is

QiAccess Start is responsible for:

- launching the right tools and services
- giving fast capture paths
- pointing to the real knowledge/source-of-truth surfaces
- showing system context without pretending every backend workflow lives inside the portal

## Current Route Model

Top-level roots:

- `/`
- `/capture`
- `/knowledge`
- `/memory`
- `/insights`
- `/system`

System routes:

- `/system/access`
- `/system/server`
- `/system/storage`
- `/system/integrations`
- `/system/settings`
- `/system/diagnostics`
- `/system/blueprint`
- `/system/roadmap`
- `/system/security`

## Local Run

```bash
npm install
npm run dev -- --host 127.0.0.1
```

Local preview/build:

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

## Docs Workflow

Source docs live in `docs/`.

Generate the docs runtime copy with:

```bash
npm run docs:sync
```

Optional site build/serve:

```bash
npm run docs:build
npm run docs:serve
```

## Access Mode Rules

- `access.qially.com` is the public front door.
- Tailscale/private admin tools must stay clearly marked as private-only.
- Do not treat server utility links as equivalent to the public portal.
- Keep service truth in `src/data/`.

## Key Source Files

- `src/components/app/routes.tsx`
- `src/lib/navigation.ts`
- `src/data/serviceLinks.ts`
- `src/data/launcherApps.ts`
- `src/data/systemModules.ts`

## Current Known Gaps

- Full rendered browser QA is still pending in a less restricted environment.
- Some system doctrine pages are status/handoff pages rather than deep operational consoles.
- Service truth should still be verified against live private infrastructure when doing server work.
