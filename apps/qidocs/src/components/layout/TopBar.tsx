import { Link, useLocation } from "react-router-dom";

export default function TopBar() {
  const location = useLocation();
  
  // Extract current realm from path
  const realmMatch = location.pathname.match(/\/realm\/([^/]+)/);
  const currentRealm = realmMatch ? realmMatch[1] : null;

  return (
    <header className="h-16 glass-card border-b border-slate-800/50 flex items-center justify-between px-6 relative z-10 m-2 mx-6 mt-4 rounded-2xl mb-0">
      <div className="flex items-center gap-6">
        {/* Scope Selector */}
        <select 
          className="glass-card rounded-lg px-3 py-1.5 text-sm text-slate-300 bg-transparent border border-slate-700/50 focus:outline-none focus:border-indigo-500/50"
          value={currentRealm || "global"}
          readOnly
          disabled={!currentRealm}
        >
          <option value="global">Global</option>
          {currentRealm && <option value={currentRealm}>{currentRealm}</option>}
        </select>

        <Link 
          to="/graph" 
          className="text-sm text-slate-400 hover:text-indigo-400 transition-colors"
        >
          Graph
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="text-slate-400 hover:text-slate-200 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
}

