// apps/qilauncher/components/dashboard/PageHeader.tsx
import { SystemStatus } from '../../types';
import { Download } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  systemStatus: SystemStatus;
  onExportLogs: () => void;
}

export function PageHeader({ title, systemStatus, onExportLogs }: PageHeaderProps) {
  const statusColors = {
    operational: 'bg-emerald-500',
    degraded: 'bg-amber-500',
    down: 'bg-rose-500',
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${statusColors[systemStatus]}`}></div>
          <span className="text-slate-400 text-sm capitalize">{systemStatus}</span>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onExportLogs();
        }}
        type="button"
        className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-lg transition-colors flex items-center gap-2 border border-white/10 cursor-pointer"
      >
        <Download className="w-4 h-4" />
        Export Logs
      </button>
    </div>
  );
}

