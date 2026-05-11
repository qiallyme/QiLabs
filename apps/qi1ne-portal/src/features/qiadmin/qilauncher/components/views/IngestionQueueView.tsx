// apps/qilauncher/components/views/IngestionQueueView.tsx
import { useState, useEffect } from 'react';
import { QueueStats, IngestionItem } from '../../types';
import { QiLauncherClient } from '../../api/client';
import { StatCard } from '../dashboard/StatCard';
import { QueueWidget } from '../dashboard/QueueWidget';
import { RefreshCw, FileText, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';

export function IngestionQueueView() {
  const [queue, setQueue] = useState<QueueStats>({
    pendingJobs: 0,
    processedCount: 0,
    failedCount: 0,
  });
  const [items, setItems] = useState<IngestionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const [queueData, itemsData] = await Promise.all([
        QiLauncherClient.getQueueStats(),
        QiLauncherClient.getIngestionQueue(50).catch(() => []),
      ]);
      setQueue(queueData);
      setItems(itemsData);
    } catch (err) {
      console.error('Failed to load queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
    // Auto-refresh every 3 seconds
    const interval = setInterval(loadQueue, 3000);
    return () => clearInterval(interval);
  }, []);

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
          onClick={loadQueue}
          className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-lg transition-colors flex items-center gap-2 border border-white/10"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Pending Jobs" accentColor="amber">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-amber-400" />
            <div>
              <div className="text-4xl font-bold text-amber-400">{queue.pendingJobs.toLocaleString()}</div>
              <div className="text-sm text-slate-400 mt-1">Waiting for processing</div>
            </div>
          </div>
        </StatCard>

        <StatCard title="Processed" accentColor="emerald">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            <div>
              <div className="text-4xl font-bold text-emerald-400">{queue.processedCount.toLocaleString()}</div>
              <div className="text-sm text-slate-400 mt-1">Successfully completed</div>
            </div>
          </div>
        </StatCard>

        <StatCard title="Failed" accentColor="rose">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-rose-400" />
            <div>
              <div className="text-4xl font-bold text-rose-400">{queue.failedCount.toLocaleString()}</div>
              <div className="text-sm text-slate-400 mt-1">Require attention</div>
            </div>
          </div>
        </StatCard>
      </div>

      <StatCard title="Queue Overview" accentColor="amber">
        <QueueWidget
          pendingJobs={queue.pendingJobs}
          processedCount={queue.processedCount}
          failedCount={queue.failedCount}
        />
      </StatCard>

      <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Queue Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Total Items</span>
            <span className="text-white font-medium">
              {(queue.pendingJobs + queue.processedCount + queue.failedCount).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Success Rate</span>
            <span className="text-emerald-400 font-medium">
              {queue.processedCount + queue.failedCount > 0
                ? ((queue.processedCount / (queue.processedCount + queue.failedCount)) * 100).toFixed(1)
                : 0}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Processing Status</span>
            <span className={`font-medium ${queue.pendingJobs > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {queue.pendingJobs > 0 ? 'Active' : 'Idle'}
            </span>
          </div>
        </div>
      </div>

      {/* Individual Queue Items */}
      <div className="bg-slate-900/50 border border-white/10 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Recent Items</h3>
          <p className="text-sm text-slate-400 mt-1">Showing up to 50 most recent items</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">File</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Realm</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    No items in queue
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const getStatusIcon = () => {
                    switch (item.status) {
                      case 'pending':
                        return <Clock className="w-4 h-4 text-amber-400" />;
                      case 'processing':
                        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
                      case 'complete':
                      case 'embedded':
                        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
                      case 'error':
                        return <XCircle className="w-4 h-4 text-rose-400" />;
                      default:
                        return <Clock className="w-4 h-4 text-slate-400" />;
                    }
                  };

                  const getStatusColor = () => {
                    switch (item.status) {
                      case 'pending':
                        return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
                      case 'processing':
                        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
                      case 'complete':
                      case 'embedded':
                        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
                      case 'error':
                        return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
                      default:
                        return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
                    }
                  };

                  return (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-sm text-white font-mono max-w-md truncate" title={item.file_path}>
                        {item.file_path}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">{item.realm || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border ${getStatusColor()}`}>
                          {getStatusIcon()}
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400">
                        {item.updated_at ? new Date(item.updated_at).toLocaleString() : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

