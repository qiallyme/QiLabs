# QiNote Testing Checklist

## ✅ Completed Setup Steps

1. **✅ Repository Refactored & Committed**
   - Monorepo structure finalized
   - All changes committed and pushed
   - Clean working directory

2. **✅ Dependencies Installed**
   - Frontend: React 19, TypeScript, Vite, react-router-dom, zustand, @supabase/supabase-js, clsx
   - Worker: @supabase/supabase-js, openai, wrangler
   - Test dependencies: vitest, @testing-library/react

3. **✅ Dev Server Running**
   - Frontend: http://localhost:5173
   - Status: ✅ Running (confirmed on port 5173)

4. **✅ Worker Setup**
   - Worker starting on port 8787
   - Health endpoint: http://localhost:8787/health

5. **✅ Environment Files Created**
   - `apps/qinote/.env.example` - Frontend template
   - `worker/.env.example` - Worker template

---

## 🔧 Environment Setup Required

### Frontend (.env.local)
Create `apps/qinote/.env.local` with:
```env
VITE_WORKER_URL=http://localhost:8787
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Worker (.env)
Create `worker/.env` with:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
OPENAI_API_KEY=your-openai-api-key-here
```

---

## 🧪 Testing Steps

### Step 1: Verify Dev Server ✅
- [x] Frontend accessible at http://localhost:5173
- [ ] Homepage loads without errors
- [ ] No console errors (check browser DevTools)

### Step 2: Verify Worker Health
- [ ] Worker responds at http://localhost:8787/health
- [ ] Health endpoint returns 200 OK
- [ ] Response includes service status and endpoints list

### Step 3: Connect Frontend ↔ Worker
- [ ] Frontend can reach worker (check network tab)
- [ ] CORS headers working
- [ ] No connection errors in console

### Step 4: Test Gina Memory → RAG → QiNode CRUD

#### 4a. Gina Chat
- [ ] Open Gina chat panel
- [ ] Send a test message
- [ ] Receive response from Gina
- [ ] Check worker logs for processing

#### 4b. RAG Search
- [ ] Perform semantic search
- [ ] Results returned from Supabase
- [ ] Embeddings working correctly

#### 4c. QiNode CRUD
- [ ] **Create**: Create a new note via Gina or UI
- [ ] **Read**: Fetch note by QiD
- [ ] **Update**: Edit note content
- [ ] **Delete**: Soft delete a note
- [ ] Verify all operations sync to Supabase

### Step 5: Graph View
- [ ] Graph view renders nodes
- [ ] Nodes display correctly
- [ ] Relationships visible (if any)

### Step 6: Deployment Test
- [ ] Frontend builds: `pnpm --filter @qinote/web build`
- [ ] Worker builds: `cd worker && npx wrangler deploy --dry-run`
- [ ] No blocking errors

---

## 🐛 Known Issues to Address

1. **TypeScript Errors** (non-blocking for runtime)
   - Some type definitions missing (Supabase types)
   - Test file type issues (vitest matchers)
   - qidocs component dependencies

2. **Missing Environment Variables**
   - Need actual Supabase credentials
   - Need OpenAI API key
   - Worker won't function without these

3. **Database Setup**
   - Supabase schema needs to be deployed
   - Run migrations from `qimind/supabase/`

---

## 📝 Quick Commands

```bash
# Start frontend
cd apps/qinote && pnpm dev

# Start worker
cd worker && npx wrangler dev

# Check health
curl http://localhost:8787/health

# Build frontend
pnpm --filter @qinote/web build

# Build worker
cd worker && npx wrangler deploy --dry-run
```

---

## 🎯 Next Actions

1. **Fill in environment variables** with real credentials
2. **Deploy Supabase schema** (run SQL migrations)
3. **Test full flow**: Create note → Search → Update → Delete
4. **Verify RAG**: Test semantic search with embeddings
5. **Test Gina integration**: Full chat flow with note creation

---

**Status**: Ready for testing once environment variables are configured! 🚀

