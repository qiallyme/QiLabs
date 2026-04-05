import { useState, useEffect } from "react";
import GlassCard from "../../components/common/GlassCard";
import Spinner from "../../components/feedback/Spinner";
import { supabase } from "../../core/data/supabase";

interface QiNode {
  qid: string;
  title: string;
  body: string | null;
  realm: string;
  orbit: string;
  system: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export default function KBBrowser() {
  const [nodes, setNodes] = useState<QiNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<QiNode | null>(null);
  const [filter, setFilter] = useState<{ realm?: string; orbit?: string }>({});

  useEffect(() => {
    loadNodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadNodes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if Supabase is configured
      if (!supabase) {
        setError("Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env");
        setLoading(false);
        return;
      }

      let query = supabase
        .from("qi_nodes")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(100);

      if (filter.realm) {
        query = query.eq("realm", filter.realm);
      }
      if (filter.orbit) {
        query = query.eq("orbit", filter.orbit);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      setNodes(data || []);
    } catch (err) {
      console.error("Error loading nodes:", err);
      setError(err instanceof Error ? err.message : "Failed to load nodes");
      setNodes([]);
    } finally {
      setLoading(false);
    }
  };

  const realms = Array.from(new Set(nodes.map((n) => n.realm))).sort();
  const orbits = Array.from(
    new Set(nodes.filter((n) => !filter.realm || n.realm === filter.realm).map((n) => n.orbit))
  ).sort();

  return (
    <div className="flex flex-col gap-6">
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-indigo-300">📚 Knowledge Base</h2>
          <button
            onClick={loadNodes}
            className="px-4 py-2 text-sm font-medium text-indigo-300 hover:bg-indigo-500/20 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <select
            value={filter.realm || ""}
            onChange={(e) => setFilter({ ...filter, realm: e.target.value || undefined })}
            className="glass-card rounded-lg px-3 py-2 text-sm text-slate-200 bg-slate-900/50 border border-slate-700 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Realms</option>
            {realms.map((realm) => (
              <option key={realm} value={realm}>
                {realm}
              </option>
            ))}
          </select>

          <select
            value={filter.orbit || ""}
            onChange={(e) => setFilter({ ...filter, orbit: e.target.value || undefined })}
            className="glass-card rounded-lg px-3 py-2 text-sm text-slate-200 bg-slate-900/50 border border-slate-700 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Orbits</option>
            {orbits.map((orbit) => (
              <option key={orbit} value={orbit}>
                {orbit}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Node List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {nodes.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p>No nodes found. Sync your QiVault to load your KB.</p>
                </div>
              ) : (
                nodes.map((node) => (
                  <button
                    key={node.qid}
                    onClick={() => setSelectedNode(node)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedNode?.qid === node.qid
                        ? "bg-indigo-500/20 border-indigo-500"
                        : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-200 truncate">{node.title}</h3>
                        <div className="flex gap-2 mt-1 text-xs text-slate-400">
                          <span>{node.realm}</span>
                          <span>•</span>
                          <span>{node.orbit}</span>
                          <span>•</span>
                          <span>{node.system}</span>
                        </div>
                        {node.tags && node.tags.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {node.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 text-xs bg-slate-700/50 rounded text-slate-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Node Detail */}
            <div className="lg:sticky lg:top-4">
              {selectedNode ? (
                <GlassCard className="p-6 h-full">
                  <div className="flex flex-col gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-indigo-300 mb-2">
                        {selectedNode.title}
                      </h2>
                      <div className="flex gap-2 text-sm text-slate-400">
                        <span>{selectedNode.realm}</span>
                        <span>•</span>
                        <span>{selectedNode.orbit}</span>
                        <span>•</span>
                        <span>{selectedNode.system}</span>
                      </div>
                    </div>

                    {selectedNode.body && (
                      <div className="prose prose-invert max-w-none">
                        <div
                          className="text-slate-300 whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: selectedNode.body
                              .replace(/\n/g, "<br />")
                              .replace(/#{1,6}\s+(.+)/g, "<h3 class='text-indigo-300 font-semibold mt-4 mb-2'>$1</h3>")
                              .replace(/\*\*(.+?)\*\*/g, "<strong class='text-slate-200'>$1</strong>")
                              .replace(/\*(.+?)\*/g, "<em class='text-slate-400'>$1</em>"),
                          }}
                        />
                      </div>
                    )}

                    <div className="mt-auto pt-4 border-t border-slate-700">
                      <div className="text-xs text-slate-500">
                        <p>QID: {selectedNode.qid}</p>
                        <p>Updated: {new Date(selectedNode.updated_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ) : (
                <GlassCard className="p-6 h-full flex items-center justify-center">
                  <p className="text-slate-400">Select a node to view details</p>
                </GlassCard>
              )}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

