/* ─── TimerCard — Active timer display with countdown ─── */
import React from 'react';
import { useTimers } from '../../hooks/useTimers';
import { formatTime } from '../../engine/timerEngine';

export const TimerCard: React.FC = () => {
  const { displays, handleComplete, handleSnooze, handleDismiss } = useTimers();

  if (displays.length === 0) return null;

  return (
    <div className="card">
      <div className="card-title">Active Timers</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {displays.map(({ timer, remaining, progress, isExpired }) => {
          const color = isExpired ? 'var(--color-red)'
            : timer.type === 'ice' ? 'var(--color-teal)'
            : timer.type === 'breathing' ? 'var(--color-green)'
            : 'var(--color-accent)';

          return (
            <div
              key={timer.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: 12,
                borderRadius: 'var(--radius-md)',
                background: isExpired ? 'var(--color-red-soft)' : 'var(--color-surface-raised)',
                border: isExpired ? '1px solid rgba(248,113,113,0.3)' : 'none',
              }}
            >
              {/* Circular progress */}
              <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
                <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="28" cy="28" r="24" fill="none" stroke="var(--color-surface)" strokeWidth="4" />
                  <circle
                    cx="28" cy="28" r="24" fill="none" stroke={color} strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 24}`}
                    strokeDashoffset={`${2 * Math.PI * 24 * (1 - progress)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                </svg>
                <div
                  style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: isExpired ? '0.7rem' : '0.75rem',
                    fontWeight: 700, color,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {isExpired ? 'DONE' : formatTime(remaining)}
                </div>
              </div>

              {/* Label */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>
                  {timer.label}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', marginTop: 2 }}>
                  {timer.type.charAt(0).toUpperCase() + timer.type.slice(1)}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6 }}>
                {isExpired ? (
                  <button
                    className="pill-btn pill-btn-green"
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    onClick={() => handleDismiss(timer.id)}
                  >
                    ✓ Done
                  </button>
                ) : (
                  <>
                    <button
                      className="pill-btn pill-btn-amber"
                      style={{ padding: '6px 10px', fontSize: '0.7rem' }}
                      onClick={() => handleSnooze(timer.id, 5)}
                    >
                      +5m
                    </button>
                    <button
                      className="pill-btn pill-btn-green"
                      style={{ padding: '6px 10px', fontSize: '0.7rem' }}
                      onClick={() => handleComplete(timer.id)}
                    >
                      ✓
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
