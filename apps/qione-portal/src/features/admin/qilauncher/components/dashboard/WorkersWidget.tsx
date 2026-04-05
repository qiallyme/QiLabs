// apps/qilauncher/components/dashboard/WorkersWidget.tsx
import { WorkerInfo } from '../../types';

interface WorkersWidgetProps {
  activeNodes: number;
  totalNodes: number;
  workers: WorkerInfo[];
}

export function WorkersWidget({ activeNodes, totalNodes, workers }: WorkersWidgetProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm">Active</span>
        <span className="text-2xl font-bold text-purple-400">
          {activeNodes}/{totalNodes}
        </span>
      </div>
      <div className="space-y-2">
        {workers.slice(0, 3).map((worker, idx) => (
          <div key={worker.worker_id || idx} className="flex items-center justify-between text-sm">
            <span className="text-slate-300 truncate">{worker.worker_name}</span>
            <span
              className={`px-2 py-1 rounded text-xs ${
                worker.status === 'processing' || worker.status === 'working'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-slate-700/50 text-slate-400'
              }`}
            >
              {worker.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

