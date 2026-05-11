import { useState, useEffect } from "react";
import GlassCard from "../../components/common/GlassCard";
import Spinner from "../../components/feedback/Spinner";
import Alert from "../../components/feedback/Alert";
import { supabase } from "../../core/data/supabase";

interface IngestStatus {
  run_id: string;
  status: "queued" | "running" | "completed" | "error";
  started_at?: string;
  completed_at?: string;
  stats?: {
    sessions_created: number;
    messages_processed: number;
    chunks_embedded: number;
    errors: number;
  };
}

interface DataIntakePanelProps {
  className?: string;
}

export default function DataIntakePanel({ className }: DataIntakePanelProps) {
  const [vaultPath, setVaultPath] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<IngestStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const workerUrl = import.meta.env.VITE_INGEST_WORKER_URL || "https://qimind-ingest.your-domain.workers.dev";

  // Load vault path from qi_apps.meta
  useEffect(() => {
    loadVaultPath();
    loadLatestStatus();
  }, []);

  const loadVaultPath = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from("qi_apps")
        .select("meta")
        .eq("id", "QiNote")
        .single();

      if (error) throw error;
      if (data?.meta?.vault_path) {
        setVaultPath(data.meta.vault_path);
      }
    } catch (err) {
      console.error("Failed to load vault path:", err);
    }
  };

  const saveVaultPath = async (path: string) => {
    if (!supabase) {
      setError("Supabase not configured");
      return;
    }
    try {
      const { error } = await supabase
        .from("qi_apps")
        .update({
          meta: { vault_path: path },
        })
        .eq("id", "QiNote");

      if (error) throw error;
      setVaultPath(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save vault path");
    }
  };

  const loadLatestStatus = async () => {
    try {
      const response = await fetch(`${workerUrl}/status/latest`);
      if (!response.ok) throw new Error("Failed to fetch status");
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      console.error("Failed to load status:", err);
    }
  };

  const handleRunIngest = async () => {
    if (!vaultPath) {
      setError("Please select a vault folder first");
      return;
    }

    setIsRunning(true);
    setError(null);

    try {
      const response = await fetch(`${workerUrl}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vault_path: vaultPath,
          mode: "incremental",
          sources: ["chats", "emails"],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start ingestion");
      }

      const data = await response.json();
      setStatus({
        run_id: data.run_id,
        status: "queued",
        started_at: new Date().toISOString(),
      });

      // Poll for status updates
      pollStatus(data.run_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start ingestion");
      setIsRunning(false);
    }
  };

  const pollStatus = async (runId: string) => {
    const maxAttempts = 60;
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const response = await fetch(`${workerUrl}/status/latest`);
        if (response.ok) {
          const data = await response.json();
          setStatus(data);

          if (data.status === "completed" || data.status === "error" || attempts >= maxAttempts) {
            clearInterval(interval);
            setIsRunning(false);
            if (attempts >= maxAttempts) {
              setError("Ingestion timed out");
            }
          }
        }
      } catch (err) {
        console.error("Failed to poll status:", err);
      }
    }, 2000); // Poll every 2 seconds
  };

  const handleVaultPathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const path = e.target.value;
    saveVaultPath(path);
  };

  const handleFolderPicker = async () => {
    // Try File System Access API (Chrome/Edge)
    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker();
        const path = dirHandle.name;
        // Note: File System Access API doesn't give full path for security
        // Store the handle or use the name
        await saveVaultPath(path);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Failed to select folder');
        }
      }
    } else {
      // Fallback: show file input
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true;
      input.onchange = (e: any) => {
        const files = e.target.files;
        if (files && files.length > 0) {
          // Get directory path from first file
          const firstFile = files[0];
          const path = firstFile.webkitRelativePath.split('/')[0];
          saveVaultPath(path);
        }
      };
      input.click();
    }
  };

  return (
    <div className={className}>
      <GlassCard className="p-6">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-indigo-300 mb-2">
              📥 Data Intake
            </h2>
            <p className="text-slate-400 text-sm">
              Index your vault and timeline data into Gina's memory
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Vault Path Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-300">
              Primary Vault Folder
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={vaultPath}
                onChange={handleVaultPathChange}
                placeholder="C:/QiOS/QiVault or select folder"
                className="flex-1 glass-card rounded-lg px-4 py-2 text-sm text-slate-200 bg-slate-900/50 border border-slate-700 focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={handleFolderPicker}
                className="glass-card rounded-lg px-4 py-2 text-sm font-medium text-indigo-300 hover:bg-indigo-500/20 transition-colors border border-slate-700"
              >
                📁 Browse
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Path to your QiVault folder containing notes, PDFs, images, etc.
              <br />
              <span className="text-slate-600">
                Note: Browser folder picker may not show full path. Enter manually if needed.
              </span>
            </p>
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunIngest}
            disabled={isRunning || !vaultPath}
            className="glass-card rounded-xl px-6 py-3 text-sm font-medium text-indigo-300 hover:bg-indigo-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <>
                <Spinner size="sm" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <span className="text-lg">▶️</span>
                <span>Run Ingest Now</span>
              </>
            )}
          </button>

          {/* Status Display */}
          {status && (
            <div className="glass-card rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Last Run</span>
                <span className="text-xs text-slate-500">
                  {status.started_at
                    ? new Date(status.started_at).toLocaleString()
                    : "Never"}
                </span>
              </div>

              {status.stats && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Sessions:</span>
                    <span className="ml-2 text-indigo-300 font-medium">
                      {status.stats.sessions_created}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Messages:</span>
                    <span className="ml-2 text-indigo-300 font-medium">
                      {status.stats.messages_processed}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Chunks:</span>
                    <span className="ml-2 text-indigo-300 font-medium">
                      {status.stats.chunks_embedded}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Errors:</span>
                    <span className="ml-2 text-red-400 font-medium">
                      {status.stats.errors}
                    </span>
                  </div>
                </div>
              )}

              {status.status === "running" && (
                <div className="flex items-center gap-2 text-xs text-indigo-400">
                  <Spinner size="sm" />
                  <span>Processing...</span>
                </div>
              )}
            </div>
          )}

          {/* Info Section */}
          <div className="border-t border-slate-700 pt-4">
            <h3 className="text-sm font-medium text-slate-300 mb-2">What gets indexed:</h3>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Chat exports (ChatGPT, Discord, etc.)</li>
              <li>• Email messages from qi_os.email_message</li>
              <li>• Documents in your vault (PDFs, markdown)</li>
              <li>• Timeline sessions grouped by time gaps</li>
              <li>• Vector embeddings for semantic search</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

