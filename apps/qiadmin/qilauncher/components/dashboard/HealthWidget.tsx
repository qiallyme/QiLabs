// apps/qilauncher/components/dashboard/HealthWidget.tsx
interface HealthWidgetProps {
  uptime: number;
  cpuLoad: number;
  memoryLoad: number;
}

export function HealthWidget({ uptime, cpuLoad, memoryLoad }: HealthWidgetProps) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">Uptime</span>
          <span className="text-white font-semibold">{uptime.toFixed(2)}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${uptime}%` }}
          ></div>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">CPU</span>
          <span className="text-white font-semibold">{cpuLoad}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-500 transition-all"
            style={{ width: `${cpuLoad}%` }}
          ></div>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">Memory</span>
          <span className="text-white font-semibold">{memoryLoad}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all"
            style={{ width: `${memoryLoad}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

