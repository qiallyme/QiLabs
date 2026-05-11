import { create } from "zustand";
import { QiRealmId } from "../qi/realms";
import { SystemCode } from "../qi/utils";
import { fetchQiNodesByRealmOrbit, createQiNode, updateQiNode, deleteQiNode } from "../data/qiNodeRepository";
import { generateQiD } from "../qi/qid";
import { getOrbitCode } from "../qi/utils";
import { getSystemCode } from "../qi/utils";

export interface QiNode {
  qid: string;
  title: string;
  realm: QiRealmId;
  orbit: string;
  system: string;
  body?: string;
  status?: string;
  tags?: string[];
  summary?: string;
}

interface QiState {
  nodes: Record<string, QiNode>;
  sequences: Record<string, number>; // key = R.OO.SS
  addNode: (node: QiNode) => void;
  updateNode: (qid: string, updates: Partial<QiNode>) => void;
  removeNode: (qid: string) => void;
  getNode: (qid: string) => QiNode | undefined;
  getNodesByRealm: (realm: QiRealmId) => QiNode[];
  getNodesByOrbit: (realm: QiRealmId, orbit: string) => QiNode[];
  getNextSequence: (realm: QiRealmId, orbitCode: string, systemCode: SystemCode) => number;
  // New methods for Supabase integration
  loadNodes: (realm: QiRealmId, orbit?: string) => Promise<void>;
  createNode: (input: {
    title: string;
    body?: string;
    realm: QiRealmId;
    orbit: string;
    system: string;
    status?: string;
    tags?: string[];
  }) => Promise<QiNode | null>;
  updateNodeAsync: (qid: string, updates: Partial<QiNode>) => Promise<QiNode | null>;
  deleteNodeAsync: (qid: string) => Promise<boolean>;
}

export const useQiStore = create<QiState>((set, get) => ({
  nodes: {},
  sequences: {},
  
  addNode: (node) => {
    // Prevent duplicate QiDs
    if (get().nodes[node.qid]) {
      console.warn(`QiNode with QiD ${node.qid} already exists. Skipping.`);
      return;
    }
    
    set((state) => ({
      nodes: { ...state.nodes, [node.qid]: node }
    }));
  },
  
  updateNode: (qid, updates) => {
    const existing = get().nodes[qid];
    if (!existing) {
      console.warn(`QiNode with QiD ${qid} not found. Cannot update.`);
      return;
    }
    
    set((state) => ({
      nodes: {
        ...state.nodes,
        [qid]: { ...existing, ...updates }
      }
    }));
  },
  
  removeNode: (qid) => {
    set((state) => {
      const { [qid]: removed, ...rest } = state.nodes;
      return { nodes: rest };
    });
  },
  
  getNode: (qid) => get().nodes[qid],
  
  getNodesByRealm: (realm) =>
    Object.values(get().nodes).filter((node) => node.realm === realm),
  
  getNodesByOrbit: (realm, orbit) =>
    Object.values(get().nodes).filter(
      (node) => node.realm === realm && node.orbit === orbit
    ),
  
  getNextSequence: (realm, orbitCode, systemCode) => {
    const key = `${realm}.${orbitCode}.${systemCode}`;
    const current = get().sequences[key] ?? 0;
    const next = current + 1;
    set((state) => ({
      sequences: { ...state.sequences, [key]: next }
    }));
    return next;
  },

  loadNodes: async (realm, orbit) => {
    try {
      const nodes = await fetchQiNodesByRealmOrbit(realm, orbit);
      set((state) => {
        const updated = { ...state.nodes };
        nodes.forEach((node) => {
          updated[node.qid] = node;
        });
        return { nodes: updated };
      });
    } catch (error) {
      console.error("Failed to load nodes:", error);
    }
  },

  createNode: async (input) => {
    try {
      // Generate QiD
      const orbitCode = getOrbitCode(input.realm, input.orbit) || "01";
      const systemCode = getSystemCode(input.system) || "01";
      const sequence = get().getNextSequence(input.realm, orbitCode, systemCode);
      
      const qid = generateQiD({
        realm: input.realm,
        orbitCode,
        systemCode,
        lastSequence: sequence - 1, // getNextSequence already increments
      });

      const nodeData: QiNode = {
        qid,
        title: input.title,
        realm: input.realm,
        orbit: input.orbit,
        system: input.system,
        body: input.body,
        status: input.status,
        tags: input.tags,
      };

      // Save to Supabase
      const saved = await createQiNode(nodeData);
      
      if (saved) {
        // Update local store
        get().addNode(saved);
        
        // Ingest into memory pipeline (async, don't block)
        import('../api/workerClient').then(({ ingestNote }) => {
          ingestNote(
            saved.title,
            saved.body || '',
            saved.realm,
            saved.qid,
            saved.realm.toLowerCase()
          ).then((ingestResult) => {
            console.log(`[QiNote] Note ingested: ${ingestResult.id} (${ingestResult.status})`);
            // Optionally poll for status and update UI
          }).catch((error) => {
            console.error('[QiNote] Ingestion failed:', error);
            // Non-blocking - note is saved, ingestion can retry later
          });
        }).catch((error) => {
          console.error('[QiNote] Failed to load ingestion client:', error);
        });
        
        return saved;
      }
      
      return null;
    } catch (error) {
      console.error("Failed to create node:", error);
      // Log more details for debugging
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
        });
      }
      return null;
    }
  },

  updateNodeAsync: async (qid, updates) => {
    try {
      const saved = await updateQiNode(qid, updates);
      if (saved) {
        get().updateNode(qid, updates);
        return saved;
      }
      return null;
    } catch (error) {
      console.error("Failed to update node:", error);
      return null;
    }
  },

  deleteNodeAsync: async (qid) => {
    try {
      const success = await deleteQiNode(qid);
      if (success) {
        get().removeNode(qid);
      }
      return success;
    } catch (error) {
      console.error("Failed to delete node:", error);
      return false;
    }
  },
}));

