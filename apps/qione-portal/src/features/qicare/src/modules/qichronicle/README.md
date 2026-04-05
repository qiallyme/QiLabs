# QiChronicle Module

QiChronicle is a timeline and calendar management module for the QiOne platform.

## Features (v0)

- **Events CRUD**: Create and view events with metadata (kind, tags, status).
- **Views**:
  - **Timeline View**: Vertical view of historical and upcoming events.
  - **Calendar View**: Monthly grid with event indicators.
  - **List View**: Tabular view with filtering by kind and search.
- **Event Linking**: Attach documents, URLs, or people to any event via `event_links`.
- **Integration Point**: Helper function for other modules to emit events.
- **ICS Export**: Publicly accessible ICS feed for external calendar clients.

## Tech Stack

- **Frontend**: React + Vite (integrated into Care Portal).
- **Backend**: Supabase (Postgres with RLS + RPC).
- **Serverless**: Cloudflare Worker for ICS generation.

## Setup

### 1. Migrations

Apply the migrations in `packages/supabase/migrations/00009_qichronicle.sql`.
This will:

- Create the `qichronicle` schema.
- Define `events`, `event_links`, and `calendar_feeds` tables.
- Set up tenant-based RLS.
- Create the `get_events_by_feed` RPC for the ICS worker.

### 2. Module Registration

Ensure the module is registered in:

- `apps/internal/care-portal/src/modules/registry.ts`
- `apps/internal/care-portal/src/routes/module_router.tsx`

### 3. Worker Configuration

Ensure the worker in `apps/internal/worker` is deployed with:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (required to call the RPC across RLS)

The ICS feed URL format: `https://your-worker.com/calendar/:secret_key.ics`

### 4. Integration Usage

Other modules can emit events by calling `emitChronicleEvent`:

```typescript
import { emitChronicleEvent } from "../qichronicle/helper";

await emitChronicleEvent(tenantId, {
  title: "Document Uploaded",
  kind: "doc",
  start_at: new Date().toISOString(),
  description: "User uploaded a new PDF.",
  tags: ["qivault"],
  context: { origin: "qivault-docs", doc_id: "..." }
});
```
