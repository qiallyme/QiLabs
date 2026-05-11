import { useLedger } from '../hooks/useLedger';
import { Loader2, Activity } from 'lucide-react';

export default function ActivityFeed() {
  const { transactions, loading } = useLedger();

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-gray-500 p-6 justify-center">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm font-medium">Loading activity...</span>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
        Recent Activity
      </h2>
      <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
        {transactions.map(t => (
          <div key={t.id} className="flex items-start justify-between py-3.5 border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-all px-3 rounded-xl">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">{t.description}</span>
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tight mt-1">
                {new Date(t.created_at).toLocaleDateString()} · {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <span className={`text-sm font-mono font-bold ${t.entry_type === 'DEBIT' ? 'text-red-400' : 'text-blue-400'}`}>
              {t.entry_type === 'DEBIT' ? '-' : '+'}${Math.abs(t.amount).toFixed(2)}
            </span>
          </div>
        ))}
        {transactions.length === 0 && (
          <div className="text-center py-12 space-y-3">
            <Activity size={28} className="text-gray-600 mx-auto" />
            <p className="text-gray-500 text-sm font-medium">No recent activity found</p>
          </div>
        )}
      </div>
    </div>
  );
}
