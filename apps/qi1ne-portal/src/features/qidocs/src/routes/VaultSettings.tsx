// src/routes/VaultSettings.tsx
import React, { useEffect, useState } from "react";
import { useVaultStore } from "../store/vaultStore";

const DEFAULT_SUGGESTIONS = [
  "C:\\QiOS\\data\\qiverse",
  "C:\\QiOS\\data\\qiverse\\QiOne",
  "C:\\QiOS\\data\\qiverse\\QiProjects",
];

export default function VaultSettings() {
  const { vaultPath, setVaultPath } = useVaultStore();
  const [value, setValue] = useState(vaultPath ?? "");

  useEffect(() => {
    if (vaultPath && !value) setValue(vaultPath);
  }, [vaultPath]);

  const handleSave = () => {
    if (!value.trim()) return;
    setVaultPath(value.trim());
  };

  return (
    <div className="p-6 text-slate-100 min-h-screen bg-slate-950">
      <h1 className="text-2xl font-semibold mb-4">QiNote Vault Settings</h1>
      <p className="text-sm text-slate-300 mb-4">
        Choose the root folder QiNote should treat as your vault.  
        File browsing, editing, and ingestion will anchor from this folder.
      </p>

      <label className="block text-sm mb-2">Vault folder path</label>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="C:\QiOS\data\qiverse\QiOne"
        className="w-full px-3 py-2 rounded-md bg-slate-900 border border-slate-700 text-sm mb-3"
      />

      <button
        onClick={handleSave}
        className="px-4 py-2 rounded-md bg-indigo-500 hover:bg-indigo-600 text-sm font-medium"
      >
        Save vault path
      </button>

      <div className="mt-6">
        <h2 className="text-sm font-semibold mb-2">Quick suggestions</h2>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_SUGGESTIONS.map((path) => (
            <button
              key={path}
              onClick={() => setValue(path)}
              className="px-3 py-1 text-xs rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600"
            >
              {path}
            </button>
          ))}
        </div>
      </div>

      {vaultPath && (
        <div className="mt-6 text-xs text-slate-400">
          <div className="font-semibold mb-1">Current vault:</div>
          <div className="font-mono break-all">{vaultPath}</div>
        </div>
      )}
    </div>
  );
}
