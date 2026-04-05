/**
 * Embedder Worker v0.1 (Cloudflare)
 * Layer: 6 semantic embeddings
 *
 * Responsibilities:
 * - Read semantic_profile rows with embedding_status = 'pending'
 * - Chunk content
 * - Generate embeddings (OpenAI or other)
 * - Write to vector_index (chunk-level records)
 * - Set embedding_status = 'complete'
 * - Record event to file_history (event_type: 'embedded', actor: 'embedder')
 * - Publish heartbeat + errors to worker_status
 */

import { createClient } from "@supabase/supabase-js";
import { heartbeat, fail } from "../_shared/heartbeat.ts";
import { isIgnored } from "../_shared/ignore.ts";

type Env = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  WORKER_ID: string; // "embedder"
  OPENAI_API_KEY?: string; // Optional - for OpenAI embeddings
};

function sb(env: Env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
}

async function pullPendingEmbeddings(env: Env, limit = 10) {
  const supa = sb(env);
  const { data, error } = await supa
    .from("semantic_profile")
    .select("*")
    .eq("embedding_status", "pending")
    .not("extracted_text", "is", null)
    .order("updated_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

async function chunkText(text: string, maxChunkSize = 1000): Promise<string[]> {
  // Simple chunking by sentences (placeholder)
  // Real implementation should use proper text chunking library
  const sentences = text.split(/[.!?]+\s+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? " " : "") + sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter((c) => c.length > 0);
}

async function generateEmbedding(
  env: Env,
  text: string
): Promise<number[] | null> {
  // Placeholder: Return null for now
  // Real implementation would call OpenAI API or other embedding service
  if (!env.OPENAI_API_KEY) {
    // Return a stub embedding vector (1536 dimensions for OpenAI ada-002)
    return new Array(1536).fill(0).map(() => Math.random() - 0.5);
  }

  // TODO: Call OpenAI API
  // const response = await fetch("https://api.openai.com/v1/embeddings", {
  //   method: "POST",
  //   headers: {
  //     "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     model: "text-embedding-ada-002",
  //     input: text,
  //   }),
  // });
  // const data = await response.json();
  // return data.data[0].embedding;

  return new Array(1536).fill(0).map(() => Math.random() - 0.5);
}

async function writeChunkEmbeddings(
  env: Env,
  profile: any,
  chunks: string[],
  embeddings: number[][]
) {
  const supa = sb(env);

  // Write each chunk with its embedding to semantic_profile
  // Note: semantic_profile supports both file-level (chunk_id null) and chunk-level (chunk_id set)
  for (let i = 0; i < chunks.length; i++) {
    const chunkId = `${profile.file_path}:chunk:${i}`;
    await supa.from("semantic_profile").upsert(
      {
        chunk_id: chunkId,
        chunk_text: chunks[i],
        embedding: `[${embeddings[i].join(",")}]`, // pgvector format
        qid: profile.qid,
        file_path: profile.file_path,
        realm_guess: profile.realm,
        realm_slug_guess: profile.realm_slug,
        route_confidence: profile.route_confidence || 0,
        created_at: new Date().toISOString(),
      },
      { onConflict: "chunk_id" }
    );
  }
}

async function updateProfileEmbeddingStatus(env: Env, profile: any, chunkCount: number) {
  const supa = sb(env);
  const { error } = await supa
    .from("semantic_profile")
    .update({
      embedding_status: "complete",
      chunk_count: chunkCount,
      updated_at: new Date().toISOString(),
    })
    .eq("file_path", profile.file_path);

  if (error) throw error;
}

async function recordFileHistory(env: Env, profile: any, chunkCount: number) {
  const supa = sb(env);
  await supa.from("file_history").insert({
    file_path: profile.file_path,
    qid: profile.qid,
    event_type: "embedded",
    actor: "embedder",
    meta: {
      chunk_count: chunkCount,
    },
    created_at: new Date().toISOString(),
  });
}

async function processProfile(env: Env, profile: any) {
  // 0) Check if file should be ignored (Dark Matter protection)
  if (isIgnored(profile.file_path)) {
    return; // Skip embedding for ignored files
  }

  // 1) Chunk the text
  const text = profile.extracted_text || "";
  if (!text || text.length === 0) {
    // No text to embed, mark as complete anyway
    await updateProfileEmbeddingStatus(env, profile, 0);
    return;
  }

  const chunks = await chunkText(text);
  if (chunks.length === 0) {
    await updateProfileEmbeddingStatus(env, profile, 0);
    return;
  }

  // 2) Generate embeddings for each chunk
  const embeddings: number[][] = [];
  for (const chunk of chunks) {
    const embedding = await generateEmbedding(env, chunk);
    if (embedding) {
      embeddings.push(embedding);
    }
  }

  // 3) Write chunk embeddings to semantic_profile
  await writeChunkEmbeddings(env, profile, chunks, embeddings);

  // 4) Update semantic_profile
  await updateProfileEmbeddingStatus(env, profile, chunks.length);

  // 5) Record file_history
  await recordFileHistory(env, profile, chunks.length);
}

export default {
  async fetch(req: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const workerId = env.WORKER_ID || "embedder";
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
    const workerId = env.WORKER_ID || "embedder";

    try {
      await heartbeat(env, workerId, "green", { phase: "scheduled_start" });

      const profiles = await pullPendingEmbeddings(env, 10);

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
          await fail(env, workerId, "SEM.EMBEDDING_FAIL", e.message || String(e), {
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

