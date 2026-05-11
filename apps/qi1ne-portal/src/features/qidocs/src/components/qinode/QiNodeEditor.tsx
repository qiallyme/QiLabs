import { FormEvent, useState, useEffect } from "react";
import { useQiStore, QiNode } from "../../core/state/useQiStore";
import { QiRealmId } from "../../core/qi/realms";

interface Props {
  defaultRealm?: QiRealmId;
  defaultOrbit?: string;
  defaultSystem?: string;
  node?: QiNode; // If provided, edit mode
  onSuccess?: (node: QiNode) => void;
  onDelete?: () => void;
}

export default function QiNodeEditor({
  defaultRealm,
  defaultOrbit,
  defaultSystem,
  node,
  onSuccess,
  onDelete,
}: Props) {
  const isEditMode = !!node;
  const [title, setTitle] = useState(node?.title || "");
  const [body, setBody] = useState(node?.body || "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const createNode = useQiStore((s) => s.createNode);
  const updateNodeAsync = useQiStore((s) => s.updateNodeAsync);
  const deleteNodeAsync = useQiStore((s) => s.deleteNodeAsync);

  // Update form when node changes
  useEffect(() => {
    if (node) {
      setTitle(node.title || "");
      setBody(node.body || "");
    }
  }, [node]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (isEditMode && node) {
        // Update existing node
        const updated = await updateNodeAsync(node.qid, {
          title: title.trim() || "(Untitled)",
          body: body.trim(),
        });

        if (updated) {
          if (onSuccess) {
            onSuccess(updated);
          }
        } else {
          setError("Failed to update QiNode. Please try again.");
        }
      } else {
        // Create new node
        if (!defaultRealm || !defaultOrbit || !defaultSystem) {
          setError("Missing required fields for new node.");
          setSaving(false);
          return;
        }

        const saved = await createNode({
          title: title.trim() || "(Untitled)",
          body: body.trim(),
          realm: defaultRealm,
          orbit: defaultOrbit,
          system: defaultSystem,
        });

        if (saved) {
          setTitle("");
          setBody("");
          if (onSuccess) {
            onSuccess(saved);
          }
        } else {
          setError("Failed to create QiNode. Please try again.");
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to ${isEditMode ? "update" : "create"} QiNode`;
      setError(message);
      console.error(`Error ${isEditMode ? "updating" : "creating"} QiNode:`, err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!node || !isEditMode) return;
    
    if (!confirm(`Are you sure you want to delete "${node.title}"? This action cannot be undone.`)) {
      return;
    }

    setError(null);
    setDeleting(true);

    try {
      const success = await deleteNodeAsync(node.qid);
      if (success && onDelete) {
        onDelete();
      } else {
        setError("Failed to delete QiNode. Please try again.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete QiNode";
      setError(message);
      console.error("Error deleting QiNode:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {error && (
        <div
          className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400"
          role="alert"
        >
          {error}
        </div>
      )}
      
      <input
        type="text"
        placeholder="Title (What is this QiNode about?)"
        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={saving}
        aria-label="QiNode title"
        required
      />
      
      <textarea
        placeholder="Body (free-form Markdown)..."
        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm h-24 resize-y focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed font-mono"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={saving}
        aria-label="QiNode body content"
      />
      
      <div className="flex items-center justify-between">
        {isEditMode && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || saving}
            className="inline-flex items-center rounded-lg bg-red-500/20 border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        )}
        <div className="flex gap-2 ml-auto">
          <button
            type="submit"
            disabled={saving || deleting}
            className="inline-flex items-center rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? "Update QiNode" : "Save QiNode")}
          </button>
        </div>
      </div>
    </form>
  );
}

