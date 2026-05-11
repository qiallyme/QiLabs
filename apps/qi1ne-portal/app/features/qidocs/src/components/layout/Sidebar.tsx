import { useState, useEffect, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { qiRealms } from "../../core/qi/realms";
import { useQiStore } from "../../core/state/useQiStore";
import { qiOneOrbits } from "../../core/qi/orbits";
import NewNoteModal from "../notes/NewNoteModal";

function NewNoteButton() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full glass-card rounded-xl px-4 py-3 text-sm font-medium text-indigo-300 hover:bg-indigo-500/20 transition-colors flex items-center justify-center gap-2"
      >
        <span className="text-lg">+</span>
        New Note
      </button>
      <NewNoteModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

export default function Sidebar() {
  const [expandedRealms, setExpandedRealms] = useState<Set<string>>(new Set(["QiOne"]));
  const location = useLocation();
  const nodes = useQiStore((s) => Object.values(s.nodes));
  const loadNodes = useQiStore((s) => s.loadNodes);

  const currentRealm = location.pathname.includes("/realm/")
    ? location.pathname.split("/realm/")[1]?.split("/")[0]
    : undefined;

  // Load nodes for current realm on mount
  useEffect(() => {
    if (currentRealm) {
      loadNodes(currentRealm as any);
    }
  }, [currentRealm, loadNodes]);

  const toggleRealm = (realmId: string) => {
    setExpandedRealms((prev) => {
      const next = new Set(prev);
      if (next.has(realmId)) {
        next.delete(realmId);
      } else {
        next.add(realmId);
      }
      return next;
    });
  };

  // Memoize filtered nodes by realm and orbit for performance
  const nodesByRealm = useMemo(() => {
    const map = new Map<string, typeof nodes>();
    nodes.forEach((node) => {
      if (!map.has(node.realm)) {
        map.set(node.realm, []);
      }
      map.get(node.realm)!.push(node);
    });
    return map;
  }, [nodes]);

  const nodesByRealmOrbit = useMemo(() => {
    const map = new Map<string, typeof nodes>();
    nodes.forEach((node) => {
      const key = `${node.realm}:${node.orbit}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(node);
    });
    return map;
  }, [nodes]);

  const getNodesForRealm = (realmId: string) => nodesByRealm.get(realmId) || [];
  const getNodesForOrbit = (realmId: string, orbitId: string) => 
    nodesByRealmOrbit.get(`${realmId}:${orbitId}`) || [];

  return (
    <aside className="w-64 glass-card border-r border-slate-800/50 flex flex-col relative z-10 m-2 rounded-2xl">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
            Q
          </div>
          <div className="text-xl font-semibold tracking-tight">
            QiNote <span className="text-indigo-400">α</span>
          </div>
        </div>
      </div>

      {/* New Note Button */}
      <div className="p-4 border-b border-slate-800/50">
        <NewNoteButton />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `block rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive
                ? "bg-indigo-500/20 text-indigo-300"
                : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
            }`
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/graph"
          className={({ isActive }) =>
            `block rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive
                ? "bg-indigo-500/20 text-indigo-300"
                : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
            }`
          }
        >
          Graph View
        </NavLink>

        <NavLink
          to="/ingest"
          className={({ isActive }) =>
            `block rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive
                ? "bg-indigo-500/20 text-indigo-300"
                : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
            }`
          }
        >
          📥 Data Intake
        </NavLink>

        <div className="mt-4 mb-2 text-xs uppercase text-slate-500 px-3 font-semibold tracking-wider">
          Realms
        </div>
        {qiRealms.map((realm) => {
          const isExpanded = expandedRealms.has(realm.id);
          const realmNodes = getNodesForRealm(realm.id);
          const hasNodes = realmNodes.length > 0;

          return (
            <div key={realm.id}>
              <div className="flex items-center">
                <button
                  onClick={() => toggleRealm(realm.id)}
                  className="flex-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
                >
                  <span className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}>
                    ▶
                  </span>
                  <NavLink
                    to={`/realm/${realm.id}`}
                    className={({ isActive }) =>
                      `flex-1 ${isActive ? "text-indigo-300" : ""}`
                    }
                    onClick={(e) => e.stopPropagation()}
                  >
                    {realm.label}
                  </NavLink>
                  {hasNodes && (
                    <span className="text-xs text-slate-500 ml-auto">
                      {realmNodes.length}
                    </span>
                  )}
                </button>
              </div>
              {isExpanded && (
                <div className="ml-4 mt-1 space-y-1 border-l border-slate-800/50 pl-2">
                  {realm.id === "QiOne" ? (
                    // Show orbits for QiOne
                    qiOneOrbits.map((orbit) => {
                      const orbitNodes = getNodesForOrbit(realm.id, orbit.id);
                      return (
                        <div key={orbit.id}>
                          <NavLink
                            to={`/realm/${realm.id}?orbit=${encodeURIComponent(orbit.id)}`}
                            className={({ isActive }) =>
                              `block rounded px-2 py-1 text-xs transition-colors ${
                                isActive
                                  ? "text-indigo-300 bg-indigo-500/10"
                                  : "text-slate-500 hover:text-slate-300"
                              }`
                            }
                          >
                            {orbit.label}
                            {orbitNodes.length > 0 && (
                              <span className="ml-2 text-slate-600">
                                ({orbitNodes.length})
                              </span>
                            )}
                          </NavLink>
                        </div>
                      );
                    })
                  ) : (
                    // Show recent nodes for other realms
                    realmNodes.slice(0, 5).map((node) => (
                      <NavLink
                        key={node.qid}
                        to={`/node/${encodeURIComponent(node.qid)}`}
                        className={({ isActive }) =>
                          `block rounded px-2 py-1 text-xs transition-colors truncate ${
                            isActive
                              ? "text-indigo-300 bg-indigo-500/10"
                              : "text-slate-500 hover:text-slate-300"
                          }`
                        }
                        title={node.title}
                      >
                        {node.title || "(Untitled)"}
                      </NavLink>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

