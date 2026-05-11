// apps/qilauncher/components/views/HealthView.tsx
import { HealthWidget } from '../dashboard/HealthWidget';
import { StatCard } from '../dashboard/StatCard';
import { HealthStats } from '../../types';

interface HealthViewProps {
  health: HealthStats;
  loading: boolean;
}

export function HealthView({ health, loading }: HealthViewProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading health data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Uptime" accentColor="emerald">
          <div className="text-3xl font-bold text-emerald-400">{health.uptimePercent.toFixed(2)}%</div>
          <div className="text-sm text-slate-400 mt-2">System availability</div>
        </StatCard>

        <StatCard title="CPU Load" accentColor="cyan">
          <div className="text-3xl font-bold text-cyan-400">{health.cpuLoadPercent}%</div>
          <div className="text-sm text-slate-400 mt-2">Current CPU usage</div>
        </StatCard>

        <StatCard title="Memory" accentColor="purple">
          <div className="text-3xl font-bold text-purple-400">{health.memoryLoadPercent}%</div>
          <div className="text-sm text-slate-400 mt-2">Memory utilization</div>
        </StatCard>
      </div>

      <StatCard title="Detailed Health Metrics" accentColor="emerald">
        <HealthWidget
          uptime={health.uptimePercent}
          cpuLoad={health.cpuLoadPercent}
          memoryLoad={health.memoryLoadPercent}
        />
      </StatCard>
    </div>
  );
}

