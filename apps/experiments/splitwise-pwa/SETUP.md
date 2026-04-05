# Quick Setup Guide

## 1. Install Dependencies

```bash
pnpm install
```

## 2. Setup API Database

```bash
cd apps/api

# Push Prisma schema to SQLite
pnpm db:push

# Seed with sample data (4 users, 1 space)
pnpm db:seed

cd ../..
```

## 3. Run Development Servers

```bash
# Both web and API concurrently
pnpm dev:all
```

Open:
- **Web**: http://localhost:5173
- **API**: http://localhost:3001

## 4. Login

Use any email (e.g., `alice@example.com`) and click "Send Magic Link". In dev mode, the magic link is displayed on screen — click it to login.

## 5. Testing

### Unit Tests (API)
```bash
cd apps/api
pnpm test
```

### E2E Tests (Playwright)
```bash
cd apps/web
pnpm test:e2e
```

## 6. Build for Production

```bash
pnpm build
```

Build artifacts:
- `apps/web/dist` - Static frontend assets
- `apps/api/dist` - Compiled Node.js server

## Architecture Highlights

### Monorepo Structure
- **apps/web**: React PWA with Vite, TailwindCSS, shadcn/ui
- **apps/api**: Express REST API with Prisma ORM
- **packages/types**: Shared TypeScript types + Zod schemas

### Key Features Implemented
✅ Spaces with roles (Owner/Editor/Viewer)  
✅ Expenses with 4 split methods (equal/exact/percent/shares)  
✅ Fair rounding algorithm (deterministic residual allocation)  
✅ Balances + minimal-transfer settle plan  
✅ Record settlements (immutable, use counter-settlement to reverse)  
✅ Multi-currency with locked FX rates  
✅ Offline-first PWA (IndexedDB + Background Sync)  
✅ CSV export + shareable settle summary  
✅ OCR stub for receipt scanning  

### Algorithms
- **Fair Rounding**: Distributes residual cents by fractional remainder (desc), tiebreak by userId (asc)
- **Minimal Transfers**: Greedy matching of largest debtor → creditor for O(N) transfers
- **Locked FX**: Immutable exchange rates stored per expense revision

### Offline-First
- **IndexedDB** cache via Dexie
- **Outbox** pattern for failed mutations
- **Background Sync** retries via Workbox
- **Storage persistence** requested on login
- **Unsynced warnings**: Banner, beforeunload, sign-out modal

## Production Deployment

### Backend
1. Set `DATABASE_URL` to Postgres
2. Secure `SESSION_SECRET`
3. Configure email sender for magic links
4. Enable HTTPS

### Frontend
1. Build: `pnpm build`
2. Deploy `apps/web/dist` to CDN
3. Ensure HTTPS for PWA

## Troubleshooting

### Port already in use
```bash
# Kill process on port 3001 (API)
lsof -ti:3001 | xargs kill -9

# Kill process on port 5173 (Web)
lsof -ti:5173 | xargs kill -9
```

### Prisma schema changes
```bash
cd apps/api
pnpm db:push
```

### Clear Dexie cache (browser)
Open DevTools → Application → IndexedDB → Delete "splitwise"

## Next Steps

1. **Add real OCR**: Replace stub with Tesseract.js in `ReceiptScanner.tsx`
2. **Email magic links**: Integrate SendGrid/Mailgun in `/api/auth/magic/start`
3. **Real FX API**: Use exchangerate-api.com or similar in `/api/fx/latest`
4. **Cross-space netting**: Advanced feature for users in multiple spaces
5. **Push notifications**: Via Web Push API for settlement reminders
6. **Budgets**: Track spending vs. budget per category

## License

MIT



