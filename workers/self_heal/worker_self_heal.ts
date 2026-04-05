/**
 * Self-Healing Worker v0.2 (Cloudflare)
 * Layer: 7 self-healing
 *
 * Responsibilities:
 * - Dedupe detection (find duplicate content_hash)
 * - Version lineage tracking
 * - Quarantine invalid files
 * - Record events to file_history (event_type: 'deduped' | 'quarantined', actor: 'heal')
 * - Create recommended actions in self_heal_actions table
 * - Publish heartbeat + errors to worker_status
 */

import { createClient } from "@supabase/supabase-js";
import { heartbeat, fail } from "../_shared/heartbeat.ts";

type Env = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  WORKER_ID: string; // "self_heal"
};

interface HealAction {
  id?: string;
  type:
    | "dedupe_delete"
    | "merge_candidate"
    | "quarantine"
    | "fix_front_matter"
    | "normalize_path"
    | "move_to_realm"
    | "rename";
  src?: string;
  dest?: string;
  reason: string;
  confidence: number;
  metadata?: any;
}

function sb(env: Env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
}

async function findDuplicates(env: Env, limit = 10) {
  const supa = sb(env);
  // Find files with duplicate content_hash
  const { data, error } = await supa
    .rpc("find_duplicate_files", {})
    .limit(limit);

  if (error) {
    // If RPC doesn't exist, use a simple query
    const { data: profiles, error: queryError } = await supa
      .from("semantic_profile")
      .select("file_path, content_hash, qid")
      .not("content_hash", "is", null)
      .order("updated_at", { ascending: true })
      .limit(limit * 10);

    if (queryError) throw queryError;

    // Group by content_hash to find duplicates
    const hashMap = new Map<string, any[]>();
    for (const profile of profiles || []) {
      if (!profile.content_hash) continue;
      if (!hashMap.has(profile.content_hash)) {
        hashMap.set(profile.content_hash, []);
      }
      hashMap.get(profile.content_hash)!.push(profile);
    }

    // Return only groups with duplicates
    const duplicates: any[] = [];
    for (const [hash, files] of hashMap.entries()) {
      if (files.length > 1) {
        duplicates.push({ content_hash: hash, files });
      }
    }
    return duplicates.slice(0, limit);
  }

  return data || [];
}

async function recordDedupe(env: Env, duplicate: any) {
  const supa = sb(env);
  const primary = duplicate.files[0];
  const duplicates = duplicate.files.slice(1);

  for (const dup of duplicates) {
    // Record in file_history
    await supa.from("file_history").insert({
      file_path: dup.file_path,
      qid: dup.qid,
      event_type: "deduped",
      actor: "heal",
      meta: {
        primary_file: primary.file_path,
        primary_qid: primary.qid,
        content_hash: duplicate.content_hash,
      },
      created_at: new Date().toISOString(),
    });

    // Create action recommendation
    const action: HealAction = {
      type: "dedupe_delete",
      src: dup.file_path,
      reason: `Duplicate content_hash with ${primary.file_path}`,
      confidence: 0.99,
      metadata: {
        primary_path: primary.file_path,
        primary_qid: primary.qid,
        content_hash: duplicate.content_hash,
        duplicate_qid: dup.qid,
      },
    };

    await supa.from("self_heal_actions").insert({
      worker_id: env.WORKER_ID || "self_heal",
      type: action.type,
      src: action.src,
      dest: action.dest || null,
      reason: action.reason,
      confidence: action.confidence,
      metadata: action.metadata || {},
    });
  }
}

async function findInvalidFiles(env: Env, limit = 10) {
  const supa = sb(env);
  // Find files that violate governance rules
  // For now: placeholder - check for missing required metadata
  const { data, error } = await supa
    .from("semantic_profile")
    .select("file_path, qid, realm")
    .is("realm", null)
    .limit(limit);

  if (error) throw error;
  return data || [];
}

