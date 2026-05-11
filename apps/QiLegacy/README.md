# QiLegacy Estate Kit

`QiLegacy` now contains a real web app scaffold for turning the legacy estate-planning packet into a guided questionnaire, live document preview, and printable PDF kit workflow.

## What changed

- `src/`: React/Vite questionnaire app with autosave, printable packet output, and export helpers
- `supabase/migrations/`: initial Supabase schema for packets, roles, assets, beneficiaries, document answers, and exports
- `docs/estate-questionnaire-field-map.md`: the field inventory extracted from the original estate packet

The original `.html` and `.md` packet files remain in place as the source material that informed the questionnaire and generated document language.

## Local run

```powershell
npm install
npm run dev
```

## PDF export

The app builds a print-specific document kit. Use the in-app `Print / Save PDF Kit` action and choose `Save as PDF` in the browser print dialog.

## Supabase setup

1. Create a Supabase project.
2. Apply the SQL in `supabase/migrations/20260510_qilegacy_estate_packet_foundation.sql`.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to a local `.env`.
4. Replace the local-storage persistence layer with live Supabase reads/writes as you wire auth.
