/**
 * Storage abstraction layer
 * Will be implemented with IndexedDB (web) or Tauri FS (desktop)
 */

import { QiNode } from "../qi/schema";

export interface StorageAdapter {
  getNode(qid: string): Promise<QiNode | null>;
  saveNode(node: QiNode): Promise<void>;
  listNodes(realm?: string, orbit?: string, system?: string): Promise<QiNode[]>;
  deleteNode(qid: string): Promise<void>;
}

// Placeholder implementation - replace with actual storage
class MemoryStorage implements StorageAdapter {
  private nodes: Map<string, QiNode> = new Map();

  async getNode(qid: string): Promise<QiNode | null> {
    return this.nodes.get(qid) || null;
  }

  async saveNode(node: QiNode): Promise<void> {
    this.nodes.set(node.qid, node);
  }

  async listNodes(
    realm?: string,
    orbit?: string,
    system?: string
  ): Promise<QiNode[]> {
    let nodes = Array.from(this.nodes.values());
    if (realm) nodes = nodes.filter((n) => n.realm === realm);
    if (orbit) nodes = nodes.filter((n) => n.orbit === orbit);
    if (system) nodes = nodes.filter((n) => n.system === system);
    return nodes;
  }

  async deleteNode(qid: string): Promise<void> {
    this.nodes.delete(qid);
  }
}

export const storage: StorageAdapter = new MemoryStorage();

