import { useParams, useNavigate } from "react-router-dom";
import { useQiStore } from "../core/state/useQiStore";
import { useState, useEffect } from "react";
import QiNodeEditor from "../components/qinode/QiNodeEditor";
import GlassCard from "../components/common/GlassCard";

export default function NodeView() {
  const { qid } = useParams<{ qid: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const node = useQiStore((s) => (qid ? s.getNode(qid) : undefined));
  const loadNodes = useQiStore((s) => s.loadNodes);

  // Load node if not in store - fetch by QID directly
  useEffect(() => {
    if (qid && !node) {
      // Import and use fetchQiNodeByQid for efficient single-node fetch
      import("../core/data/qiNodeRepository").then(({ fetchQiNodeByQid }) => {
        fetchQiNodeByQid(qid).then((fetchedNode) => {
          if (fetchedNode) {
            useQiStore.getState().addNode(fetchedNode);
          }
        });
      });
    }
  }, [qid, node]);

  if (!qid) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-300 mb-2">
            No QiD Provided
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Please provide a valid QiDecimal ID.
          </p>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-sky-400 hover:text-sky-300"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!node) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-300 mb-2">
            QiNode Not Found
          </h2>
          <p className="text-sm text-slate-500 mb-2">
            QiNode <span className="font-mono text-sky-400">{qid}</span> does not exist.
          </p>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-sky-400 hover:text-sky-300"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const handleEditSuccess = () => {
    setIsEditing(false);
    // Refresh the node by reloading
    if (node) {
      loadNodes(node.realm);
    }
  };

  const handleDelete = () => {
    navigate("/");
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-4 h-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Edit QiNode</h2>
          <button
            onClick={() => setIsEditing(false)}
            className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
        </div>
        <GlassCard className="p-6">
          <QiNodeEditor
            node={node}
            onSuccess={handleEditSuccess}
            onDelete={handleDelete}
          />
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full max-w-4xl mx-auto">
      <header className="border-b border-slate-800/50 pb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="text-xs text-slate-500 mb-2 font-mono">{node.qid}</div>
            <h1 className="text-2xl font-semibold tracking-tight mb-2">
              {node.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{node.realm}</span>
              <span>•</span>
              <span>{node.orbit}</span>
              <span>•</span>
              <span>{node.system}</span>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sm text-sky-300 hover:bg-sky-500/30 transition-colors"
          >
            Edit
          </button>
        </div>
        {node.tags && node.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {node.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block px-2 py-1 rounded-full bg-slate-800/60 text-xs text-slate-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {node.summary && (
        <GlassCard className="p-4">
          <p className="text-sm text-slate-300 italic">{node.summary}</p>
        </GlassCard>
      )}

      <GlassCard className="flex-1 p-6 overflow-auto">
        {node.body ? (
          <div className="prose prose-invert prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-slate-100 font-sans">
              {node.body}
            </pre>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
            No content yet. Click Edit to add content.
          </div>
        )}
      </GlassCard>
    </div>
  );
}

