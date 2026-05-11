// apps/qilauncher/components/dashboard/DeploymentsTable.tsx
import { Deployment } from '../../types';
import { RefreshCw } from 'lucide-react';

interface DeploymentsTableProps {
  deployments: Deployment[];
  onFilter: () => void;
  onRefresh: () => void;
}

const statusColors = {
  processing: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-emerald-500/20 text-emerald-400',
  failed: 'bg-rose-500/20 text-rose-400',
};

const initiatorColors = {
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
};

export function DeploymentsTable({ deployments, onFilter, onRefresh }: DeploymentsTableProps) {
  return (
    <div className="glass rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recent Deployments</h3>
        <button
          onClick={onRefresh}
          className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">ID</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Pipeline</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Initiator</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Duration</th>
            </tr>
          </thead>
          <tbody>
            {deployments.map((deployment) => (
              <tr key={deployment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3 px-4 text-sm text-white font-mono">{deployment.id}</td>
                <td className="py-3 px-4 text-sm text-slate-300">{deployment.pipeline}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full ${initiatorColors[deployment.initiatorColor]} flex items-center justify-center text-xs text-white`}
                    >
                      {deployment.initiatorInitials}
                    </div>
                    <span className="text-sm text-slate-300">{deployment.initiatorName}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs ${statusColors[deployment.status]}`}>
                    {deployment.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-400">{deployment.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

