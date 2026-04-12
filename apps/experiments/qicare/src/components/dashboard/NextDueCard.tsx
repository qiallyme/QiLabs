/* ─── NextDueCard — Shows the next upcoming action ─── */
import React from 'react';
import { useTimerStore } from '../../store/timerStore';
import { getTimerRemaining, formatTime } from '../../engine/timerEngine';

export const NextDueCard: React.FC = () => {
  const timers = useTimerStore((s) => s.timers);
  const active = timers
    .filter((t) => t.status === 'running' || t.status === 'snoozed')
    .sort((a, b) => new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime());

  const next = active[0];

  if (!next) {
    return (
      <div className="card">
        <div className="card-title">Next Due</div>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          No upcoming actions. Everything is caught up. 👍
        </p>
      </div>
    );
  }

  const remaining = getTimerRemaining(next);

  return (
    <div className="card">
      <div className="card-title">Next Due</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          fontSize: '1.5rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums',
          color: remaining < 300 ? 'var(--color-amber)' : 'var(--color-accent)',
        }}>
          {formatTime(remaining)}
        </div>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>
            {next.label}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>
            {new Date(next.ends_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};
