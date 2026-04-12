// @ts-nocheck
/**
 * Real RAG pipeline for Gina
 * 
 * Handles chunking, embedding, and semantic search
 * 
 * This is Gina's primary interface to the Unified Brain.
 * All queries automatically include both user-authored and Gina-authored nodes.
 */

import OpenAI from "openai";
import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabaseMind";
import { upsertQiChunk } from "./supabaseMind";

const EMBEDDING_MODEL = "text-embedding-3-small";

export interface RagEnv {
  OPENAI_API_KEY: string;
}

export function getOpenAI(env: RagEnv) {
  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
}

// --- 1) Chunking ---

export function simpleChunkText(
  text: string,
  maxTokensApprox = 400
): string[] {
  // Very naive chunking by paragraphs / size.
  // Later you can replace with a token-aware chunker.
  const paragraphs = text.split(/\n{2,}/g).map((p) => p.trim()).filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  for (const p of paragraphs) {
    if ((current + "\n\n" + p).length > maxTokensApprox * 4 && current) {
      chunks.push(current.trim());
      current = p;
    } else {
      current = current ? current + "\n\n" + p : p;
    }
  }
  if (current) chunks.push(current.trim());

  return chunks.length === 0 ? [text] : chunks;
}

// --- 2) Embed chunks ---

export async function embedChunks(
  openai: OpenAI,
  chunks: string[]
): Promise<number[][]> {
  const { data } = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: chunks
  });

  return data.map((d) => d.embedding as number[]);
}

// --- 3) Upsert QiChunks for a QiNode ---

export async function upsertChunksForNode(params: {
  supabase: SupabaseClient<Database>;
  openai: OpenAI;
  qid: string;
  realm: string;
  orbit: string;
  system: string;
  content: string;
  workspace_id?: string | null;
  app_id: string;
}) {
  const { supabase, openai, qid, realm, orbit, system, content, workspace_id, app_id } =
    params;

  const chunks = simpleChunkText(content);
  const embeddings = await embedChunks(openai, chunks);

  // Delete existing chunks first (clean slate)
  await supabase
    .from("qi_chunks")
    .delete()
    .eq("qid", qid);

  // Upsert each chunk
  for (let i = 0; i < chunks.length; i++) {
    const chunkText = chunks[i];
    const embedding = embeddings[i];
    await upsertQiChunk(supabase, {
      qid,
      chunk_index: i,
      content: chunkText,
      realm,
      orbit,
      system,
      workspace_id: workspace_id ?? null,
      embedding,
      meta: {
        model_version: EMBEDDING_MODEL,
        dimension: embedding.length,
      },
      app_id
    });
  }
}

// --- 4) Semantic search (via RPC function) ---

export interface MatchResult {
  qid: string;
  content: string;
  score: number;
  realm: string;
  orbit: string;
  system: string;
}

export async function semanticSearch(
  supabase: SupabaseClient<Database>,
  openai: OpenAI,
  query: string,
  options: {
    realm?: string;
    orbit?: string;
    system?: string;
    limit?: number;
  } = {}
): Promise<MatchResult[]> {
  const { realm, orbit, system, limit = 10 } = options;

  const embeddingResp = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: query
  });

  const queryEmbedding = embeddingResp.data[0].embedding as number[];

  // Use the match_chunks RPC function
  const { data, error } = await supabase.rpc("match_chunks", {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: limit,
    filter_realm: realm ?? null,
    filter_orbit: null, // Can be enhanced to support orbit filtering
    filter_system: system ?? null,
    filter_workspace: null, // Will be filtered in application layer
  });

  if (error) {
    console.error("semanticSearch error", error);
    return [];
  }

  return (data ?? []) as MatchResult[];
}

