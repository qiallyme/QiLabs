/**
 * Semantic Routing Worker v0.1 (Cloudflare)
 * Layer: 6 semantic routing
 *
 * Responsibilities:
 * - Read semantic_profile rows with embedding_status = 'complete'
 * - Use vector similarity + rules to propose realm/subpath
 * - Write routing suggestion + confidence to routing_prior
 * - Record event to file_history (event_type: 'routed', actor: 'router')
 * - Publish heartbeat + errors to worker_status
 */

import { createClient } from "@supabase/supabase-js";
import { heartbeat, fail } from "../_shared/heartbeat.ts";
import { isIgnored } from "../_shared/ignore.ts";

type Env = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  WORKER_ID: string; // "semantic_router"
};

function sb(env: Env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
}

async function pullRoutableProfiles(env: Env, limit = 10) {
  const supa = sb(env);
  const { data, error } = await supa
    .from("semantic_profile")
    .select("*")
    .eq("embedding_status", "complete")
    .is("route_confidence", null)
    .order("updated_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

async function proposeRoute(env: Env, profile: any) {
  // TODO: Real implementation uses vector similarity + rules
  // For now: simple stub based on file path patterns
  const filePath = profile.file_path || "";
  let realmGuess = "QiVault";
  let confidence = 0.5;

  // Simple pattern matching (placeholder)
  if (filePath.includes("realms/qipersonal")) {
    realmGuess = "QiPersonal";
    confidence = 0.8;
  } else if (filePath.includes("realms/qibusiness")) {
    realmGuess = "QiBusiness";
    confidence = 0.8;
  } else if (filePath.includes("realms/qiclients")) {
    realmGuess = "QiClients";
    confidence = 0.8;
  }

  return {
    realm: realmGuess,
    confidence,
    suggested_path: filePath, // TODO: Calculate optimal subpath
  };
}

async function writeRoutingPrior(env: Env, profile: any, route: any) {
  const supa = sb(env);
  const { error } = await supa
    .from("routing_prior")
    .upsert(
      {
        file_path: profile.file_path,
        qid: profile.qid,
        realm: route.realm,
        confidence: route.confidence,
        suggested_path: route.suggested_path,
        meta: { worker: "semantic_router", timestamp: new Date().toISOString() },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "file_path" }
    );

  if (error) throw error;
}

async function updateProfileRoute(env: Env, profile: any, route: any) {
  const supa = sb(env);
  const { error } = await supa
    .from("semantic_profile")
    .update({
      route_confidence: route.confidence,
      realm: route.realm,
      updated_at: new Date().toISOString(),
    })
    .eq("file_path", profile.file_path);

  if (error) throw error;
}

async function recordFileHistory(env: Env, profile: any, route: any) {
  const supa = sb(env);
  const { error } = await supa.from("file_history").insert({
    file_path: profile.file_path,
    qid: profile.qid,
    event_type: "routed",
    actor: "router",
    meta: {
      realm: route.realm,
      confidence: route.confidence,
      suggested_path: route.suggested_path,
    },
    created_at: new Date().toISOString(),
  });

  if (error) throw error;
}

async function processProfile(env: Env, profile: any) {
  // 0) Check if file should be ignored (Dark Matter protection)
  if (isIgnored(profile.file_path)) {
    // Skip routing for ignored files - they're read-only
    return;
  }

  // 1) Propose route
  const route = await proposeRoute(env, profile);

  // 2) Write routing_prior
  await writeRoutingPrior(env, profile, route);

  // 3) Update semantic_profile
  await updateProfileRoute(env, profile, route);

  // 4) Record file_history
  await recordFileHistory(env, profile, route);
}

export default {
  async fetch(req: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const workerId = env.WORKER_ID || "semantic_router";
    const url = new URL(req.url);
    const path = url.pathname;

    try {
      if (path === "/health" && req.method === "GET") {
        const supa = sb(env);
        const { data: status } = await supa
          .from("worker_status")
          .select("*")
          .eq("worker_id", workerId)
          .single();

        return new Response(
          JSON.stringify({
            ok: true,
            worker_id: workerId,
            state: status?.state || "gray",
            last_heartbeat: status?.last_heartbeat || null,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response("Not found", { status: 404 });
    } catch (e: any) {
      await fail(env, workerId, "WKR.FETCH_ERROR", e.message || String(e));
      return new Response(
        JSON.stringify({ ok: false, error: e.message || String(e) }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },

  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    const workerId = env.WORKER_ID || "semantic_router";

    try {
      await heartbeat(env, workerId, "green", { phase: "scheduled_start" });

      const profiles = await pullRoutableProfiles(env, 20);

      if (profiles.length === 0) {
        await heartbeat(env, workerId, "green", { phase: "idle" });
        return;
      }

      for (const profile of profiles) {
        try {
          await processProfile(env, profile);
          await heartbeat(env, workerId, "green", {
            last_processed: profile.file_path,
          });
        } catch (e: any) {
          await fail(env, workerId, "SEM.ROUTE_FAIL", e.message || String(e), {
            file_path: profile.file_path,
          });
        }
      }

      await heartbeat(env, workerId, "green", {
        phase: "batch_complete",
        processed: profiles.length,
      });
    } catch (e: any) {
      await fail(env, workerId, "WKR.QUEUE_STALL", e.message || String(e));
      throw e;
    }
  },
};

