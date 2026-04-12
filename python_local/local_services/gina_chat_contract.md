---
title: GINA Chat API Contract
slug: gina_chat_contract
realm: QiVault
type: doc
node: concept
created: "2025-11-28T00:00:00Z"
updated: "2025-11-28T00:00:00Z"
version: "1.0.0"
status: canonical
system: qios
keywords: [gina, api, contract, chat, interface]
tags: [api, contract, gina]
context: API contract definition for GINA chat endpoint
sensitivity: internal
classification: system_darkmatter
---

# GINA Chat API Contract

**Endpoint:** `POST /gina/chat`

**Purpose:** Orchestrator-aware chat interface for GINA (Generative Intelligence Neural Archivist). GINA responds with text replies and optional structured context about system state (queue, workers, health).

---

## Request Schema

```typescript
interface GinaChatRequest {
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
}
```

**Python (Pydantic):**
```python
class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str

class GinaChatRequest(BaseModel):
    messages: List[ChatMessage]
```

**Notes:**
- `messages` array follows OpenAI Chat Completions format
- First message with `role: "system"` is optional (GINA injects its own system prompt)
- Conversation history is preserved by passing full `messages` array
- Each message must have `role` and `content` fields

---

## Response Schema

```typescript
interface GinaChatResponse {
  reply: string;
  context?: {
    queue?: {
      total: number;
      by_status: {
        pending: number;
        in_progress: number;
        complete: number;
        quarantined: number;
      };
    };
    workers?: Array<{
      name: string;
      status: string;
      last_heartbeat: string | null;
      meta: Record<string, any>;
    }>;
    health?: {
      status: string;
      runtime: string;
      last_tick: string | null;
      layers?: Record<string, any>;
    };
  };
}
```

**Python (Pydantic):**
```python
class QueueContext(BaseModel):
    total: int
    by_status: Dict[str, int]

class WorkerContext(BaseModel):
    name: str
    status: str
    last_heartbeat: Optional[str]
    meta: Dict[str, Any]

class HealthContext(BaseModel):
    status: str
    runtime: str
    last_tick: Optional[str]
    layers: Optional[Dict[str, Any]] = None

class GinaChatContext(BaseModel):
    queue: Optional[QueueContext] = None
    workers: Optional[List[WorkerContext]] = None
    health: Optional[HealthContext] = None

class GinaChatResponse(BaseModel):
    reply: str
    context: Optional[GinaChatContext] = None
```

**Notes:**
- `reply` is always present (GINA's text response)
- `context` is optional and includes live system telemetry
- `context.queue` shows ingestion queue state
- `context.workers` shows worker status array
- `context.health` shows overall system health
- All context fields are optional (may be omitted if unavailable)

---

## Example Request

```json
{
  "messages": [
    {
      "role": "user",
      "content": "What's the status of the ingestion queue?"
    }
  ]
}
```

## Example Response

```json
{
  "reply": "The ingestion queue currently has 5 pending items, 2 in progress, and 47 completed. No items are quarantined. All workers are healthy.",
  "context": {
    "queue": {
      "total": 54,
      "by_status": {
        "pending": 5,
        "in_progress": 2,
        "complete": 47,
        "quarantined": 0
      }
    },
    "workers": [
      {
        "name": "ingest_worker",
        "status": "healthy",
        "last_heartbeat": "2025-11-28T12:34:56Z",
        "meta": {}
      }
    ],
    "health": {
      "status": "ok",
      "runtime": "local",
      "last_tick": "2025-11-28T12:34:56Z",
      "layers": {}
    }
  }
}
```

---

## Error Responses

**400 Bad Request:**
```json
{
  "detail": "Missing or invalid 'messages' array in request body."
}
```

**500 Internal Server Error:**
```json
{
  "detail": "Database error: [error message]"
}
```

---

## Implementation Notes

1. **System Prompt Injection:** GINA automatically injects its system prompt as the first message. User-provided system messages are preserved but GINA's prompt takes precedence.

2. **Context Gathering:** The `context` object is populated by querying:
   - `/queue` endpoint for queue state
   - `/workers` endpoint for worker status
   - `/health` endpoint for system health

3. **Local vs Cloud:** 
   - Local core (`qios_local_core.py`) uses SQLite for queue/workers/health
   - Cloud orchestrator (`worker_orchestrator.ts`) uses Supabase for telemetry

4. **RAG Integration:** GINA may use semantic search (via `/query`) to augment responses, but this is internal implementation detail and not exposed in the contract.

---

## Version History

- **v1.0.0** (2025-11-28): Initial contract definition

