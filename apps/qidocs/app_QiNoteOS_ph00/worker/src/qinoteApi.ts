// @ts-nocheck
/**
 * QiNote API Endpoints
 * 
 * Provides REST API for QiNote front-end to read/write notes
 * All endpoints use workspace_id for multi-tenant support
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabaseMind";
import { upsertQiNode } from "./supabaseMind";
import { logQiEvent } from "./supabaseMind";

// ============================================================================
// Types
// ============================================================================

export interface CreateNoteInput {
  title: string;
  body?: string;
  realm: string;
  orbit?: string;
  system?: string;
  tags?: string[];
  meta?: Record<string, unknown>;
  qid?: string; // Optional - will generate if not provided
}

export interface UpdateNoteInput {
  title?: string;
  body?: string;
  tags?: string[];
  meta?: Record<string, unknown>;
}

export interface NoteResponse {
  id: string;
  qid: string;
  title: string;
  body: string | null;
  realm: string;
  orbit: string;
  system: string;
  tags: string[];
  meta: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ============================================================================
// Helper: Get next sequence for QiD generation
// ============================================================================

async function getNextSequence(
  supabase: SupabaseClient<Database>,
  realm: string,
  orbit: string,
  system: string,
  workspace_id: string | null
): Promise<number> {
  const { data, error } = await supabase
    .from("qi_nodes")
    .select("qid")
    .eq("realm", realm)
    .eq("orbit", orbit)
    .eq("system", system)
    .is("deleted_at", null);

  if (error) {
    console.error("Error getting next sequence:", error);
    return 0;
  }

  // Parse existing qids to find max sequence
  let maxSeq = 0;
  for (const node of data || []) {
    const parts = node.qid.split(".");
    if (parts.length === 4) {
      const seq = parseInt(parts[3], 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }

  return maxSeq;
}

// ============================================================================
// Helper: Generate QiD
// ============================================================================

async function generateQiD(
  supabase: SupabaseClient<Database>,
  realm: string,
  orbit: string,
  system: string,
  workspace_id: string | null
): Promise<string> {
  // Realm codes
  const realmCodes: Record<string, number> = {
    QiOne: 1,
    QiClients: 2,
    QiProjects: 3,
    QiArchive: 4,
    QiSystem: 5,
    QiExternal: 6,
  };

  const realmCode = realmCodes[realm] || 1;
  const orbitCode = orbit || "01";
  const systemCode = system || "03"; // Default to "Docs"

  const lastSeq = await getNextSequence(supabase, realm, orbitCode, systemCode, workspace_id);
  const seq = String(lastSeq + 1).padStart(3, "0");

  return `${realmCode}.${orbitCode.padStart(2, "0")}.${systemCode.padStart(2, "0")}.${seq}`;
}

// ============================================================================
// API: Get Realms
// ============================================================================

export async function getRealms(): Promise<Array<{ id: string; label: string }>> {
  return [
    { id: "QiOne", label: "QiOne" },
    { id: "QiClients", label: "QiClients" },
    { id: "QiProjects", label: "QiProjects" },
    { id: "QiArchive", label: "QiArchive" },
    { id: "QiSystem", label: "QiSystem" },
    { id: "QiExternal", label: "QiExternal" },
  ];
}

// ============================================================================
// API: List Notes
// ============================================================================

export async function listNotes(
  supabase: SupabaseClient<Database>,
  options: {
    realm?: string;
    workspace_id?: string | null;
    limit?: number;
    offset?: number;
  }
): Promise<NoteResponse[]> {
  const { realm, workspace_id, limit = 50, offset = 0 } = options;

  let query = supabase
    .from("qi_nodes")
    .select("*")
    .is("deleted_at", null) // Exclude soft-deleted
    .order("created_at", { ascending: false });

  if (realm) {
    query = query.eq("realm", realm);
  }

  if (workspace_id) {
    query = query.eq("workspace_id", workspace_id);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    console.error("Error listing notes:", error);
    throw new Error(`Failed to list notes: ${error.message}`);
  }

  return (data || []).map((node) => ({
    id: node.id,
    qid: node.qid,
    title: node.title,
    body: node.body || null,
    realm: node.realm,
    orbit: node.orbit,
    system: node.system,
    tags: node.tags || [],
    meta: (node.meta as Record<string, unknown>) || {},
    created_at: node.created_at,
    updated_at: node.updated_at,
    deleted_at: null, // Already filtered
  }));
}

// ============================================================================
// API: Get Note by ID
// ============================================================================

export async function getNote(
  supabase: SupabaseClient<Database>,
  id: string,
  workspace_id?: string | null
): Promise<NoteResponse | null> {
  let query = supabase
    .from("qi_nodes")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (workspace_id) {
    query = query.eq("workspace_id", workspace_id);
  }

  const { data, error } = await query;

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    console.error("Error getting note:", error);
    throw new Error(`Failed to get note: ${error.message}`);
  }

  if (!data) return null;

  return {
    id: data.id,
    qid: data.qid,
    title: data.title,
    body: data.body || null,
    realm: data.realm,
    orbit: data.orbit,
    system: data.system,
    tags: data.tags || [],
    meta: (data.meta as Record<string, unknown>) || {},
    created_at: data.created_at,
    updated_at: data.updated_at,
    deleted_at: null,
  };
}

// ============================================================================
// API: Get Note by QiD
// ============================================================================

export async function getNoteByQiD(
  supabase: SupabaseClient<Database>,
  qid: string,
  workspace_id?: string | null
): Promise<NoteResponse | null> {
  let query = supabase
    .from("qi_nodes")
    .select("*")
    .eq("qid", qid)
    .is("deleted_at", null)
    .single();

  if (workspace_id) {
    query = query.eq("workspace_id", workspace_id);
  }

  const { data, error } = await query;

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    console.error("Error getting note by qid:", error);
    throw new Error(`Failed to get note: ${error.message}`);
  }

  if (!data) return null;

  return {
    id: data.id,
    qid: data.qid,
    title: data.title,
    body: data.body || null,
    realm: data.realm,
    orbit: data.orbit,
    system: data.system,
    tags: data.tags || [],
    meta: (data.meta as Record<string, unknown>) || {},
    created_at: data.created_at,
    updated_at: data.updated_at,
    deleted_at: null,
  };
}

// ============================================================================
// API: Create Note
// ============================================================================

export async function createNote(
  supabase: SupabaseClient<Database>,
  input: CreateNoteInput,
  workspace_id?: string | null,
  app_id: string = "QiNote"
): Promise<NoteResponse> {
  const {
    title,
    body,
    realm,
    orbit = "01",
    system = "Docs",
    tags = [],
    meta = {},
    qid: providedQid,
  } = input;

  if (!title || title.trim().length === 0) {
    throw new Error("Title is required");
  }

  if (!realm) {
    throw new Error("Realm is required");
  }

  // Generate QiD if not provided
  const qid = providedQid || (await generateQiD(supabase, realm, orbit, system, workspace_id));

  // Check if qid already exists
  const existing = await getNoteByQiD(supabase, qid, workspace_id);
  if (existing) {
    throw new Error(`Note with QiD ${qid} already exists`);
  }

  // Create node
  const node = await upsertQiNode(supabase, {
    qid,
    realm,
    orbit,
    system,
    title: title.trim(),
    body: body || null,
    tags,
    meta,
    app_id,
    workspace_id: workspace_id || null,
  });

  // Log event
  await logQiEvent(supabase, "NODE_CREATED", qid, app_id, {
    realm,
    orbit,
    system,
    title,
  });

  return {
    id: node.id,
    qid: node.qid,
    title: node.title,
    body: node.body || null,
    realm: node.realm,
    orbit: node.orbit,
    system: node.system,
    tags: node.tags || [],
    meta: (node.meta as Record<string, unknown>) || {},
    created_at: node.created_at,
    updated_at: node.updated_at,
    deleted_at: null,
  };
}

// ============================================================================
// API: Update Note
// ============================================================================

export async function updateNote(
  supabase: SupabaseClient<Database>,
  id: string,
  input: UpdateNoteInput,
  workspace_id?: string | null,
  app_id: string = "QiNote"
): Promise<NoteResponse> {
  const { title, body, tags, meta } = input;

  // Get existing note
  const existing = await getNote(supabase, id, workspace_id);
  if (!existing) {
    throw new Error(`Note with id ${id} not found`);
  }

  // Build update object
  const updates: Partial<Database["public"]["Tables"]["qi_nodes"]["Update"]> = {
    updated_at: new Date().toISOString(),
  };

  if (title !== undefined) {
    updates.title = title.trim();
  }

  if (body !== undefined) {
    updates.body = body || null;
  }

  if (tags !== undefined) {
    updates.tags = tags;
  }

  if (meta !== undefined) {
    // Merge with existing meta
    const existingMeta = (existing.meta as Record<string, unknown>) || {};
    updates.meta = { ...existingMeta, ...meta };
  }

  // Update node
  let query = supabase
    .from("qi_nodes")
    .update(updates)
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();

  if (workspace_id) {
    query = query.eq("workspace_id", workspace_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error updating note:", error);
    throw new Error(`Failed to update note: ${error.message}`);
  }

  if (!data) {
    throw new Error(`Note with id ${id} not found`);
  }

  // Log event
  await logQiEvent(supabase, "NODE_UPDATED", data.qid, app_id, {
    updates: Object.keys(updates),
  });

  return {
    id: data.id,
    qid: data.qid,
    title: data.title,
    body: data.body || null,
    realm: data.realm,
    orbit: data.orbit,
    system: data.system,
    tags: data.tags || [],
    meta: (data.meta as Record<string, unknown>) || {},
    created_at: data.created_at,
    updated_at: data.updated_at,
    deleted_at: null,
  };
}

// ============================================================================
// API: Delete Note (Soft Delete)
// ============================================================================

export async function deleteNote(
  supabase: SupabaseClient<Database>,
  id: string,
  workspace_id?: string | null,
  app_id: string = "QiNote"
): Promise<void> {
  // Get existing note
  const existing = await getNote(supabase, id, workspace_id);
  if (!existing) {
    throw new Error(`Note with id ${id} not found`);
  }

  // Soft delete
  let query = supabase
    .from("qi_nodes")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null);

  if (workspace_id) {
    query = query.eq("workspace_id", workspace_id);
  }

  const { error } = await query;

  if (error) {
    console.error("Error deleting note:", error);
    throw new Error(`Failed to delete note: ${error.message}`);
  }

  // Log event
  await logQiEvent(supabase, "NODE_DELETED", existing.qid, app_id, {
    soft_delete: true,
  });
}

