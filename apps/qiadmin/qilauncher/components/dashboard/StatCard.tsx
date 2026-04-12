// apps/qilauncher/components/dashboard/StatCard.tsx
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  accentColor: 'emerald' | 'amber' | 'purple' | 'blue' | 'rose';
  children: ReactNode;
}

const accentColors = {
  emerald: 'border-emerald-500/20 bg-emerald-500/5',
  amber: 'border-amber-500/20 bg-amber-500/5',
  purple: 'border-purple-500/20 bg-purple-500/5',
  blue: 'border-blue-500/20 bg-blue-500/5',
  rose: 'border-rose-500/20 bg-rose-500/5',
};

export function StatCard({ title, accentColor, children }: StatCardProps) {
  return (
    <div className={`glass rounded-xl p-6 border ${accentColors[accentColor]}`}>
      <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wide">
        {title}
      </h3>
      {children}
    </div>
  );
}

