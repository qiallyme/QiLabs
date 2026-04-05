# QiOS Local Core Test Suite

Comprehensive testing for the local-first cognitive stack.

## Quick Start

```bash
cd workers/local_core
python tests/test_sanity_checks.py
```

## Test Coverage

### 1. Sanity Checks (Foundation)

**1.1 Database & Migration**
- Verifies `semantic_profile.embedding` is `vector(768)`
- Checks for existing embeddings
- Tests `match_semantic_profile` RPC function

**1.2 Ollama Health**
- Verifies Ollama is running
- Checks required models are available (`nomic-embed-text`, `llama3.2`)
- Tests embedding generation

### 2. RAG Pipeline

**2.1 Positive Match Test**
- Searches for known content
- Validates top results are relevant
- Checks similarity scores

**2.2 No-Match Behavior**
- Tests irrelevant queries
- Validates low scores for unrelated content

### 3. GINA Chat

**3.1 Basic Existence**
- Verifies GINA identifies herself
- Checks system awareness

**3.2 RAG Recall**
- Tests retrieval of specific knowledge
- Validates source citations

### 4. Function Calling

**4.1 Simple Single-Tool Call**
- Tests automatic tool invocation
- Validates tool execution and result injection

**4.2 Multi-Step Tool Chain**
- Tests tool chaining (check → act → verify)
- Validates iteration limits

### 5. Failure Modes (Manual)

**5.1 Ollama Down**
- Stop Ollama, test error handling
- Expected: Clear error, not hallucination

**5.2 Supabase Unavailable**
- Break Supabase connection
- Expected: Explicit error, not silent failure

**5.3 Tool Failure**
- Break a tool, test error handling
- Expected: Error acknowledged in response

## Manual Testing Procedures

### Test 5.1: Ollama Down

1. Stop Ollama: `pkill ollama` or stop the service
2. Ask GINA: "Summarize the QiOS directory layout."
3. Expected: Error message about Ollama connection failure
4. Red flag: Normal-looking but false answer

### Test 5.2: Supabase Unavailable

1. Break connection: Set wrong `SUPABASE_URL` or disable network
2. Ask GINA: "What's my current memory state?"
3. Expected: Explicit error about Supabase connection
4. Red flag: "No matches found" when it should be an error

### Test 5.3: Tool Failure

1. Temporarily break `start_worker.py` (add `raise Exception("test")`)
2. Ask GINA: "Start the worker."
3. Expected: Response acknowledges failure
4. Red flag: Claims success despite error

## Observability Checklist

Each request should log:

- [ ] Request ID / correlation ID
- [ ] RAG: number of matches, top 3 file paths + scores
- [ ] Function calling: iteration number, tool name, args, result status
- [ ] Final reply length

Check logs in:
- `system_event` table (SQLite)
- Console output from `qios_local_core.py`

## Success Criteria

You're ready when:

1. ✅ RAG consistently surfaces correct QiOS docs
2. ✅ GINA uses context and doesn't invent files
3. ✅ Function calling picks correct tools, executes them, uses output
4. ✅ Failure modes are explicit, not silent

## Next Steps

After passing all tests:

1. Run for a week in real usage
2. Collect edge cases and weird behaviors
3. Only then add enhancements (caching, routing, etc.)

