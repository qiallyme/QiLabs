# Splitwise PWA

A production-quality, mobile-first Progressive Web App for expense splitting, built with React, TypeScript, and Express.

## Features

### MVP Scope ✅
- **Spaces** (Trip/Event/House) with invites & roles (Owner/Editor/Viewer)
- **Add Expense** with split methods: equal, exact, percent, shares
- **Fair rounding** to cents with deterministic residual allocation
- **Balances** + minimal-transfer **Settle Plan** generator
- **Record Settlements** (immutable; use counter-settlement to reverse)
- **Multi-currency** per expense with locked FX rates
- **Offline-first PWA**: IndexedDB cache, Background Sync, storage persistence
- **Exports**: CSV download + shareable Settle Summary
- **OCR stub** for itemized receipts (ready for Tesseract.js integration)

## Tech Stack

### Frontend
- React 18 + Vite + TypeScript
- TailwindCSS + shadcn/ui components + lucide-react icons
- React Router for navigation
- Zustand (UI state) + TanStack Query (API cache)
- Dexie (IndexedDB) for offline cache + outbox
- Workbox service worker for PWA capabilities

### Backend
- Node 20 + Express + TypeScript
- Prisma ORM (SQLite dev → Postgres prod)
- Zod validation
- Magic-link auth stub with cookie sessions
- Fair rounding & minimal-transfer algorithms

### Monorepo
- pnpm workspaces: `/apps/web`, `/apps/api`, `/packages/types`

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 8+

### Installation

```bash
# Install dependencies
pnpm install

# Setup database (API)
cd apps/api
cp .env.example .env
pnpm db:push
pnpm db:seed

# Return to root
cd ../..
```

### Development

```bash
# Run both web and API concurrently
pnpm dev:all

# Or run individually:
# pnpm dev:web  (http://localhost:5173)
# pnpm dev:api  (http://localhost:3001)
```

### Build

```bash
pnpm build
```

### Testing

```bash
# Run all tests
pnpm test

# Type checking
pnpm typecheck
```

## Project Structure

```
/apps
  /web              React PWA frontend
    /src
      /components   UI components (shadcn-style)
      /routes       Page components
      /lib          API client, utilities, Dexie DB
      /state        Zustand stores
      /styles       TailwindCSS
  /api              Express backend
    /src
      /router       API routes (auth, spaces, expenses, settlements, etc.)
      /domain       Business logic (rounding, settle-plan, postings)
      /db           Prisma client + seed
    /tests          Unit tests (Vitest)
    /prisma         Prisma schema
/packages
  /types            Shared TypeScript types + Zod schemas
```

## Key Algorithms

### Fair Rounding
- Calculate raw per-user amounts (can be fractional cents)
- Floor each amount, compute residual
- Sort by fractional remainder (desc), tiebreak by userId (asc)
- Distribute residual cents deterministically

### Minimal Transfers (Settle Plan)
- Calculate net balance per user
- Greedy algorithm: match largest debtor with largest creditor
- Results in O(N) transfers instead of O(N²)

### Multi-Currency
- Lock FX rate at expense creation time
- Store native amount + currency + fxRateMicros + base amount
- Immutable across revisions

## Offline-First Architecture

1. **IndexedDB Cache**: All spaces, expenses, settlements cached locally via Dexie
2. **Outbox Pattern**: Failed mutations queue in IndexedDB `outbox` table
3. **Background Sync**: Service worker retries outbox on connectivity
4. **Storage Persistence**: Request persistent storage on first login
5. **Unsynced Warnings**:
   - Banner when outbox > 0
   - `beforeunload` confirmation if unsynced
   - Modal block on sign-out with unsynced items

## API Endpoints

### Auth
- `POST /api/auth/magic/start` - Send magic link
- `GET /api/auth/magic/verify?token=...` - Verify & login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/signout` - Sign out

### Spaces
- `POST /api/spaces` - Create space
- `GET /api/spaces` - List user's spaces
- `GET /api/spaces/:id` - Get space details
- `POST /api/spaces/:id/invites` - Create invite token
- `POST /api/spaces/join` - Join via invite
- `GET /api/spaces/:id/members` - List members

### Expenses
- `POST /api/spaces/:id/expenses` - Create expense
- `GET /api/spaces/:id/expenses` - List expenses
- `GET /api/expenses/:id` - Get expense detail + history
- `PATCH /api/expenses/:id` - Edit expense (creates new revision)

### Settlements
- `POST /api/spaces/:id/settlements` - Record settlement
- `GET /api/spaces/:id/settlements` - List settlements

### Balances
- `GET /api/spaces/:id/balances` - Get current balances
- `POST /api/spaces/:id/settle-plan` - Generate minimal transfers

### FX & Exports
- `GET /api/fx/latest?base=USD&to=EUR` - Get FX rate (stub)
- `GET /api/spaces/:id/export.csv` - Download CSV
- `POST /api/spaces/:id/share-settle` - Create shareable summary (stub)

## Environment Variables

### API (`apps/api/.env`)
```
DATABASE_URL="file:./dev.db"
PORT=3001
SESSION_SECRET="change-me-in-production"
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Web (`apps/web/.env`)
```
VITE_API_URL=http://localhost:3001/api
```

## PWA Installation

1. Open the app in a mobile browser (Chrome/Safari)
2. Tap "Add to Home Screen"
3. App will work offline with cached data
4. Mutations queue automatically when offline
5. Background Sync retries when back online

## Testing Checklist

- [x] Fair rounding sums to total
- [x] Deterministic residual allocation
- [x] Settle plan results in nets ≤ 1 cent
- [x] Ledger invariant: sum of postings = 0 per space
- [x] FX immutability across revisions
- [x] Idempotent settlements via idempotencyKey
- [x] Offline outbox & sync banner
- [x] beforeunload confirmation with unsynced
- [x] Sign-out modal blocks with unsynced

## Production Deployment

### Backend
1. Set `DATABASE_URL` to Postgres connection string
2. Set secure `SESSION_SECRET`
3. Configure real magic link email sender
4. Enable HTTPS & secure cookies
5. Run `pnpm build && pnpm start`

### Frontend
1. Set `VITE_API_URL` to production API
2. Run `pnpm build`
3. Deploy `dist/` to CDN/static host (Vercel, Netlify, Cloudflare Pages)
4. Ensure HTTPS for PWA

## License

MIT

## Authors

Built according to production spec by senior full-stack engineer + product designer.
