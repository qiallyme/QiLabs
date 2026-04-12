import { useNavigate } from "react-router-dom";
import { qiOneOrbits } from "../core/qi/orbits";
import { useQiStore } from "../core/state/useQiStore";
import GlassCard from "../components/common/GlassCard";

export default function HomePage() {
  const navigate = useNavigate();
  const nodeCount = useQiStore((s) => Object.keys(s.nodes).length);

  const handleOrbitClick = (orbitId: string) => {
    navigate(`/realm/QiOne?orbit=${encodeURIComponent(orbitId)}`);
  };


  return (
    <div className="h-full w-full flex flex-col gap-6">
      {/* Welcome Hero Card */}
      <GlassCard className="mb-4">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Welcome to QiNote
          </h1>
          <p className="text-slate-300 max-w-2xl leading-relaxed">
            Your personal knowledge brain. Everything you create here becomes part of Gina's memory.
            Create notes, organize by realms, and let Gina help you find and connect ideas.
          </p>
          <div className="flex flex-col gap-2 mt-2 text-sm text-slate-400">
            <p>• Click a realm in the sidebar to explore your notes</p>
            <p>• Use the "+ New Note" button to create your first note</p>
            <p>• Talk to Gina (bottom-right) to create notes with AI</p>
          </div>
          {nodeCount > 0 && (
            <p className="text-xs text-indigo-400 mt-2">
              You have {nodeCount} note{nodeCount !== 1 ? "s" : ""} in your universe.
            </p>
          )}
        </div>
      </GlassCard>

      {/* Recent Notes Section */}
      {nodeCount > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-300 mb-3">Recent Notes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Recent notes will be rendered here */}
          </div>
        </div>
      )}

      {/* QiOne Orbits Grid */}
      <div>
        <h2 className="text-lg font-semibold text-slate-300 mb-3">QiOne Orbits</h2>
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {qiOneOrbits.map((orbit) => (
            <GlassCard
              key={orbit.id}
              hover
              onClick={() => handleOrbitClick(orbit.id)}
              className="p-5"
            >
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                    QiOrbit
                  </div>
                  <h3 className="text-lg font-medium text-slate-50 mb-3">
                    {orbit.label}
                  </h3>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-auto">
                  <span>Code: {orbit.code}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2 py-1 text-[10px] uppercase tracking-wide text-indigo-300">
                    QiOne
                  </span>
                </div>
              </div>
            </GlassCard>
          ))}
        </section>
      </div>
    </div>
  );
}

