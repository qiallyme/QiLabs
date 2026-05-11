/**
 * Supabase-powered store for QiNote
 * 
 * This replaces the in-memory store with real Supabase persistence.
 * Use this pattern when you're ready to connect QiNote to the Unified Brain.
 */

import { create } from 'zustand';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { QiNode } from '../state/useQiStore';
import { QiRealmId } from '../qi/realms';
import { SystemCode } from '../qi/utils';

// Types matching Supabase schema
interface SupabaseQiNode {
  qid: string;
  realm: string;
  orbit: string;
  system: string;
  title: string;
  status?: string;
  tags?: string[];
  summary?: string;
  body?: string;
  app_id?: string;
  created_at: string;
  updated_at: string;
}

interface SupabaseQiState {
  client: SupabaseClient | null;
  workspaceId: string | null;
  nodes: Record<string, QiNode>;
  sequences: Record<string, number>;
  isInitialized: boolean;
  
  // Initialization
  initialize: (supabaseUrl: string, supabaseKey: string, workspaceId?: string | null) => void;
  
  // CRUD
  addNode: (node: QiNode) => Promise<void>;
  updateNode: (qid: string, updates: Partial<QiNode>) => Promise<void>;
  removeNode: (qid: string) => Promise<void>;
  getNode: (qid: string) => QiNode | undefined;
  getNodesByRealm: (realm: QiRealmId) => Promise<QiNode[]>;
  getNodesByOrbit: (realm: QiRealmId, orbit: string) => Promise<QiNode[]>;
  
  // Sequence tracking (still needed for QiD generation)
  getNextSequence: (realm: QiRealmId, orbitCode: string, systemCode: SystemCode) => number;
  
  // Sync
  syncFromSupabase: () => Promise<void>;
}

/**
 * Convert Supabase node to app node
 */
function supabaseToAppNode(supabaseNode: SupabaseQiNode): QiNode {
  return {
    qid: supabaseNode.qid,
    title: supabaseNode.title,
    realm: supabaseNode.realm as QiRealmId,
    orbit: supabaseNode.orbit,
    system: supabaseNode.system,
    body: supabaseNode.body,
    status: supabaseNode.status,
    tags: supabaseNode.tags,
    summary: supabaseNode.summary,
  };
}

/**
 * Convert app node to Supabase insert format
 */
function appToSupabaseNode(node: QiNode, workspaceId?: string | null): Partial<SupabaseQiNode> {
  const result: any = {
    qid: node.qid,
    realm: node.realm,
    orbit: node.orbit,
    system: node.system,
    title: node.title,
    status: node.status,
    tags: node.tags,
    summary: node.summary,
    body: node.body,
    app_id: 'QiNote',
  };
  
  // Only include workspace_id if provided
  if (workspaceId) {
    result.workspace_id = workspaceId;
  }
  
  return result;
}

