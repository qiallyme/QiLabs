// @ts-nocheck
/**
 * Gina Memory Helpers
 * 
 * Functions for Gina to create and manage memory QiNodes
 * All memories are just QiNodes with app_id = "Gina" and Memory-* systems
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabaseMind";
import { upsertQiNode, upsertQiChunk } from "./supabaseMind";
import { upsertChunksForNode } from "./rag";
import OpenAI from "openai";

export type GinaMemoryType = "fact" | "event" | "insight" | "plan" | "link" | "config";

export interface GinaMemoryMeta {
  type: GinaMemoryType;
  system_code: number; // 10-15, must match type
  confidence: number; // 0-1, required
  source: "chat" | "import" | "worker" | "manual";
  source_ref?: string; // message id, file, task, etc
  created_by: "Gina" | "User";
  updated_at?: string; // ISO datetime
  tags?: string[];
  // Legacy fields (for backward compatibility)
  memory_type?: GinaMemoryType; // maps to type
  last_refreshed_at?: string; // maps to updated_at
  source_qids?: string[];
  scope?: "user" | "system" | "client" | "project";
  importance?: 1 | 2 | 3; // 1 = low, 3 = high
  created_from?: {
    event_id?: number;
    trigger?: string;
  };
  link_type?: "semantic" | "temporal" | "causal";
}

export interface CreateGinaMemoryInput {
  qid: string;
  realm: string;
  orbit: string;
  system: "Memory-Fact" | "Memory-Event" | "Memory-Insight" | "Memory-Plan" | "Memory-Link" | "Memory-Config";
  title: string;
  body: string;
  tags?: string[];
  entanglement?: {
    origin_qid?: string;
    influence_qid?: string;
    companion_qid?: string;
  };
  ginaMeta: GinaMemoryMeta;
  workspace_id?: string | null;
}

// System code mapping
const MEMORY_SYSTEM_CODES: Record<GinaMemoryType, number> = {
  fact: 10,
  event: 11,
  insight: 12,
  plan: 13,
  link: 14,
  config: 15,
};

/**
 * Create a Gina memory QiNode
 * 
 * ENFORCEMENT: Must call findExistingMemoryNode() before this!
 */
export async function createGinaMemory(
  supabase: SupabaseClient<Database>,
  openai: OpenAI,
  input: CreateGinaMemoryInput
) {
  const { ginaMeta, body, ...rest } = input;

  // Normalize meta (support both new and legacy fields)
  const normalizedMeta: GinaMemoryMeta = {
    ...ginaMeta,
    type: ginaMeta.type || ginaMeta.memory_type || "fact",
    system_code: ginaMeta.system_code || MEMORY_SYSTEM_CODES[ginaMeta.type || ginaMeta.memory_type || "fact"],
    confidence: ginaMeta.confidence ?? 0.5,
    source: ginaMeta.source || "worker",
    created_by: ginaMeta.created_by || "Gina",
    updated_at: new Date().toISOString(),
    // Legacy compatibility
    memory_type: ginaMeta.type || ginaMeta.memory_type,
    last_refreshed_at: new Date().toISOString(),
  };

  // Validate system_code matches type
  const expectedCode = MEMORY_SYSTEM_CODES[normalizedMeta.type];
  if (normalizedMeta.system_code !== expectedCode) {
    throw new Error(
      `System code ${normalizedMeta.system_code} does not match memory type ${normalizedMeta.type} (expected ${expectedCode})`
    );
  }

  // Quality gates (per spec Section 11.4)
  if (!input.title || input.title.trim().length === 0) {
    throw new Error("Memory node must have non-empty title");
  }
  if (!body || body.trim().length < 10) {
    throw new Error("Memory node body must be at least 10 characters");
  }
  if (normalizedMeta.confidence === 0) {
    throw new Error("Memory node cannot have confidence 0 (uncertainty)");
  }

  // Create the QiNode with Gina metadata
  const node = await upsertQiNode(supabase, {
    ...rest,
    app_id: "Gina",
    app_tags: ["gina-memory", normalizedMeta.type],
    meta: {
      gina: normalizedMeta,
      body, // Store body in meta for now (or use body field if schema supports it)
    },
  });

  // Generate chunks and embeddings
  await upsertChunksForNode({
    supabase,
    openai,
    qid: input.qid,
    realm: input.realm,
    orbit: input.orbit,
    system: input.system,
    content: body,
    workspace_id: input.workspace_id,
    app_id: "Gina",
  });

  return node;
}

/**
 * Update an existing Gina memory node
 */
