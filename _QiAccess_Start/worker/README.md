# QiAccess Bookmarks API

Minimal Bookmarks API powered by Cloudflare Workers and D1.

## Deployment URL
`https://qiaccessstartworker.qilife.workers.dev`

## Endpoints

### Health
- `GET /health` -> `{ "status": "ok", "timestamp": "..." }`

### Bookmarks
- `GET /bookmarks` -> Returns all bookmarks (ordered by pinned, then date)
- `POST /bookmarks` -> Create a new bookmark
  - Required: `title`, `url`
  - Optional: `description`, `category`, `tags` (array), `scope`, `pinned` (boolean)
- `PATCH /bookmarks/:id` -> Update specific fields
- `DELETE /bookmarks/:id` -> Remove a bookmark

## Table Schema
See `schema.sql` for the D1 table definition.

## Development
```bash
npm install
npm run dev
```

## Deployment
```bash
npm run deploy
```