export const useSupabaseQiStore = create<SupabaseQiState>((set, get) => ({
  client: null,
  workspaceId: null,
  nodes: {},
  sequences: {},
  isInitialized: false,

  initialize: (supabaseUrl, supabaseKey, workspaceId = null) => {
    const client = createClient(supabaseUrl, supabaseKey);
    set({ client, workspaceId, isInitialized: true });
    
    // Initial sync
    get().syncFromSupabase();
  },

  addNode: async (node) => {
    const { client, workspaceId } = get();
    if (!client) {
      throw new Error('Store not initialized. Call initialize() first.');
    }

    try {
      // Insert into Supabase (workspace_id is optional)
      const insertData = appToSupabaseNode(node, workspaceId);
      
      const { data, error } = await client
        .from('qi_nodes')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      set((state) => ({
        nodes: { ...state.nodes, [node.qid]: node },
      }));

      // Log event (optional - for Gina sync)
      await client.from('qi_events').insert({
        event_type: 'NODE_CREATED',
        qid: node.qid,
        app_id: 'QiNote',
        workspace_id: workspaceId,
        payload: { title: node.title },
      });
    } catch (error) {
      console.error('Failed to add node:', error);
      throw error;
    }
  },

  updateNode: async (qid, updates) => {
    const { client, workspaceId, nodes } = get();
    if (!client) {
      throw new Error('Store not initialized.');
    }

    const existing = nodes[qid];
    if (!existing) {
      throw new Error(`Node ${qid} not found`);
    }

    try {
      let query = client
        .from('qi_nodes')
        .update(updates)
        .eq('qid', qid);
      
      // Filter by workspace_id if provided, otherwise filter for NULL
      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      } else {
        query = query.is('workspace_id', null);
      }
      
      const { error } = await query;

      if (error) throw error;

      // Update local state
      set((state) => ({
        nodes: {
          ...state.nodes,
          [qid]: { ...existing, ...updates },
        },
      }));

      // Log event
      await client.from('qi_events').insert({
        event_type: 'NODE_UPDATED',
        qid,
        app_id: 'QiNote',
        workspace_id: workspaceId,
      });
    } catch (error) {
      console.error('Failed to update node:', error);
      throw error;
    }
  },

  removeNode: async (qid) => {
    const { client, workspaceId } = get();
    if (!client) {
      throw new Error('Store not initialized.');
    }

    try {
      let query = client
        .from('qi_nodes')
        .delete()
        .eq('qid', qid);
      
      // Filter by workspace_id if provided, otherwise filter for NULL
      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      } else {
        query = query.is('workspace_id', null);
      }
      
      const { error } = await query;

      if (error) throw error;

      // Update local state
      set((state) => {
        const { [qid]: removed, ...rest } = state.nodes;
        return { nodes: rest };
      });

      // Log event
      await client.from('qi_events').insert({
        event_type: 'NODE_DELETED',
        qid,
        app_id: 'QiNote',
        workspace_id: workspaceId,
      });
    } catch (error) {
      console.error('Failed to remove node:', error);
      throw error;
    }
  },

  getNode: (qid) => get().nodes[qid],

  getNodesByRealm: async (realm) => {
    const { client, workspaceId } = get();
    if (!client) {
      return [];
    }

    try {
      let query = client
        .from('qi_nodes')
        .select('*')
        .eq('realm', realm);
      
      // Filter by workspace_id if provided, otherwise filter for NULL
      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      } else {
        query = query.is('workspace_id', null);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const nodes = (data || []).map(supabaseToAppNode);
      
      // Update local cache
      set((state) => {
        const updated = { ...state.nodes };
        nodes.forEach(node => {
          updated[node.qid] = node;
        });
        return { nodes: updated };
      });

      return nodes;
    } catch (error) {
      console.error('Failed to get nodes by realm:', error);
      return [];
    }
  },

  getNodesByOrbit: async (realm, orbit) => {
    const { client, workspaceId } = get();
    if (!client) {
      return [];
    }

    try {
      let query = client
        .from('qi_nodes')
        .select('*')
        .eq('realm', realm)
        .eq('orbit', orbit);
      
      // Filter by workspace_id if provided, otherwise filter for NULL
      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      } else {
        query = query.is('workspace_id', null);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const nodes = (data || []).map(supabaseToAppNode);
      
      // Update local cache
      set((state) => {
        const updated = { ...state.nodes };
        nodes.forEach(node => {
          updated[node.qid] = node;
        });
        return { nodes: updated };
      });

      return nodes;
    } catch (error) {
      console.error('Failed to get nodes by orbit:', error);
      return [];
    }
  },

  getNextSequence: (realm, orbitCode, systemCode) => {
    const key = `${realm}.${orbitCode}.${systemCode}`;
    const current = get().sequences[key] ?? 0;
    const next = current + 1;
    set((state) => ({
      sequences: { ...state.sequences, [key]: next },
    }));
    return next;
  },

  syncFromSupabase: async () => {
    const { client, workspaceId } = get();
    if (!client) {
      return;
    }

    try {
      // Load all nodes - filter by workspace_id if provided, otherwise get NULL workspace_id nodes
      let query = client
        .from('qi_nodes')
        .select('*');
      
      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      } else {
        query = query.is('workspace_id', null);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const nodes = (data || []).reduce((acc, node) => {
        acc[node.qid] = supabaseToAppNode(node);
        return acc;
      }, {} as Record<string, QiNode>);

      set({ nodes });
    } catch (error) {
      console.error('Failed to sync from Supabase:', error);
    }
  },
}));

