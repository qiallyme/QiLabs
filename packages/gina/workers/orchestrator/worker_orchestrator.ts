/**
 * GINA Orchestrator v0.1
 * Single control plane for all workers.
 * Endpoints:
 *  POST /orchestrator/start
 *  POST /orchestrator/stop
 *  GET  /orchestrator/status
 */

import { createClient } from "@supabase/supabase-js";
import { heartbeat } from "../_shared/heartbeat";
import { OrchestratorState } from "./OrchestratorState";

// Export Durable Object class (required by wrangler.toml)
export { OrchestratorState };

type Env = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  QIOS_ROOT_PATH: string; // e.g. "QiOS_v1" on local or mapped FS
  HEARTBEAT_TTL_SECONDS: string;
  ORCH_STATE?: DurableObjectNamespace; // Optional Durable Object binding
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

      // UI Contract Endpoints
      if (path === "/health" && req.method === "GET") {
        const data = await getHealth(env);
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: corsHeaders,
        });
      }

      if (path === "/queue" && req.method === "GET") {
        const data = await getQueueStatus(env);
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
      await heartbeat(env, "orchestrator", "red", {
        error: e.message || String(e),
        code: "WKR.HEARTBEAT_LOST"
      });
      return new Response(JSON.stringify({ ok: false, error: e.message || String(e) }), { status: 500 });
    }
  }
};

