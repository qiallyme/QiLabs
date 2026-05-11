// src/routes/VaultView.tsx
import React, { useEffect, useState } from "react";
import { useVaultStore } from "../store/vaultStore";
import QiNoteFileTree from "../components/common/QiNoteFileTree.tsx";
import QiNoteMarkdownEditor from "../components/common/QiNoteMarkdownEditor.tsx";
import {
  fetchVaultTree,
  fetchVaultFile,
  saveVaultFile,
  VaultFileNode,
} from "../core/data/vaultApi";

export default function VaultView() {
  const { vaultPath } = useVaultStore();
  const [tree, setTree] = useState<VaultFileNode[] | null>(null);
  const [selectedFile, setSelectedFile] = useState<VaultFileNode | null>(null);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTree = async () => {
      if (!vaultPath) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchVaultTree(vaultPath);
        setTree(data);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Failed to load vault tree"
        );
      } finally {
        setLoading(false);
      }
    };

    loadTree();
  }, [vaultPath]);

  const handleSelect = async (node: VaultFileNode) => {
    if (node.type !== "file") return;
    setSelectedFile(node);
    setLoading(true);
    setError(null);
    try {
      const fileContent = await fetchVaultFile(node.path);
      setContent(fileContent ?? "");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to load file content"
      );
      setContent("");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value: string) => {
    setContent(value);
  };

  const handleSave = async () => {
    if (!selectedFile) return;
    setSaving(true);
    setError(null);
    try {
      await saveVaultFile(selectedFile.path, content);
      // later: trigger re-index / ingest here
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save file");
    } finally {
      setSaving(false);
    }
  };

  if (!vaultPath) {
    return (
      <div className="p-6 text-slate-100 bg-slate-950 min-h-screen">
        <h1 className="text-2xl font-semibold mb-2">Vault Explorer</h1>
        <p className="text-sm text-slate-300">
          No vault configured. Go to <code>/vault/settings</code> to set a vault
          folder path.
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-slate-950 text-slate-100">
      {/* Sidebar: tree */}
      <div className="w-72 border-r border-slate-800 flex flex-col">
        <div className="p-3 border-b border-slate-800 text-xs text-slate-400">
          Vault: <span className="font-mono">{vaultPath}</span>
        </div>

        {loading && !tree && (
          <div className="p-3 text-xs text-slate-400">Loading tree…</div>
        )}
        {error && (
          <div className="p-3 text-xs text-red-400">Error: {error}</div>
        )}
        {tree && (
          <QiNoteFileTree
            data={tree}
            onSelect={handleSelect}
          />
        )}
      </div>

      {/* Main: editor */}
      <div className="flex-1 flex flex-col">
        <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
          <div className="text-sm">
            {selectedFile ? (
              <>
                <div className="font-mono text-sky-400 text-xs">
                  {selectedFile.path}
                </div>
                <div>{selectedFile.name}</div>
              </>
            ) : (
              <span className="text-slate-500 text-sm">
                Select a Markdown file from the tree
              </span>
            )}
          </div>
          {selectedFile && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1 rounded-md bg-indigo-500 hover:bg-indigo-600 text-xs font-medium disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          {selectedFile ? (
            <QiNoteMarkdownEditor content={content} onChange={handleChange} />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              Choose a file to start editing
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
