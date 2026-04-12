import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { qiRealms } from "../../core/qi/realms";
import { qiOneOrbits } from "../../core/qi/orbits";
import { QiRealmId } from "../../core/qi/realms";
import { useQiStore } from "../../core/state/useQiStore";
import GlassCard from "../common/GlassCard";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultRealm?: QiRealmId;
}

export default function NewNoteModal({ isOpen, onClose, defaultRealm }: Props) {
  const navigate = useNavigate();
  const [realm, setRealm] = useState<QiRealmId>(defaultRealm || "QiOne");
  const [orbit, setOrbit] = useState<string>("Self-Health");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const createNode = useQiStore((s) => s.createNode);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      const node = await createNode({
        realm,
        orbit,
        system: "Journal",
        title: title.trim(),
        body: body.trim(),
      });

      if (!node) {
        throw new Error("Failed to create node");
      }

      // Reset form
      setTitle("");
      setBody("");
      onClose();
      
      // Navigate to the new note
      // Note: Ingestion happens automatically in createNode (async, non-blocking)
      navigate(`/node/${encodeURIComponent(node.qid)}`);
    } catch (error) {
      console.error("Failed to create note:", error);
      alert(`Failed to create note: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const availableOrbits = realm === "QiOne" ? qiOneOrbits : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              New Note
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Realm
              </label>
              <select
                value={realm}
                onChange={(e) => setRealm(e.target.value as QiRealmId)}
                className="w-full glass-card rounded-lg px-3 py-2 text-sm text-slate-300 bg-transparent border border-slate-700/50 focus:outline-none focus:border-indigo-500/50"
              >
                {qiRealms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {realm === "QiOne" && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Orbit
                </label>
                <select
                  value={orbit}
                  onChange={(e) => setOrbit(e.target.value)}
                  className="w-full glass-card rounded-lg px-3 py-2 text-sm text-slate-300 bg-transparent border border-slate-700/50 focus:outline-none focus:border-indigo-500/50"
                >
                  {availableOrbits.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title..."
                required
                className="w-full glass-card rounded-lg px-3 py-2 text-sm text-slate-100 bg-transparent border border-slate-700/50 focus:outline-none focus:border-indigo-500/50 placeholder:text-slate-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Content
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your note here... (Markdown supported)"
                rows={8}
                className="w-full glass-card rounded-lg px-3 py-2 text-sm text-slate-100 bg-transparent border border-slate-700/50 focus:outline-none focus:border-indigo-500/50 placeholder:text-slate-500 resize-none font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || saving}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-400 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Creating..." : "Create Note"}
              </button>
            </div>
          </form>
        </div>
      </GlassCard>
    </div>
  );
}

