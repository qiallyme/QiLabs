/**
 * Semantic Ingestion Worker v0.1 (Cloudflare)
 * Layer: 6 semantic ingestion
 *
 * Responsibilities:
 * - Pull "ingestion_queue" rows that are pending
 * - Fetch file content (for now: metadata-only stub, real FS adapter later)
 * - Extract text (placeholder)
 * - Create or update semantic_profile stub
 * - Mark queue item complete or quarantined
 * - Publish heartbeat + errors to worker_status
 *
 * NOTE:
 * This v0.1 assumes ingestion_queue already gets items inserted
 * by your local scanner or future FS adapter.
 */

import { createClient } from "@supabase/supabase-js";
import { heartbeat, fail } from "../_shared/heartbeat.ts";
import { isIgnored } from "../_shared/ignore.ts";

// Cloudflare Workers types
type ScheduledEvent = {
  scheduledTime: number;
  cron: string;
};

type ExecutionContext = {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
};

type Env = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  WORKER_ID: string; // "ingestion"
};

function sb(env: Env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
}

async function pullQueue(env: Env, limit = 10) {
  const supa = sb(env);
  const { data, error } = await supa
    .from("ingestion_queue")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

async function markQueue(env: Env, id: string, status: string, meta: any = {}) {
  const supa = sb(env);
  const { error } = await supa
    .from("ingestion_queue")
    .update({
      status,
      meta,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

/**
 * Placeholder extraction.
 * Real version uses FS adapter + OCR + chunker.
 */
async function extractTextStub(queueItem: any) {
  // queueItem should include file_path, mime_type, realm_guess, etc.
  // For now, just return a minimal stub.
  return {
    extracted_text: queueItem.extracted_text || null,
    content_hash: queueItem.content_hash || null,
    mime_type: queueItem.mime_type || null,
    file_ext: queueItem.file_ext || null,
  };
}

async function upsertSemanticProfile(env: Env, queueItem: any, extracted: any) {
  const supa = sb(env);

  const profile = {
    qid: queueItem.qid || null,
    slug: queueItem.slug,
    realm: queueItem.realm_guess || queueItem.realm || "QiVault",
    realm_slug: queueItem.realm_slug || null,
    file_path: queueItem.file_path,
    mime_type: extracted.mime_type,
    file_ext: extracted.file_ext,
    content_hash: extracted.content_hash,
    extracted_text: extracted.extracted_text,
    chunk_count: 0,
    embedding_status: "pending", // embedder will pick this up
    route_confidence: queueItem.route_confidence || 0,
    meta: queueItem.meta || {},
    updated_at: new Date().toISOString(),
  };

  const { error } = await supa
    .from("semantic_profile")
    .upsert(profile, { onConflict: "file_path" });

  if (error) throw error;
}

async function markIgnored(env: Env, item: any, reason: string) {
  const supa = sb(env);
  
  // Mark as quarantined with ignore reason
  await markQueue(env, item.id, "quarantined", {
    reason: "ignored_pattern",
    pattern_match: reason,
  });

  // Record to file_history
  await supa.from("file_history").insert({
    file_path: item.file_path,
    qid: item.qid,
    event_type: "quarantined",
    actor: "ingestion",
    meta: {
      reason: "ignored_pattern",
      pattern_match: reason,
      note: "File matches ignore pattern - read-only, no semantic processing",
    },
    created_at: new Date().toISOString(),
  });
}

async function processItem(env: Env, item: any) {
  // 0) Check if file should be ignored (Dark Matter protection)
  if (isIgnored(item.file_path)) {
    await markIgnored(env, item, item.file_path);
    return; // Stop processing - file is protected
  }

  // 1) mark in_progress
  await markQueue(env, item.id, "in_progress");

  // 2) extract text (stub)
  const extracted = await extractTextStub(item);

  // 3) semantic profile stub
  await upsertSemanticProfile(env, item, extracted);

  // 4) mark complete
  await markQueue(env, item.id, "complete");
}

export default {
  async fetch(req: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const workerId = env.WORKER_ID || "ingestion";
    const url = new URL(req.url);
    const path = url.pathname;

    try {
      // Health check endpoint
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

      // Manual trigger endpoint (for testing)
      if (path === "/process" && req.method === "POST") {
        const queue = await pullQueue(env, 20);

        if (queue.length === 0) {
          return new Response(
            JSON.stringify({ ok: true, message: "No items in queue", processed: 0 }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        let processed = 0;
        for (const item of queue) {
          try {
            await processItem(env, item);
            processed++;
            await heartbeat(env, workerId, "green", {
              last_processed: item.file_path,
            });
          } catch (e: any) {
            await markQueue(env, item.id, "quarantined", {
              error: e.message || String(e),
            });
            await fail(env, workerId, "SEM.INGEST_FAIL", e.message || String(e), {
              file_path: item.file_path,
            });
          }
        }

        await heartbeat(env, workerId, "green", {
          phase: "batch_complete",
          processed,
        });

        return new Response(
          JSON.stringify({ ok: true, processed, total: queue.length }),
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
    const workerId = env.WORKER_ID || "ingestion";

    try {
      await heartbeat(env, workerId, "green", { phase: "scheduled_start" });

      const queue = await pullQueue(env, 20);

      if (queue.length === 0) {
        await heartbeat(env, workerId, "green", { phase: "idle" });
        return;
      }

      for (const item of queue) {
        try {
          await processItem(env, item);
          await heartbeat(env, workerId, "green", {
            last_processed: item.file_path,
          });
        } catch (e: any) {
          await markQueue(env, item.id, "quarantined", {
            error: e.message || String(e),
          });
          await fail(env, workerId, "SEM.INGEST_FAIL", e.message || String(e), {
            file_path: item.file_path,
          });
        }
      }

      await heartbeat(env, workerId, "green", {
        phase: "batch_complete",
        processed: queue.length,
      });
    } catch (e: any) {
      await fail(env, workerId, "WKR.QUEUE_STALL", e.message || String(e));
      throw e;
    }
  },
};

