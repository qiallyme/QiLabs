// apps/qilauncher/components/views/QueueView.tsx
import { QueueStats } from '../../types';
import { StatCard } from '../dashboard/StatCard';
import { QueueWidget } from '../dashboard/QueueWidget';
import { RefreshCw } from 'lucide-react';

interface QueueViewProps {
  queue: QueueStats;
  loading: boolean;
  onRefresh: () => void;
}

export function QueueView({ queue, loading, onRefresh }: QueueViewProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading queue data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Ingestion Queue</h2>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRefresh();
          }}
          type="button"
          className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-lg transition-colors flex items-center gap-2 border border-white/10 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Pending Jobs" accentColor="amber">
          <div className="text-4xl font-bold text-amber-400">{queue.pendingJobs.toLocaleString()}</div>
          <div className="text-sm text-slate-400 mt-2">Waiting for processing</div>
        </StatCard>

        <StatCard title="Processed" accentColor="emerald">
          <div className="text-4xl font-bold text-emerald-400">{queue.processedCount.toLocaleString()}</div>
          <div className="text-sm text-slate-400 mt-2">Successfully completed</div>
        </StatCard>

        <StatCard title="Failed" accentColor="rose">
          <div className="text-4xl font-bold text-rose-400">{queue.failedCount.toLocaleString()}</div>
          <div className="text-sm text-slate-400 mt-2">Require attention</div>
        </StatCard>
      </div>

      <StatCard title="Queue Overview" accentColor="amber">
        <QueueWidget
          pendingJobs={queue.pendingJobs}
          processedCount={queue.processedCount}
          failedCount={queue.failedCount}
        />
      </StatCard>
    </div>
  );
}

