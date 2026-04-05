// apps/qilauncher/components/layout/Sidebar.tsx
import { User } from '../../types';

interface SidebarProps {
  currentPath: string;
  user: User;
  onNavigate: (path: string) => void;
}

export function Sidebar({ currentPath, user, onNavigate }: SidebarProps) {
  return (
    <nav className="w-20 flex-shrink-0 flex flex-col items-center py-6 glass border-r border-white/5 z-20 hidden md:flex">
      {/* Logo */}
      <div className="mb-10 p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
        <span className="text-3xl">🚀</span>
      </div>

      {/* Menu Items */}
      <div className="flex flex-col gap-6 w-full items-center">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNavigate('/dashboard');
          }}
          type="button"
          className={`p-3 rounded-xl transition-all border relative group cursor-pointer ${
            currentPath === '/dashboard'
              ? 'bg-white/10 text-white shadow-lg shadow-cyan-500/10 border-white/10'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
          }`}
        >
          <span className="text-xl">⊞</span>
          <span className="absolute left-16 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
            Dashboard
          </span>
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNavigate('/health');
          }}
          type="button"
          className={`p-3 rounded-xl transition-all border relative group cursor-pointer ${
            currentPath === '/health'
              ? 'bg-white/10 text-white shadow-lg shadow-cyan-500/10 border-white/10'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
          }`}
        >
          <span className="text-xl">❤</span>
          <span className="absolute left-16 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
            Health
          </span>
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNavigate('/queue');
          }}
          type="button"
          className={`p-3 rounded-xl transition-all border relative group cursor-pointer ${
            currentPath === '/queue'
              ? 'bg-white/10 text-white shadow-lg shadow-cyan-500/10 border-white/10'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
          }`}
        >
          <span className="text-xl">📚</span>
          <span className="absolute left-16 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
            Queue
          </span>
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNavigate('/workers');
          }}
          type="button"
          className={`p-3 rounded-xl transition-all border relative group cursor-pointer ${
            currentPath === '/workers'
              ? 'bg-white/10 text-white shadow-lg shadow-cyan-500/10 border-white/10'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
          }`}
        >
          <span className="text-xl">⚙</span>
          <span className="absolute left-16 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
            Workers
          </span>
        </button>
        <button
          onClick={() => onNavigate('/jobs')}
          className={`p-3 rounded-xl transition-all border relative group ${
            currentPath === '/jobs'
              ? 'bg-white/10 text-white shadow-lg shadow-cyan-500/10 border-white/10'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
          }`}
        >
          <span className="text-xl">📋</span>
          <span className="absolute left-16 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
            Jobs
          </span>
        </button>
      </div>

      {/* Bottom Actions */}
      <div className="mt-auto flex flex-col gap-6 items-center">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNavigate('/settings');
          }}
          type="button"
          className={`p-3 rounded-xl transition-all relative group cursor-pointer ${
            currentPath === '/settings'
              ? 'bg-white/10 text-white shadow-lg shadow-cyan-500/10 border border-white/10'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <span className="text-xl">⚙</span>
          <span className="absolute left-16 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
            Settings
          </span>
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px]">
          <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden">
            <img
              src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0f172a&color=fff`}
              alt={user.name}
              className="w-full h-full object-cover opacity-80"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}

