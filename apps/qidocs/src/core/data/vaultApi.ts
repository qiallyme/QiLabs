// src/core/data/vaultApi.ts
const WORKER_URL = import.meta.env.VITE_WORKER_URL || "";

export interface VaultFileNode {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  children?: VaultFileNode[];
}

export async function fetchVaultTree(root: string): Promise<VaultFileNode[]> {
  if (!WORKER_URL) {
    throw new Error("Worker URL not configured. Set VITE_WORKER_URL.");
  }

  const res = await fetch(
    `${WORKER_URL}/vault/tree?root=${encodeURIComponent(root)}`
  );

  if (!res.ok) {
    throw new Error(
      `Failed to load vault tree: ${res.status} ${res.statusText}`
    );
  }

  const data = await res.json();
  return data.tree ?? [];
}

export async function fetchVaultFile(path: string): Promise<string> {
  if (!WORKER_URL) {
    throw new Error("Worker URL not configured.");
  }

  const res = await fetch(
    `${WORKER_URL}/vault/file?path=${encodeURIComponent(path)}`
  );

  if (!res.ok) {
    throw new Error(`Failed to load file: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.content ?? "";
}

export async function saveVaultFile(
  path: string,
  content: string
): Promise<void> {
  if (!WORKER_URL) {
    throw new Error("Worker URL not configured.");
  }

  const res = await fetch(`${WORKER_URL}/vault/file`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, content }),
  });

  if (!res.ok) {
    throw new Error(`Failed to save file: ${res.status} ${res.statusText}`);
  }
}
