import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { qiOneOrbits } from "../core/qi/orbits";
import { useQiStore } from "../core/state/useQiStore";
import { isValidRealmId, QiRealmId } from "../core/qi/realms";
import QiNodeCard from "../components/qinode/QiNodeCard";
import QiNodeEditor from "../components/qinode/QiNodeEditor";
import GlassCard from "../components/common/GlassCard";
import { QiNode } from "../core/state/useQiStore";

export default function RealmView() {
  const { realmId } = useParams<{ realmId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const activeOrbitId = searchParams.get("orbit") ?? "Self-Health";

  // Validate realm
  if (!realmId || !isValidRealmId(realmId)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-300 mb-2">
            Invalid Realm
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            The realm "{realmId}" does not exist.
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

  const orbit =
    realmId === "QiOne"
      ? qiOneOrbits.find((o) => o.id === activeOrbitId)
      : undefined;

  const loadNodes = useQiStore((s) => s.loadNodes);

  // Load nodes from Supabase on mount and when filters change
  useEffect(() => {
    if (realmId) {
      setIsLoading(true);
      loadNodes(realmId, orbit?.id).finally(() => {
        setIsLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realmId, orbit?.id]);

  // Get nodes from local store (will be updated by Supabase fetch)
  const nodes = useQiStore((s) =>
    s.getNodesByOrbit(realmId as QiRealmId, orbit?.id ?? "")
  );

  const handleNodeCreated = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    // Optionally navigate to the new node
    // navigate(`/node/${node.qid}`);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {realmId} Realm
          </h1>
          {orbit && (
            <p className="text-sm text-slate-400">
              Orbit:&nbsp;
              <span className="text-sky-300">{orbit.label}</span>
            </p>
          )}
        </div>
      </header>

      {showSuccess && (
        <div
          className="rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2 text-xs text-green-400 animate-in fade-in slide-in-from-top-2"
          role="alert"
        >
          ✓ QiNode created successfully!
        </div>
      )}

      {orbit && (
        <GlassCard className="p-4">
          <h2 className="text-sm font-medium mb-2 text-slate-300">New QiNode in this orbit</h2>
          <QiNodeEditor
            defaultRealm={realmId as QiRealmId}
            defaultOrbit={orbit.id}
            defaultSystem="Journal"
            onSuccess={handleNodeCreated}
          />
        </GlassCard>
      )}

      <section className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-slate-500">Loading QiNodes...</div>
          </div>
        ) : nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-sm font-medium text-slate-300 mb-1">
              No QiNodes yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm">
              {orbit
                ? `Create your first QiNode in ${orbit.label} above.`
                : "Select an orbit to start creating QiNodes."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {nodes.map((node) => (
              <QiNodeCard key={node.qid} node={node} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

