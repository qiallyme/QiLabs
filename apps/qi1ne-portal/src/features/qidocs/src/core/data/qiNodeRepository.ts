/**
 * QiNode Repository
 * 
 * Repository pattern for QiNode operations.
 * Can be mirrored in QiCockpit/Gina for consistency.
 */

import { supabase } from "./supabase";
import type { QiNodeRow } from "./types";
import type { QiNode } from "../state/useQiStore";

const APP_ID = "QiNote";

/**
 * Map database row to QiNode
 */
function mapRowToQiNode(row: QiNodeRow): QiNode {
  const meta = (row.meta as { body?: string; summary?: string }) || {};
  const body = meta.body || "";
  return {
    qid: row.qid,
    title: row.title,
    realm: row.realm as QiNode["realm"],
    orbit: row.orbit,
    system: row.system,
    body,
    status: row.status ?? undefined,
    tags: row.tags ?? undefined,
    summary: meta.summary ?? undefined,
  };
}

/**
 * Fetch QiNodes by realm and optionally orbit
 * Alias for consistency with store
 */
export async function fetchQiNodes(
  realm: string,
  orbit?: string,
  workspaceId?: string
): Promise<QiNode[]> {
  return fetchQiNodesByRealmOrbit(realm, orbit, workspaceId);
}

/**
 * Fetch QiNodes by realm and optionally orbit
 */
export async function fetchQiNodesByRealmOrbit(
  realm: string,
  orbit?: string,
  workspaceId?: string
): Promise<QiNode[]> {
  if (!supabase) {
    console.warn("Supabase not configured. Returning empty array.");
    return [];
  }

  let query = supabase
    .from("qi_nodes")
    .select("*")
    .eq("realm", realm);

  if (orbit) {
    query = query.eq("orbit", orbit);
  }

  if (workspaceId) {
    query = query.eq("workspace_id", workspaceId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("fetchQiNodesByRealmOrbit error", error);
    return [];
  }

  return (data ?? []).map(mapRowToQiNode);
}

/**
 * Get a single QiNode by QiD
 */
export async function fetchQiNodeByQid(
  qid: string,
  workspaceId?: string
): Promise<QiNode | null> {
  if (!supabase) {
    console.warn("Supabase not configured. Returning null.");
    return null;
  }

  let query = supabase
    .from("qi_nodes")
    .select("*")
    .eq("qid", qid);

  if (workspaceId) {
    query = query.eq("workspace_id", workspaceId);
  }

  query = query.single();

  const { data, error } = await query;

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    console.error("fetchQiNodeByQid error", error);
    return null;
  }

  return data ? mapRowToQiNode(data as QiNodeRow) : null;
}

/**
 * Create a new QiNode
 * Supports both full QiNode object and CreateQiNodeInput
 */
export async function createQiNode(
  input: QiNode | {
    qid: string;
    title: string;
    realm: string;
    orbit: string;
    system: string;
    body?: string;
    status?: string;
    tags?: string[];
  },
  workspaceId?: string
): Promise<QiNode | null> {
  if (!supabase) {
    console.warn(
      "Supabase not configured. Cannot create node. " +
      "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file."
    );
    // Return a local-only node for development
    return {
      qid: input.qid,
      title: input.title,
      realm: input.realm,
      orbit: input.orbit,
      system: input.system,
      body: "body" in input ? input.body : undefined,
      status: "status" in input ? input.status : undefined,
      tags: "tags" in input ? input.tags : undefined,
    };
  }

  // Normalize input - extract values regardless of input type
  const qid = input.qid;
  const title = input.title;
  const realm = input.realm;
  const orbit = input.orbit;
  const system = input.system;
  const body = "body" in input ? input.body : undefined;
  const status = "status" in input ? input.status : undefined;
  const tags = "tags" in input ? input.tags : undefined;

  const insertData: {
    qid: string;
    title: string;
    realm: string;
    orbit: string;
    system: string;
    status: string;
    tags: string[];
    app_id: string;
    meta: { body?: string; summary?: string };
    workspace_id?: string;
  } = {
    qid,
    title,
    realm,
    orbit,
    system,
    status: status ?? "Active",
    tags: tags ?? [],
    app_id: APP_ID,
    meta: { body },
  };

  if (workspaceId) {
    insertData.workspace_id = workspaceId;
  }

  const { data, error } = await supabase
    .from("qi_nodes")
    .insert(insertData)
    .select("*")
    .single();

  if (error) {
    console.error("createQiNode error", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      insertData,
    });
    
    // If table doesn't exist, return local-only node for development
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      console.warn(
        "qi_nodes table not found in Supabase. " +
        "Returning local-only node. Deploy the Supabase schema to enable persistence."
      );
      return {
        qid: input.qid,
        title: input.title,
        realm: input.realm,
        orbit: input.orbit,
        system: input.system,
        body: "body" in input ? input.body : undefined,
        status: "status" in input ? input.status : undefined,
        tags: "tags" in input ? input.tags : undefined,
      };
    }
    
    return null;
  }

  // Log event for Gina/Cockpit to pick up
  await supabase.from("qi_events").insert({
    event_type: "NODE_CREATED",
    qid,
    app_id: APP_ID,
    payload: { realm, orbit, system, title },
  });

  return mapRowToQiNode(data as QiNodeRow);
}

/**
 * Update an existing QiNode
 */
export async function updateQiNode(
  qid: string,
  updates: Partial<QiNode>,
  workspaceId?: string
): Promise<QiNode | null> {
  if (!supabase) {
    console.warn("Supabase not configured. Cannot update node.");
    return null;
  }

  const updateData: {
    title?: string;
    status?: string;
    tags?: string[];
    meta?: { body?: string; summary?: string };
  } = {};

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.tags !== undefined) updateData.tags = updates.tags;

  // Update body in meta
  if (updates.body !== undefined || updates.summary !== undefined) {
    // Fetch existing meta first
    const { data: existing } = await supabase
      .from("qi_nodes")
      .select("meta")
      .eq("qid", qid)
      .single();

    const existingMeta = (existing?.meta as { body?: string; summary?: string }) || {};
    updateData.meta = {
      ...existingMeta,
      body: updates.body !== undefined ? updates.body : existingMeta.body,
      summary: updates.summary !== undefined ? updates.summary : existingMeta.summary,
    };
  }

  let query = supabase
    .from("qi_nodes")
    .update(updateData)
    .eq("qid", qid);

  if (workspaceId) {
    query = query.eq("workspace_id", workspaceId);
  }

  const { data, error } = await query.select("*").single();

  if (error) {
    console.error("updateQiNode error", error);
    return null;
  }

  // Log event
  await supabase.from("qi_events").insert({
    event_type: "NODE_UPDATED",
    qid,
    app_id: APP_ID,
    payload: { updates: Object.keys(updateData) },
  });

  return data ? mapRowToQiNode(data as QiNodeRow) : null;
}

/**
 * Delete a QiNode
 */
export async function deleteQiNode(
  qid: string,
  workspaceId?: string
): Promise<boolean> {
  if (!supabase) {
    console.warn("Supabase not configured. Cannot delete node.");
    return false;
  }

  let query = supabase.from("qi_nodes").delete().eq("qid", qid);

  if (workspaceId) {
    query = query.eq("workspace_id", workspaceId);
  }

  const { error } = await query;

  if (error) {
    console.error("deleteQiNode error", error);
    return false;
  }

  // Log event
  await supabase.from("qi_events").insert({
    event_type: "NODE_DELETED",
    qid,
    app_id: APP_ID,
  });

  return true;
}

