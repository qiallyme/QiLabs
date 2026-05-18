## Capture Feature

Current module layout:

- `CapturePage.tsx`: capture hub and full universal intake screen
- `captureDraftStore.ts`: browser-local draft safety net
- `quick_notes/`: fast notes and markdown capture
- `dev_session/`: structured development history and restart receipts
- `shared/`: capture labels, routing, and shared types

Current doctrine:

- Capture first. Route later.
- Universal intake, not a generic notes app.
- Local draft safety net stays active until explicit clear or a future save succeeds.
- Future persistence and downstream routing should build on the shared types/routing helpers here.

Future capture submodules may include:

- `document_ingest`
- `paperless_ingest`
- `voice_capture`
- `link_capture`

Persistence direction:

- quick notes and general intake may later write to `capture_items`
- dev session records write to `dev_history`
