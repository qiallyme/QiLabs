# QiOS Local Core - Testing Roadmap

**Status**: Implementation complete. Ready for structured break-it testing.

## Quick Start

```bash
cd workers/local_core
python tests/test_sanity_checks.py
```

## Test Suite Overview

### Automated Tests (`tests/test_sanity_checks.py`)

Run all automated tests:
```bash
python tests/test_sanity_checks.py
```

**Coverage:**
1. ✅ Database migration verification
2. ✅ Ollama health check
3. ✅ RAG pipeline (positive & negative matches)
4. ✅ GINA chat (existence & RAG recall)
5. ✅ Function calling (single & multi-step)

### Manual Tests (`tests/test_manual_failures.md`)

**Required manual intervention:**
- Test 5.1: Ollama down
- Test 5.2: Supabase unavailable
- Test 5.3: Tool failure
- Test 5.4: Invalid tool call
- Test 5.5: Tool execution timeout

### SQL Sanity Checks (`tests/test_db_sanity.sql`)

Run in Supabase SQL Editor to verify:
- Embedding column is `vector(768)`
- RPC function exists and works
- Embeddings are populated

## Test Execution Order

### Phase 1: Foundation (Do First)

**1.1 Database & Migration**
```sql
-- Run in Supabase SQL Editor
-- See: tests/test_db_sanity.sql
```

**1.2 Ollama Health**
```bash
curl http://localhost:11434/api/tags
curl http://localhost:11434/api/embeddings \
  -d '{"model": "nomic-embed-text", "prompt": "test"}'
```

**Expected:**
- `nomic-embed-text` and `llama3.2` models available
- Embedding generation returns 768-dim vector

### Phase 2: RAG Pipeline

**2.1 Positive Match**
```python
from rag import search_semantic_profile
results = search_semantic_profile("no /src folders allowed", limit=5)
# Should return QiOS architecture docs with high scores
```

**2.2 No-Match Behavior**
```python
results = search_semantic_profile("purple alligator tax regulation v9.13", limit=5)
# Should return low scores (near baseline)
```

### Phase 3: GINA Chat

**3.1 Basic Existence**
```bash
curl -X POST http://localhost:7130/gina/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Who are you?"}]}'
```

**Expected:** GINA mentions QiOS, not generic assistant

**3.2 RAG Recall**
```bash
curl -X POST http://localhost:7130/gina/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "What is the rule about /src folders?"}]}'
```

**Expected:** Answer references QiOS docs, includes source citations

### Phase 4: Function Calling

**4.1 Simple Tool Call**
```bash
curl -X POST http://localhost:7130/gina/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Check worker status"}]}'
```

**Expected:** Tool executed, result included in response

**4.2 Multi-Step Chain**
```bash
curl -X POST http://localhost:7130/gina/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "If worker is not running, start it, then confirm status"}]}'
```

**Expected:** Multiple tools executed in sequence

### Phase 5: Failure Modes (Manual)

See `tests/test_manual_failures.md` for detailed procedures.

**Key Tests:**
- Ollama down → explicit error
- Supabase unavailable → explicit error
- Tool failure → error acknowledged in response

## Observability Checklist

Each request should produce logs with:

- [ ] **Request ID**: Session ID or correlation ID
- [ ] **RAG Metrics**:
  - Number of matches
  - Top 3 file paths
  - Top 3 similarity scores
- [ ] **Function Calling**:
  - Iteration number
  - Tool name per iteration
  - Tool arguments
  - Tool result status (OK/ERROR)
- [ ] **Final Reply**:
  - Reply length
  - Truncation info (if any)

**Check logs in:**
- Console output from `qios_local_core.py`
- `system_event` table in SQLite
- Supabase logs (if using cloud)

## Success Criteria

You're ready for production when:

1. ✅ **RAG** consistently surfaces correct QiOS docs for targeted questions
2. ✅ **GINA** uses context and doesn't invent files that don't exist
3. ✅ **Function calling**:
   - Picks correct tools
   - Executes them successfully
   - Uses their output in reasoning
   - Stops after sane number of iterations (≤5)
4. ✅ **Failure modes** are explicit and observable:
   - Errors logged in `system_event`
   - HTTP status codes are appropriate (500 for server errors)
   - Error messages mention specific components (Ollama, Supabase, tool name)

## Red Flags (Fix Before Proceeding)

### Silent Failures
- ❌ GINA responds normally when Ollama is down
- ❌ RAG returns empty array when Supabase is unavailable (should error)
- ❌ Tool execution errors are swallowed

### Hallucination
- ❌ GINA confidently answers questions not in memory
- ❌ Responses don't match ingested documents
- ❌ Source citations don't match actual files

### Broken Tool Execution
- ❌ Tools never execute (only suggested)
- ❌ Tool results not included in final response
- ❌ Tool execution loop never stops (infinite iterations)

## Next Steps After Passing Tests

1. **Run for a week** in real usage
2. **Collect edge cases**: weird queries, unexpected tool chains, performance issues
3. **Only then** add enhancements:
   - Model routing (Ollama vs OpenAI)
   - Caching (embedding cache, RAG result cache)
   - Multi-realm query planning
   - Advanced tool chaining strategies

## Architecture Validation

After testing, you should have:

- ✅ **Local-first embeddings**: Ollama `nomic-embed-text` (768-dim)
- ✅ **Vector RAG**: Supabase `match_semantic_profile` RPC
- ✅ **Tool-wielding GINA**: Auto-invocation with function calling
- ✅ **Supabase as canonical brain**: Single source of truth for embeddings
- ✅ **Observable failures**: Errors are explicit, not silent

This is a **real system**, not architecture fantasy. Treat it accordingly.