async function quarantineFile(env: Env, file: any, reason: string) {
  const supa = sb(env);
  
  // Record in file_history
  await supa.from("file_history").insert({
    file_path: file.file_path,
    qid: file.qid,
    event_type: "quarantined",
    actor: "heal",
    meta: { reason },
    created_at: new Date().toISOString(),
  });

  // Create action recommendation
  const action: HealAction = {
    type: "quarantine",
    src: file.file_path,
    reason: reason,
    confidence: 0.85,
    metadata: {
      qid: file.qid,
      reason: reason,
    },
  };

  await supa.from("self_heal_actions").insert({
    worker_id: env.WORKER_ID || "self_heal",
    type: action.type,
    src: action.src,
    dest: action.dest || null,
    reason: action.reason,
    confidence: action.confidence,
    metadata: action.metadata || {},
  });
}

async function processHealing(env: Env) {
  // 1) Find duplicates
  const duplicates = await findDuplicates(env, 5);
  for (const dup of duplicates) {
    await recordDedupe(env, dup);
  }

  // 2) Find invalid files
  const invalidFiles = await findInvalidFiles(env, 10);
  for (const file of invalidFiles) {
    await quarantineFile(env, file, "missing_required_metadata");
  }

  return {
    duplicates_processed: duplicates.length,
    invalid_quarantined: invalidFiles.length,
  };
}

export default {
  async fetch(req: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const workerId = env.WORKER_ID || "self_heal";
    const url = new URL(req.url);
    const path = url.pathname;

    try {
      const supa = sb(env);

      if (path === "/health" && req.method === "GET") {
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

      if (path === "/status" && req.method === "GET") {
        const { data: actions, error } = await supa
          .from("self_heal_actions")
          .select("type, executed_at");

        if (error) throw error;

        // Aggregate counts
        const total = actions?.length || 0;
        const byType: Record<string, number> = {};
        const executed = actions?.filter((a) => a.executed_at !== null).length || 0;
        const pending = total - executed;

        for (const action of actions || []) {
          byType[action.type] = (byType[action.type] || 0) + 1;
        }

        return new Response(
          JSON.stringify({
            total,
            pending,
            executed,
            by_type: byType,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (path === "/actions" && req.method === "GET") {
        const type = url.searchParams.get("type");
        const executedParam = url.searchParams.get("executed");
        const limit = parseInt(url.searchParams.get("limit") || "50");
        const offset = parseInt(url.searchParams.get("offset") || "0");

        let query = supa
          .from("self_heal_actions")
          .select("*")
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (type) {
          query = query.eq("type", type);
        }

        if (executedParam === "false") {
          query = query.is("executed_at", null);
        }

        const { data, error } = await query;

        if (error) throw error;

        return new Response(
          JSON.stringify({
            actions: data || [],
            total: data?.length || 0,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (path === "/execute" && req.method === "POST") {
        const body = await req.json();
        const { ids } = body;

        if (!Array.isArray(ids) || ids.length === 0) {
          return new Response(
            JSON.stringify({ ok: false, error: "ids array required" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        const now = new Date().toISOString();
        const { data, error } = await supa
          .from("self_heal_actions")
          .update({ executed_at: now })
          .in("id", ids)
          .select();

        if (error) throw error;

        // Record execution in file_history for each action
        for (const action of data || []) {
          if (action.src) {
            await supa.from("file_history").insert({
              file_path: action.src,
              event_type: "heal_action_executed",
              actor: "heal",
              meta: {
                action_id: action.id,
                action_type: action.type,
                executed_at: now,
              },
              created_at: now,
            });
          }
        }

        return new Response(
          JSON.stringify({
            ok: true,
            executed: data?.length || 0,
            actions: data || [],
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
    const workerId = env.WORKER_ID || "self_heal";

    try {
      await heartbeat(env, workerId, "green", { phase: "scheduled_start" });

      const result = await processHealing(env);

      await heartbeat(env, workerId, "green", {
        phase: "batch_complete",
        ...result,
      });
    } catch (e: any) {
      await fail(env, workerId, "HEL.HEAL_FAIL", e.message || String(e));
      throw e;
    }
  },
};

