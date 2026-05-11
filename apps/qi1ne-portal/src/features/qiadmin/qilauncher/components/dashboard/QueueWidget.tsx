// apps/qilauncher/components/dashboard/QueueWidget.tsx
interface QueueWidgetProps {
  pendingJobs: number;
  processedCount: number;
  failedCount: number;
}

export function QueueWidget({ pendingJobs, processedCount, failedCount }: QueueWidgetProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm">Pending</span>
        <span className="text-2xl font-bold text-amber-400">{pendingJobs.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm">Processed</span>
        <span className="text-xl font-semibold text-emerald-400">{processedCount.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm">Failed</span>
        <span className="text-lg font-semibold text-rose-400">{failedCount.toLocaleString()}</span>
      </div>
    </div>
  );
}

