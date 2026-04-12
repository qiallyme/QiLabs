# Manual Failure Mode Tests

These tests require manual intervention to break the system and verify error handling.

## Test 5.1: Ollama Down

### Setup
1. Stop Ollama:
   ```bash
   # Linux/Mac
   pkill ollama
   
   # Windows
   taskkill /F /IM ollama.exe
   ```

### Test
Send request to GINA:
```bash
curl -X POST http://localhost:7130/gina/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Summarize the QiOS directory layout."}
    ]
  }'
```

### Expected Behavior
- ✅ **PASS**: Returns HTTP 500 with clear error message about Ollama connection failure
- ✅ **PASS**: Error message mentions Ollama URL and model
- ❌ **FAIL**: Returns 200 with a normal-looking but false answer (silent hallucination)

### Red Flags
- Response claims to summarize QiOS but clearly doesn't use RAG
- No error logged in `system_event` table
- Error message is generic ("Something went wrong")

---

## Test 5.2: Supabase Unavailable

### Setup
1. Break Supabase connection:
   ```bash
   # Option 1: Set wrong URL
   export SUPABASE_URL="https://invalid-url.supabase.co"
   
   # Option 2: Set wrong key
   export SUPABASE_SERVICE_ROLE_KEY="invalid-key"
   
   # Option 3: Disable network (if local)
   # sudo ifconfig eth0 down  # Linux
   ```

### Test
Send request to GINA:
```bash
curl -X POST http://localhost:7130/gina/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What is my current memory state?"}
    ]
  }'
```

### Expected Behavior
- ✅ **PASS**: Returns HTTP 500 with explicit error about Supabase connection
- ✅ **PASS**: Error message mentions Supabase URL or authentication
- ❌ **FAIL**: Returns 200 with "No matches found" (should be an error, not empty results)

### Red Flags
- Response says "I don't have that information" without mentioning connection failure
- No error logged
- RAG search returns empty array instead of raising exception

---

## Test 5.3: Tool Failure

### Setup
1. Temporarily break `start_worker.py`:
   ```python
   # Add at top of run() function in start_worker.py
   def run(args: Dict[str, Any], env: Dict) -> Dict[str, Any]:
       raise Exception("TEST: Tool intentionally broken")
   ```

### Test
Send request to GINA:
```bash
curl -X POST http://localhost:7130/gina/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Start the local ingestion worker for me."}
    ]
  }'
```

### Expected Behavior
- ✅ **PASS**: GINA acknowledges failure in response
- ✅ **PASS**: Response mentions the error (e.g., "Failed to start worker: TEST: Tool intentionally broken")
- ✅ **PASS**: Tool execution error is logged in `system_event`
- ❌ **FAIL**: Response claims success despite error
- ❌ **FAIL**: Error is swallowed and not mentioned

### Red Flags
- "I have started the worker" when tool actually failed
- No error in logs
- Tool suggestion shows `success: true` despite failure

---

## Test 5.4: Invalid Tool Call

### Setup
No setup needed - this tests malformed tool calls.

### Test
Manually inject a tool call with invalid arguments:
```python
# This would come from a malformed LLM response
tool_call = {
    "function": {
        "name": "start_worker",
        "arguments": '{"worker_name": null}'  # Invalid: null instead of string
    }
}
```

### Expected Behavior
- ✅ **PASS**: Tool validation catches invalid args
- ✅ **PASS**: Error is returned to LLM for correction
- ✅ **PASS**: Final response acknowledges the issue
- ❌ **FAIL**: Tool executes with invalid args and crashes
- ❌ **FAIL**: Error is swallowed

---

## Test 5.5: Tool Execution Timeout

### Setup
Create a tool that hangs:
```python
# In a test tool
import time
time.sleep(300)  # Hang for 5 minutes
```

### Test
Ask GINA to use the hanging tool.

### Expected Behavior
- ✅ **PASS**: Tool execution times out (30s default)
- ✅ **PASS**: Timeout error is returned
- ✅ **PASS**: GINA acknowledges timeout in response
- ❌ **FAIL**: Request hangs indefinitely
- ❌ **FAIL**: No timeout mechanism

---

## Verification Checklist

After each failure test, verify:

- [ ] Error is logged in `system_event` table
- [ ] Error message is specific (mentions component: Ollama, Supabase, tool name)
- [ ] HTTP status code is appropriate (500 for server errors, not 200)
- [ ] Response body contains error details (not generic "Something went wrong")
- [ ] Console logs show the error with context
- [ ] GINA's response acknowledges the failure (if applicable)

## Success Criteria

All failure modes should:

1. **Fail loudly**: Clear errors, not silent degradation
2. **Fail specifically**: Mention which component failed (Ollama, Supabase, tool name)
3. **Fail observably**: Errors logged in `system_event` and console
4. **Fail gracefully**: Don't crash the entire service

If any test shows silent failure or hallucination, fix the error handling before proceeding.

