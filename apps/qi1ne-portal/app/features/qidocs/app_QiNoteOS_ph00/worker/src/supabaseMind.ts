// @ts-nocheck
/**
 * Gina-side Supabase helper for Cloudflare Worker / QiCockpit
 * 
 * Provides clean interface for Gina to talk to the Unified Brain
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface Database {
  public: {
    Tables: {
      qi_nodes: {
        Row: {
          id: string;
          qid: string;
          realm: string;
          orbit: string;
          system: string;
          title: string;
          status: string | null;
          tags: string[] | null;
          app_id: string | null;
          app_tags: string[] | null;
          origin_qid: string | null;
          influence_qid: string | null;
          companion_qid: string | null;
          occurred_at: string | null;
          created_at: string;
          updated_at: string;
          workspace_id: string | null;
          meta: any;
        };
        Insert: Partial<Database["public"]["Tables"]["qi_nodes"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["qi_nodes"]["Row"]>;
      };
      qi_chunks: {
        Row: {
          id: string;
          qid: string;
          chunk_index: number;
          content: string;
          realm: string;
          orbit: string;
          system: string;
          workspace_id: string | null;
          embedding: number[] | null;
          created_at: string;
          updated_at: string;
          meta: any;
        };
        Insert: Partial<Database["public"]["Tables"]["qi_chunks"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["qi_chunks"]["Row"]>;
      };
      qi_events: {
        Row: {
          id: number;
          created_at: string;
          event_type: string;
          qid: string | null;
          app_id: string | null;
          payload: any;
        };
        Insert: {
          created_at?: string;
          event_type: string;
          qid?: string | null;
          app_id?: string | null;
          payload?: any;
        };
        Update: {
          created_at?: string;
          event_type?: string;
          qid?: string | null;
          app_id?: string | null;
          payload?: any;
        };
      };
    };
  };
}

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  // Optional: Zoho MCP integration
  ZOHO_MCP_URL?: string;
  ZOHO_MCP_KEY?: string;
}

export function getSupabase(env: Env): SupabaseClient<Database> {
  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    global: { fetch: fetch as any },
    auth: { persistSession: false }
  });
}

// ---- Core helpers ----

export async function logQiEvent(
  supabase: SupabaseClient<Database>,
  event_type: string,
  qid: string | null,
  app_id: string,
  payload: any = {}
) {
  const { error } = await supabase.from("qi_events").insert({
    event_type,
    qid,
    app_id,
    payload
  });

  if (error) {
    console.error("logQiEvent error", error);
  }
}

export interface UpsertQiNodeInput {
  qid: string;
  realm: string;
  orbit: string;
  system: string;
  title: string;
  status?: string;
  tags?: string[];
  app_id: string;
  meta?: any;
  workspace_id?: string | null;
}

export async function upsertQiNode(
  supabase: SupabaseClient<Database>,
  input: UpsertQiNodeInput
) {
  const { qid, ...rest } = input;

  const { data, error } = await supabase
    .from("qi_nodes")
    .upsert(
      {
        qid,
        ...rest,
        updated_at: new Date().toISOString()
      },
      { onConflict: "qid" }
    )
    .select("*")
    .single();

  if (error) {
    console.error("upsertQiNode error", error);
    throw error;
  }

  await logQiEvent(supabase, "NODE_UPSERTED", qid, input.app_id, {
    realm: input.realm,
    orbit: input.orbit,
    system: input.system
  });

  return data;
}

export interface UpsertChunkInput {
  qid: string;
  chunk_index: number;
  content: string;
  realm: string;
  orbit: string;
  system: string;
  workspace_id?: string | null;
  embedding: number[];
  meta?: any;
  app_id: string;
}

export async function upsertQiChunk(
  supabase: SupabaseClient<Database>,
  input: UpsertChunkInput
) {
  const { qid, chunk_index, app_id, ...rest } = input;

  const { error } = await supabase
    .from("qi_chunks")
    .upsert(
      {
        qid,
        chunk_index,
        ...rest,
        updated_at: new Date().toISOString()
      },
      { onConflict: "qid,chunk_index" }
    );

  if (error) {
    console.error("upsertQiChunk error", error);
    throw error;
  }

  await logQiEvent(supabase, "CHUNK_UPSERTED", qid, app_id, {
    chunk_index
  });
}

// ============================================================================
// QID Generation
// ============================================================================

/**
 * Get the next QID from Supabase
 * 
 * QID format: q[HEX] where HEX is 8-digit uppercase hexadecimal
 * Example: q00000001, q0000000A, q000000FF, q0000A3F2
 * 
 * This uses a global monotonic sequence - one QID sequence for the entire Qi universe.
 * QIDs are immutable once assigned and never reused.
 * 
 * @param supabase - Supabase client instance
 * @returns Promise<string> - Next QID in format 'q00000000'
 * @throws Error if QID generation fails
 */
export async function getNextQid(
  supabase: SupabaseClient<Database>
): Promise<string> {
  const { data, error } = await supabase.rpc("next_qid");

  if (error) {
    console.error("Failed to get next QID:", error);
    throw new Error("QID generation failed");
  }

  return data as string; // e.g. "q00000001", "q000000FF"
}

