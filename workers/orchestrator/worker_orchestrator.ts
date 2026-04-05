/**
 * GINA Orchestrator v0.1
 * Single control plane for all workers.
 * Endpoints:
 *  POST /orchestrator/start
 *  POST /orchestrator/stop
 *  GET  /orchestrator/status
 */
import { createClient } from "@supabase/supabase-js";
import { heartbeat } from "../_shared/heartbeat.ts";
import { OrchestratorState } from "./OrchestratorState";
import { DurableObjectNamespace } from "@cloudflare/workers-types";

// Export Durable Object class (required by wrangler.toml)
export { OrchestratorState };

type Env = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  QIOS_ROOT_PATH: string; // e.g. "QiOS_v1" on local or mapped FS
  HEARTBEAT_TTL_SECONDS: string;
  ORCH_STATE?: DurableObjectNamespace;
  OPENAI_API_KEY: string; // for GINA chat
  MEMORY_WORKER_URL?: string; // URL of memory worker (QiBrain) for RAG, e.g. "https://gina-memory.qios-gina.workers.dev"
  CHAT_MODEL?: string; // Chat model name, defaults to "gpt-4o-mini"
};

function sb(env: Env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
}

async function setWorkerState(env: Env, worker_id: string, state: string, meta: any = {}) {
  const supa = sb(env);
  await supa.from("worker_status").update({
    state,
    meta,
    last_heartbeat: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("worker_id", worker_id);
}

async function heartbeatAll(env: Env) {
  const supa = sb(env);
  const { data: workers } = await supa.from("worker_status").select("worker_id, depends_on, state");
  // naive heartbeat: orchestrator alive implies system alive
  if (!workers) return;
  for (const w of workers) {
    await setWorkerState(env, w.worker_id, w.state || "gray");
  }
}

async function status(env: Env) {
  const supa = sb(env);
  const { data, error } = await supa.from("worker_status").select("*").order("layer", { ascending: true });
  if (error) throw error;
  return data;
}

async function getHealth(env: Env) {
  const supa = sb(env);
  const { data: workers } = await supa.from("worker_status").select("worker_id, state, last_heartbeat, meta");
  
  // Get layer states from rules (simplified)
  const layers = {
    ROT: { state: "green", last: new Date().toISOString(), msg: "ok" },
    DM: { state: "green", last: new Date().toISOString(), msg: "ok" },
    RLM: { state: "green", last: new Date().toISOString(), msg: "ok" },
    FID: { state: "green", last: new Date().toISOString(), msg: "ok" },
    NAM: { state: "green", last: new Date().toISOString(), msg: "ok" },
    MTA: { state: "green", last: new Date().toISOString(), msg: "ok" },
    SEM: { state: "gray", last: null, msg: "idle" },
    HEL: { state: "gray", last: null, msg: "idle" },
  };
  
  // Update layer states based on worker status
  if (workers) {
    for (const w of workers) {
      const state = w.state === "green" ? "green" : w.state === "red" ? "red" : "orange";
      if (w.worker_id === "orchestrator") {
        layers.ROT.state = state;
        layers.ROT.last = w.last_heartbeat;
      }
      if (w.worker_id === "ingestion") {
        layers.SEM.state = state;
        layers.SEM.last = w.last_heartbeat;
      }
    }
  }
  
  return {
    runtime: "active",
    last_tick: new Date().toISOString(),
    layers,
  };
}

async function getQueueStatus(env: Env) {
  const supa = sb(env);
  
  // Get counts for each status
  const [pendingRes, inProgressRes, completeRes, quarantinedRes] = await Promise.all([
    supa.from("ingestion_queue").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supa.from("ingestion_queue").select("*", { count: "exact", head: true }).eq("status", "in_progress"),
    supa.from("ingestion_queue").select("*", { count: "exact", head: true }).eq("status", "complete"),
    supa.from("ingestion_queue").select("*", { count: "exact", head: true }).eq("status", "quarantined"),
  ]);
  
  const { data: lastItem } = await supa
    .from("ingestion_queue")
    .select("file_path, updated_at")
    .eq("status", "complete")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  
  return {
    pending: pendingRes.count || 0,
    in_progress: inProgressRes.count || 0,
    complete: completeRes.count || 0,
    quarantined: quarantinedRes.count || 0,
    last_ingested: lastItem?.file_path || null,
    last_ingested_at: lastItem?.updated_at || null,
  };
}

/**
 * Get queue status aggregated by status (for GINA telemetry)
 */
async function getQueueAggregate(env: Env) {
  const supa = sb(env);
  
  // Get all items grouped by status
  const { data: allItems } = await supa
    .from("ingestion_queue")
    .select("status");
  
  if (!allItems) {
    return { pending: 0, in_progress: 0, complete: 0, quarantined: 0, error: 0, missing: 0, total: 0 };
  }
  
  const counts: Record<string, number> = {};
  allItems.forEach((item: any) => {
    const status = item.status || "unknown";
    counts[status] = (counts[status] || 0) + 1;
  });
  
  return {
    pending: counts.pending || 0,
    in_progress: counts.in_progress || 0,
    complete: counts.complete || 0,
    quarantined: counts.quarantined || 0,
    error: counts.error || 0,
    missing: counts.missing || 0,
    total: allItems.length,
    by_status: counts,
  };
}

/**
 * Get count of embedded items in semantic_profile
 */
async function getSemanticProfileCount(env: Env) {
  const supa = sb(env);
  
  const { count, error } = await supa
    .from("semantic_profile")
    .select("*", { count: "exact", head: true });
  
  if (error) {
    console.warn(`Failed to get semantic_profile count: ${error.message}`);
    return { total: 0, embedded: 0, pending: 0 };
  }
  
  // Get counts by embedding_status if available
  const { data: allProfiles } = await supa
    .from("semantic_profile")
    .select("embedding_status");
  
  const embedded = allProfiles?.filter((p: any) => p.embedding_status === "complete" || p.embedding_status === "embedded").length || 0;
  const pending = allProfiles?.filter((p: any) => p.embedding_status === "pending").length || 0;
  
  return {
    total: count || 0,
    embedded,
    pending,
  };
}

async function getWorkersStatus(env: Env) {
  const supa = sb(env);
  const { data: workers } = await supa
    .from("worker_status")
    .select("worker_id, state, last_heartbeat, meta");
  
  const statusMap: Record<string, any> = {};
  
  if (workers) {
    for (const w of workers) {
      const status = w.state === "green" ? "healthy" : w.state === "red" ? "down" : "degraded";
      const lastHeartbeat = w.last_heartbeat ? new Date(w.last_heartbeat).getTime() : null;
      const now = Date.now();
      const uptime = lastHeartbeat ? Math.floor((now - lastHeartbeat) / 1000) : 0;

      statusMap[w.worker_id] = {
        status,
        last_heartbeat: w.last_heartbeat,
        uptime_seconds: uptime,
        ...(w.meta || {}),
      };
    }
  }
  
  // Add scanner status (from snapshot file if available)
  // This would need to be enhanced to read from actual scanner state
  
  return statusMap;
}

async function getErrors(env: Env) {
  const supa = sb(env);
  const { data: workers } = await supa.from("worker_status").select("worker_id, last_error_code, last_error_message, last_error_at").not("last_error_code", "is", null).order("last_error_at", { ascending: false }).limit(50);
  
  return (workers || []).map((w: any) => ({
    ts: w.last_error_at || new Date().toISOString(),
    layer: "UNK", // TODO: Map worker_id to layer
    rule: null,
    code: w.last_error_code,
    msg: w.last_error_message || "Unknown error",
    file: null,
    severity: "warn",
  }));
}

async function getFileHistory(env: Env, page: number = 1, perPage: number = 50) {
  const supa = sb(env);
  const offset = (page - 1) * perPage;
  
  const { data: events, count } = await supa
    .from("file_history")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + perPage - 1);
  
  return {
    events: (events || []).map((e: any) => ({
      id: e.id,
      file_path: e.file_path,
      content_hash: e.content_hash,
      event_type: e.event_type,
      actor: e.actor,
      meta: e.meta || {},
      created_at: e.created_at,
    })),
    total: count || 0,
    page,
    per_page: perPage,
  };
}

async function getWorkflowGraph(env: Env) {
  const supa = sb(env);
  
  // Get queue status
  const { count: queueCount } = await supa
    .from("ingestion_queue")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  
  // Get worker statuses
  const { data: workers } = await supa
    .from("worker_status")
    .select("worker_id, state, last_heartbeat");
  
  // Build workflow graph
  const nodes = [
    {
      id: "trigger_scan",
      type: "trigger",
      label: "Daily Scan",
      status: "complete",
      timestamp: new Date().toISOString(),
    },
    {
      id: "queue_insert",
      type: "queue",
      label: "Ingestion Queue",
      status: queueCount && queueCount > 0 ? "active" : "idle",
      count: queueCount || 0,
    },
  ];
  
  // Add layer nodes
  const layers = ["ROT", "DM", "RLM", "FID", "NAM", "MTA", "SEM", "HEL"];
  const layerLabels: Record<string, string> = {
    ROT: "Root Integrity",
    DM: "Dark Matter",
    RLM: "Realm Schema",
    FID: "File Identity",
    NAM: "Naming",
    MTA: "Metadata",
    SEM: "Semantic Routing",
    HEL: "Self-Healing",
  };
  
  layers.forEach((layer, idx) => {
    nodes.push({
      id: `layer${idx}`,
      type: "layer",
      label: `${layer}: ${layerLabels[layer]}`,
      status: "complete",
      timestamp: new Date().toISOString(),
    });
  });
  
  const edges = [
    { from: "trigger_scan", to: "queue_insert", type: "enqueue" },
    { from: "queue_insert", to: "layer0", type: "process" },
  ];
  
  // Add layer edges
  for (let i = 0; i < layers.length - 1; i++) {
    edges.push({
      from: `layer${i}`,
      to: `layer${i + 1}`,
      type: "next",
    });
  }
  
  return { nodes, edges };
}

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const GINA_SYSTEM_PROMPT = `
You are Gina, the QiOS_G.I.N.A. Orchestrator assistant and system navigator.
You help the user understand the state of their QiOS workers, ingestion,
memory, and overall system health. You speak clearly, concisely, and can
suggest next actions in terms of QiOS components (workers, queues, ingestion, etc.).
Do not invent system state; if the user asks for something you don't know,
say what additional context or endpoints would be needed.
`.trim();

/**
 * Build RAG context string from matches
 */
function buildRagContext(matches: any[]): string {
  if (!matches || matches.length === 0) {
    return "";
  }

  const contextParts = matches.map((match, idx) => {
    const filePath = match.file_path || match.doc_path || "unknown";
    const text = match.text || match.chunk_text || "";
    const similarity = match.similarity !== undefined ? ` (similarity: ${match.similarity.toFixed(3)})` : "";
    return `[${idx + 1}] file_path: ${filePath}${similarity}\n${text}`;
  });

  return `Relevant context (may be incomplete, do not hallucinate beyond this):\n\n${contextParts.join("\n\n")}`;
}

async function handleGinaChatRequest(req: Request, env: Env) {
  const body = await req.json().catch(() => ({}));
  
  // Support both old format (messages array) and new format (message string)
  const messages = (body.messages || []) as ChatMessage[];
  const userMessage = body.message || (messages.length > 0 ? messages[messages.length - 1]?.content : "");
  
  // Extract optional filters for RAG
  const realm = body.realm || null;
  const realmSlug = body.realmSlug || null;
  const pathPrefix = body.pathPrefix || null;
  const enableRag = body.enableRag !== false; // Default to true if not specified
  const matchCount = body.matchCount || 10;

  if (!userMessage || (messages.length === 0 && !userMessage)) {
    throw new Error("Missing or invalid 'message' string or 'messages' array in request body.");
  }

  // Step 0: Gather live system state (workers, queue, health, embeddings)
  let systemStateContext = "";
  try {
    const [health, workersStatus, queueStatus, queueAgg, embedCount] = await Promise.all([
      getHealth(env),
      getWorkersStatus(env),
      getQueueStatus(env),
      getQueueAggregate(env),
      getSemanticProfileCount(env),
    ]);

    // Build system state summary
    const workerStates = Object.entries(workersStatus)
      .map(([id, status]: [string, any]) => {
        const state = status.status === "healthy" ? "🟢" : status.status === "down" ? "🔴" : "🟡";
        return `${state} ${id}: ${status.status} (last heartbeat: ${status.last_heartbeat || "never"})`;
      })
      .join("\n");

    systemStateContext = `
## Current QiOS System State (as of ${new Date().toISOString()})

### Worker Status:
${workerStates || "No workers registered"}

### Ingestion Queue:
- Pending: ${queueStatus.pending}
- In Progress: ${queueStatus.in_progress}
- Complete: ${queueStatus.complete}
- Quarantined: ${queueStatus.quarantined}
- Total in queue: ${queueAgg.total}
${queueStatus.last_ingested ? `- Last ingested: ${queueStatus.last_ingested} (${queueStatus.last_ingested_at})` : ""}

### Semantic Profile (Embeddings):
- Total profiles: ${embedCount.total}
- Embedded/complete: ${embedCount.embedded}
- Pending embedding: ${embedCount.pending}

### System Health:
- Runtime: ${health.runtime}
- Last tick: ${health.last_tick}
- Layer states: ${JSON.stringify(health.layers, null, 2)}

## Instructions:
You are GINA, the Orchestrator for the QiOS system. You have live telemetry from Supabase about workers, queues, and events.

When the human asks about system state, workers, queues, or ingestion:
- Use the telemetry data above to answer accurately
- Highlight any risks (degraded workers, large pending queues, etc.)
- Suggest concrete next actions based on the current state
- Do NOT claim you lack access to live data - this telemetry IS your view of the system
- Do NOT invent or guess system state - only use the data provided above

The telemetry is updated in real-time with each request, so your answers reflect the current state of QiOS.
`.trim();
  } catch (e: any) {
    console.warn(`Failed to gather system state: ${e.message}`);
    systemStateContext = "\n## System State: Unable to retrieve current state (workers may be offline)\n";
  }

  // Step 1: Call memory worker (QiBrain) for RAG if enabled and URL is configured
  let ragContext = "";
  let ragMatches: any[] = [];
  let ragUsed = false;

  if (enableRag && env.MEMORY_WORKER_URL) {
    try {
      const memoryResponse = await fetch(`${env.MEMORY_WORKER_URL}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: userMessage,
          matchCount: matchCount,
          realm: realm,
          realmSlug: realmSlug,
          pathPrefix: pathPrefix,
        }),
      });

      if (memoryResponse.ok) {
        const memoryData = await memoryResponse.json();
        ragMatches = memoryData.matches || [];
        if (ragMatches.length > 0) {
          ragContext = buildRagContext(ragMatches);
          ragUsed = true;
        }
      } else {
        console.warn(`Memory worker returned ${memoryResponse.status}, continuing without RAG`);
      }
    } catch (e: any) {
      console.warn(`Memory worker call failed: ${e.message}, continuing without RAG`);
      // Continue without RAG if memory worker is unavailable
    }
  }

  // Step 2: Build messages for LLM with system state injected
  const openaiMessages: ChatMessage[] = [
    { role: "system", content: GINA_SYSTEM_PROMPT + "\n\n" + systemStateContext },
  ];

  // Add RAG context as a system message if available
  if (ragContext) {
    openaiMessages.push({
      role: "system",
      content: ragContext,
    });
  }

  // Add user messages (either from messages array or single message)
  if (messages.length > 0) {
    // Use messages array (preserve conversation history)
    openaiMessages.push(...messages);
  } else {
    // Use single message
    openaiMessages.push({
      role: "user",
      content: userMessage,
    });
  }

  // Step 3: Call OpenAI
  const chatModel = env.CHAT_MODEL || "gpt-4o-mini";
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: chatModel,
      messages: openaiMessages,
      temperature: 0.3,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenAI error: ${resp.status} – ${text}`);
  }

  const data = await resp.json();
  const reply =
    data?.choices?.[0]?.message?.content ??
    "I couldn't generate a reply. Please try again.";

  return {
    ok: true,
    reply,
    matches: ragMatches,
    meta: {
      rag_used: ragUsed,
      match_count: ragMatches.length,
      chat_model: chatModel,
    },
  };
}

export default {
  async fetch(req: Request, env: Env) {
    const url = new URL(req.url);
    const path = url.pathname;

    try {
      if (path === "/orchestrator/start" && req.method === "POST") {
        await heartbeat(env, "orchestrator", "green", { reason: "manual_start" });
        await heartbeatAll(env);
        return new Response(JSON.stringify({ ok: true, message: "QiOS started" }), { status: 200 });
      }

      if (path === "/orchestrator/stop" && req.method === "POST") {
        await heartbeat(env, "orchestrator", "gray", { reason: "manual_stop" });
        return new Response(JSON.stringify({ ok: true, message: "QiOS stopped" }), { status: 200 });
      }

      if (path === "/orchestrator/status" && req.method === "GET") {
        const data = await status(env);
        return new Response(JSON.stringify({ ok: true, workers: data }), { status: 200 });
      }

      // CORS headers
      const corsHeaders = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      };

      // Handle OPTIONS preflight
      if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders });
      }

      // Gina chat endpoint for Launcher / Cockpit
      // Support both /gina/chat and /api/gina/chat for compatibility
      if ((path === "/gina/chat" || path === "/api/gina/chat") && req.method === "POST") {
        const data = await handleGinaChatRequest(req, env);
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: corsHeaders,
        });
      }

      // UI Contract Endpoints
      if (path === "/health" && req.method === "GET") {
        const data = await getHealth(env);
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: corsHeaders,
        });
      }

      if (path === "/workers" && req.method === "GET") {
        const data = await getWorkersStatus(env);
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: corsHeaders,
        });
      }

      if (path === "/errors" && req.method === "GET") {
        const errors = await getErrors(env);
        return new Response(JSON.stringify(errors), {
          status: 200,
          headers: corsHeaders,
        });
      }

      if (path === "/file_history" && req.method === "GET") {
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const perPage = parseInt(url.searchParams.get("per_page") || "50", 10);
        const history = await getFileHistory(env, page, perPage);
        return new Response(JSON.stringify(history), {
          status: 200,
          headers: corsHeaders,
        });
      }

      if (path === "/workflow_graph" && req.method === "GET") {
        const graph = await getWorkflowGraph(env);
        return new Response(JSON.stringify(graph), {
          status: 200,
          headers: corsHeaders,
        });
      }

      return new Response("Not found", { status: 404 });
    } catch (e: any) {
      const errorMsg = e?.message || String(e);

      await heartbeat(env, "orchestrator", "red", {
        error: errorMsg,
        code: "WKR.HEARTBEAT_LOST",
      });

      const corsHeaders = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      };

      return new Response(
        JSON.stringify({ ok: false, error: errorMsg }),
        { status: 500, headers: corsHeaders },
      );
    }
  }
};

