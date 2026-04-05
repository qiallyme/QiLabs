// apps/qilauncher/components/views/WorkersView.tsx
import { useEffect, useState } from 'react';
import { WorkersStats, WorkerInfo } from '../../types';
import { StatCard } from '../dashboard/StatCard';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { QiLauncherClient } from '../../api/client';

interface WorkersViewProps {
  workers: WorkersStats;
  loading: boolean;
  onRefresh: () => void;
}

function formatTimeAgo(isoString: string | null): string {
  if (!isoString) return 'Never';
  
  try {
    const then = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - then.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    
    if (diffSeconds < 60) {
      return `${diffSeconds} second${diffSeconds !== 1 ? 's' : ''} ago`;
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
  } catch {
    return 'Invalid date';
  }
}

function isStale(isoString: string | null): boolean {
  if (!isoString) return true;
  
  try {
    const then = new Date(isoString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    return diffSeconds > 60;
  } catch {
    return true;
  }
}

function getStatusColor(status: string): string {
  const s = status.toLowerCase();
  if (s === 'working' || s === 'processing') {
    return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
  } else if (s === 'idle') {
    return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  } else if (s === 'error') {
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  } else if (s === 'offline') {
    return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  }
  return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
}

function getStatusBadgeColor(status: string): string {
  const s = status.toLowerCase();
  if (s === 'working' || s === 'processing') {
    return 'bg-indigo-400';
  } else if (s === 'idle') {
    return 'bg-slate-500';
  } else if (s === 'error') {
    return 'bg-red-400';
  } else if (s === 'offline') {
    return 'bg-amber-400';
  }
  return 'bg-slate-500';
}

export function WorkersView({ workers: initialWorkers, loading: initialLoading, onRefresh }: WorkersViewProps) {
  const [workers, setWorkers] = useState<WorkersStats>(initialWorkers);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);

  // Poll every 5 seconds when this view is active
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        setError(null);
        const data = await QiLauncherClient.getWorkers();
        setWorkers(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch workers:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch workers');
        setLoading(false);
      }
    };

    // Initial fetch
    fetchWorkers();

    // Poll every 5 seconds
    const interval = setInterval(fetchWorkers, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading && workers.workers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading workers data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Worker Status</h2>
        <button
          onClick={async () => {
            setLoading(true);
            await onRefresh();
            try {
              const data = await QiLauncherClient.getWorkers();
              setWorkers(data);
            } catch (err) {
              console.error('Failed to refresh workers:', err);
            }
            setLoading(false);
          }}
          className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-lg transition-colors flex items-center gap-2 border border-white/10"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Active Workers" accentColor="purple">
          <div className="text-4xl font-bold text-purple-400">
            {workers.activeNodes}/{workers.totalNodes}
          </div>
          <div className="text-sm text-slate-400 mt-2">Currently operational</div>
        </StatCard>

        <StatCard title="Inactive Workers" accentColor="cyan">
          <div className="text-4xl font-bold text-cyan-400">
            {workers.totalNodes - workers.activeNodes}
          </div>
          <div className="text-sm text-slate-400 mt-2">Offline or error</div>
        </StatCard>
      </div>

      <StatCard title="Worker Details" accentColor="purple">
        <div className="space-y-3">
          {workers.workers.length === 0 ? (
            <div className="text-slate-400 text-center py-8">
              No local workers registered yet. Start the local ingest worker to begin processing the queue.
            </div>
          ) : (
            workers.workers.map((worker: WorkerInfo) => {
              const stale = isStale(worker.last_heartbeat);
              const currentTask = worker.meta?.current_task;
              
              return (
                <div
                  key={worker.worker_id}
                  className="p-4 bg-slate-800/30 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-3 h-3 rounded-full ${getStatusBadgeColor(worker.status)}`}></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{worker.worker_name}</span>
                          {stale && (
                            <span className="flex items-center gap-1 text-amber-400 text-xs">
                              <AlertTriangle className="w-3 h-3" />
                              Stale
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-1">
                          {worker.worker_id}
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded text-xs font-medium border ${getStatusColor(worker.status)}`}>
                      {worker.status}
                    </span>
                  </div>
                  
                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Last heartbeat:</span>
                      <span className={stale ? 'text-amber-400' : 'text-slate-300'}>
                        {formatTimeAgo(worker.last_heartbeat)}
                      </span>
                    </div>
                    {currentTask && (
                      <div className="flex items-start justify-between text-slate-300 pt-1">
                        <span className="text-slate-400">Current task:</span>
                        <span className="text-right max-w-md truncate ml-4">{currentTask}</span>
                      </div>
                    )}
                    {worker.meta?.queue_depth !== undefined && (
                      <div className="flex items-center justify-between text-slate-400 pt-1">
                        <span>Queue depth:</span>
                        <span className="text-slate-300">{worker.meta.queue_depth}</span>
                      </div>
                    )}
                    {worker.meta?.load_percent !== undefined && (
                      <div className="flex items-center justify-between text-slate-400 pt-1">
                        <span>Load:</span>
                        <span className="text-slate-300">{worker.meta.load_percent}%</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </StatCard>
    </div>
  );
}
