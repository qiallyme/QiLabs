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

async function pullPendingEmbeddings(env: Env, limit = 5) {
  const supa = sb(env);
  
  const { data, error } = await supa
    .from("semantic_profile")
    .select("*")
    .eq("embedding_status", "pending")
    .not("extracted_text", "is", null)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error(`[EMBEDDER] Supabase query error:`, error);
    throw error;
  }
  
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
  if (!env.OPENAI_API_KEY) {
    console.warn(`[EMBEDDER] OPENAI_API_KEY not set, using stub embedding`);
    // Return a stub embedding vector (1536 dimensions for OpenAI ada-002)
    return new Array(1536).fill(0).map(() => Math.random() - 0.5);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-ada-002",
        input: text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[EMBEDDER] OpenAI API error (${response.status}): ${errorText}`);
      return null;
    }

    const data = await response.json();
    if (!data.data || !data.data[0] || !data.data[0].embedding) {
      console.error(`[EMBEDDER] Invalid OpenAI response format:`, data);
      return null;
    }

    return data.data[0].embedding;
  } catch (e: any) {
    console.error(`[EMBEDDER] OpenAI API call failed:`, e.message || String(e));
    return null;
  }
}

// Removed writeChunkEmbeddings - we now embed file-level text directly
// Chunking can be added back later if needed, but for now we embed the full extracted_text

async function updateProfileEmbeddingStatus(
  env: Env,
  profile: any,
  embedding: number[] | null,
  status: "complete" | "error",
  errorMessage?: string
) {
  const supa = sb(env);
  
  const updateData: any = {
    embedding_status: status,
    updated_at: new Date().toISOString(),
  };
  
  if (embedding) {
    updateData.embedding = `[${embedding.join(",")}]`;
  }
  
  if (status === "error" && errorMessage) {
    updateData.meta = {
      ...(profile.meta || {}),
      embedding_error: errorMessage,
      embedding_error_at: new Date().toISOString(),
    };
  }
  
  const { error } = await supa
    .from("semantic_profile")
    .update(updateData)
    .eq("id", profile.id);

  if (error) {
    console.error(`[EMBEDDER] Failed to update status for ${profile.file_path}:`, error);
    throw error;
  }
}

async function recordFileHistory(env: Env, profile: any) {
  const supa = sb(env);
  await supa.from("file_history").insert({
    file_path: profile.file_path,
    qid: profile.qid,
    event_type: "embedded",
    actor: "embedder",
    meta: {},
    created_at: new Date().toISOString(),
  });
}

async function processProfile(env: Env, profile: any) {
  const filePath = profile.file_path || "unknown";
  const chunkId = profile.chunk_id || "file-level";

  // 0) Check if file should be ignored (Dark Matter protection)
  if (isIgnored(filePath)) {
    // Skip silently - don't update status
    return;
  }

  // 1) Get text to embed - query already filters for extracted_text IS NOT NULL
  const text = profile.extracted_text || "";
  if (!text || text.length === 0) {
    // Skip silently - don't update status (shouldn't happen due to query filter, but safety check)
    console.warn(`[EMBEDDER] Skipping ${filePath} - extracted_text is empty (unexpected)`);
    return;
  }

  try {
    console.log(`[EMBEDDER] Embedding`, filePath, chunkId);

    // Generate embedding for the file-level text
    const embedding = await generateEmbedding(env, text);
    
    if (!embedding) {
      throw new Error("Failed to generate embedding");
    }

    // Single update: set embedding and status to complete
    await updateProfileEmbeddingStatus(env, profile, embedding, "complete");

    // Record file_history (non-blocking)
    try {
      await recordFileHistory(env, profile);
    } catch (e: any) {
      // Ignore file_history errors
    }
  } catch (e: any) {
    const errorMsg = e.message || String(e);
    console.error(`[EMBEDDER] Error embedding`, filePath, errorMsg);
    
    // Single update: set status to error with message
    await updateProfileEmbeddingStatus(env, profile, null, "error", errorMsg);
    throw e;
  }
}

export default {
  async fetch(req: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const workerId = env.WORKER_ID || "embedder";
    const url = new URL(req.url);
    const path = url.pathname;
    const requestId = `embedder-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    console.log(`[${requestId}] Embedder worker fetch handler: ${req.method} ${path}`);

    try {
      if (path === "/health" && req.method === "GET") {
        console.log(`[${requestId}] Health check requested`);
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

      if (path === "/process" && req.method === "POST") {
        console.log("[EMBEDDER] Manual process trigger");
        
        const profiles = await pullPendingEmbeddings(env, 5);
        console.log(`[EMBEDDER] Found ${profiles.length} profiles`);

        if (profiles.length === 0) {
          return new Response(
            JSON.stringify({ ok: true, message: "No pending profiles", processed: 0 }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }

        let processedCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        for (const profile of profiles) {
          try {
            await processProfile(env, profile);
            processedCount++;
          } catch (e: any) {
            errorCount++;
            errors.push(`${profile.file_path}: ${e.message || String(e)}`);
          }
        }

        return new Response(
          JSON.stringify({
            ok: true,
            processed: processedCount,
            errors: errorCount,
            total: profiles.length,
            error_details: errors,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      console.log(`[${requestId}] 404 - Path not found: ${path}`);
      return new Response("Not found", { status: 404 });
    } catch (e: any) {
      const errorMsg = e.message || String(e);
      console.error(`[${requestId}] Fetch handler error:`, errorMsg);
      await fail(env, workerId, "WKR.FETCH_ERROR", errorMsg, { request_id: requestId });
      return new Response(
        JSON.stringify({ ok: false, error: errorMsg }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },

  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    const workerId = env.WORKER_ID || "embedder";

    try {
      await heartbeat(env, workerId, "green", { phase: "scheduled_start" });

      console.log("[EMBEDDER] Starting batch");
      const profiles = await pullPendingEmbeddings(env, 5);
      console.log(`[EMBEDDER] Found ${profiles.length} profiles`);

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
          // Error already logged and status updated in processProfile
          await fail(env, workerId, "SEM.EMBEDDING_FAIL", e.message || String(e), {
            file_path: profile.file_path,
          });
          // Continue with next profile
        }
      }

      await heartbeat(env, workerId, "green", {
        phase: "batch_complete",
        processed: profiles.length,
      });
    } catch (e: any) {
      await fail(env, workerId, "WKR.QUEUE_STALL", e.message || String(e));
      // Don't throw - let the worker complete gracefully
    }
  },
};


