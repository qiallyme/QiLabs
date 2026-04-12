/* ─── CautionCard — Active safety warnings ─── */
import React from 'react';
import { useCareStore } from '../../store/careStore';

export const CautionCard: React.FC = () => {
  const { warnings, dismissWarning } = useCareStore();
  const active = warnings.filter((w) => !w.dismissed);

  if (active.length === 0) return null;

  return (
    <div className="card" style={{ borderColor: 'rgba(251, 191, 36, 0.3)' }}>
      <div className="card-title" style={{ color: 'var(--color-amber)' }}>⚠️ Active Cautions</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {active.map((w) => (
          <div key={w.id} className="warning-banner">
            <span className="icon">{w.level === 'alert' ? '🔴' : '🟡'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: 2, color: w.level === 'alert' ? 'var(--color-red)' : 'var(--color-amber)' }}>
                {w.title}
              </div>
              <div className="text">{w.message}</div>
            </div>
            <button
              onClick={() => dismissWarning(w.id)}
              style={{
                background: 'none', border: 'none', color: 'var(--color-text-dim)',
                cursor: 'pointer', fontSize: '1rem', padding: 4, flexShrink: 0,
              }}
              aria-label="Dismiss warning"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