export async function updateGinaMemory(
  supabase: SupabaseClient<Database>,
  openai: OpenAI,
  qid: string,
  updates: {
    title?: string;
    body?: string;
    tags?: string[];
    ginaMeta?: Partial<GinaMemoryMeta>;
  },
  workspace_id?: string | null
) {
  // Fetch existing node
  const { data: existing } = await supabase
    .from("qi_nodes")
    .select("*")
    .eq("qid", qid)
    .single();

  if (!existing) {
    throw new Error(`Gina memory node ${qid} not found`);
  }

  const existingMeta = (existing.meta as { gina?: GinaMemoryMeta; body?: string }) || {};
  const existingGinaMeta = existingMeta.gina || {};

  // Merge metadata
  const updatedMeta = {
    ...existingMeta,
    gina: {
      ...existingGinaMeta,
      ...updates.ginaMeta,
      last_refreshed_at: new Date().toISOString(),
    },
    body: updates.body !== undefined ? updates.body : existingMeta.body,
  };

  // Update node
  const { data, error } = await supabase
    .from("qi_nodes")
    .update({
      title: updates.title,
      tags: updates.tags,
      meta: updatedMeta,
      updated_at: new Date().toISOString(),
    })
    .eq("qid", qid)
    .select("*")
    .single();

  if (error) throw error;

  // Regenerate chunks if body changed
  if (updates.body) {
    await upsertChunksForNode({
      supabase,
      openai,
      qid,
      realm: existing.realm,
      orbit: existing.orbit,
      system: existing.system,
      content: updates.body,
      workspace_id: workspace_id ?? existing.workspace_id,
      app_id: "Gina",
    });
  }

  return data;
}

/**
 * Check if a memory node should be created or updated
 * Returns existing qid if update, null if new
 * 
 * ENFORCEMENT: This MUST be called before createGinaMemory() per spec Section 11.1
 * 
 * Matching strategy per memory type:
 * - Memory-Fact: realm + orbit + category
 * - Memory-Plan: realm + orbit + plan_name
 * - Memory-Event: realm + orbit + event_series (within 7 days)
 * - Memory-Insight: realm + orbit + insight_topic
 * - Memory-Link: source_qid + target_qid
 * - Memory-Config: realm + config_key
 */
export async function findExistingMemoryNode(
  supabase: SupabaseClient<Database>,
  criteria: {
    realm: string;
    orbit?: string;
    system: string;
    memory_type: GinaMemoryType;
    scope?: string;
    category?: string; // For facts: "timezone", "address", etc.
    plan_name?: string; // For plans: extracted from title
    event_series?: string; // For events: "AES saga", etc.
    insight_topic?: string; // For insights: "procrastination pattern", etc.
    source_qid?: string; // For links
    target_qid?: string; // For links
    config_key?: string; // For configs
  }
): Promise<string | null> {
  let query = supabase
    .from("qi_nodes")
    .select("qid, meta, title, created_at")
    .eq("realm", criteria.realm)
    .eq("system", criteria.system)
    .eq("app_id", "Gina");

  if (criteria.orbit) {
    query = query.eq("orbit", criteria.orbit);
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) return null;

  // Type-specific matching
  for (const node of data) {
    const meta = (node.meta as { gina?: GinaMemoryMeta }) || {};
    const ginaMeta = meta.gina;
    
    if (!ginaMeta) continue;

    const nodeType = ginaMeta.type || ginaMeta.memory_type;
    if (nodeType !== criteria.memory_type) continue;

    // Memory-Fact: match on category
    if (criteria.memory_type === "fact" && criteria.category) {
      // Check if title or tags contain category
      if (
        node.title.toLowerCase().includes(criteria.category.toLowerCase()) ||
        ginaMeta.tags?.some(t => t.toLowerCase().includes(criteria.category!.toLowerCase()))
      ) {
        return node.qid;
      }
    }

    // Memory-Plan: match on plan_name
    if (criteria.memory_type === "plan" && criteria.plan_name) {
      if (node.title.toLowerCase().includes(criteria.plan_name.toLowerCase())) {
        return node.qid;
      }
    }

    // Memory-Event: match on event_series (within 7 days)
    if (criteria.memory_type === "event" && criteria.event_series) {
      const createdAt = new Date(node.created_at);
      const daysSince = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince <= 7 && node.title.toLowerCase().includes(criteria.event_series.toLowerCase())) {
        return node.qid;
      }
    }

    // Memory-Insight: match on insight_topic
    if (criteria.memory_type === "insight" && criteria.insight_topic) {
      if (node.title.toLowerCase().includes(criteria.insight_topic.toLowerCase())) {
        return node.qid;
      }
    }

    // Memory-Link: match on source + target
    if (criteria.memory_type === "link" && criteria.source_qid && criteria.target_qid) {
      const sourceQids = ginaMeta.source_qids || [];
      if (sourceQids.includes(criteria.source_qid) || sourceQids.includes(criteria.target_qid)) {
        // Check if both are linked
        const linkData = meta as { source_qid?: string; target_qid?: string };
        if (
          (linkData.source_qid === criteria.source_qid && linkData.target_qid === criteria.target_qid) ||
          (linkData.source_qid === criteria.target_qid && linkData.target_qid === criteria.source_qid)
        ) {
          return node.qid;
        }
      }
    }

    // Memory-Config: match on config_key
    if (criteria.memory_type === "config" && criteria.config_key) {
      if (node.title.toLowerCase().includes(criteria.config_key.toLowerCase())) {
        return node.qid;
      }
    }

    // Fallback: match on scope if provided
    if (criteria.scope && ginaMeta.scope === criteria.scope) {
      return node.qid;
    }
  }

  return null;
}

