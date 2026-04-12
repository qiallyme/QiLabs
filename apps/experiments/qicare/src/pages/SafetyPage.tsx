/* ─── SafetyPage — Medication safety, warnings, and interaction info ─── */
import React from 'react';
import { useCareStore } from '../store/careStore';
import { DEFAULT_SAFETY_RULES } from '../data/rules';

export const SafetyPage: React.FC = () => {
  const { warnings, patient, events, dismissWarning } = useCareStore();
  const activeWarnings = warnings.filter((w) => !w.dismissed);
  const dismissedWarnings = warnings.filter((w) => w.dismissed).slice(0, 10);

  // Calculate today's acetaminophen total
  const todayEvents = events.filter((e) => {
    const d = new Date(e.created_at);
    return d.toDateString() === new Date().toDateString() && e.type === 'medication';
  });
  const apapTotal = todayEvents.reduce((sum, e) => {
    const key = (e.details?.medication_key as string) || '';
    if (key === 'tylenol') return sum + 1000;
    if (key === 'lortab') return sum + 325;
    return sum;
  }, 0);

  // Recent sedating meds
  const sedatingMeds = todayEvents.filter((e) => {
    const key = (e.details?.medication_key as string) || '';
    return ['gabapentin', 'lortab'].includes(key);
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Safety</h1>
      </div>

      {/* Active Warnings */}
      {activeWarnings.length > 0 && (
        <div className="card" style={{ borderColor: 'rgba(251, 191, 36, 0.3)' }}>
          <div className="card-title" style={{ color: 'var(--color-amber)' }}>⚠️ Active Cautions</div>
          {activeWarnings.map((w) => (
            <div key={w.id} className="warning-banner" style={{ marginBottom: 8 }}>
              <span className="icon">{w.level === 'alert' ? '🔴' : '🟡'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: w.level === 'alert' ? 'var(--color-red)' : 'var(--color-amber)' }}>
                  {w.title}
                </div>
                <div className="text">{w.message}</div>
              </div>
              <button onClick={() => dismissWarning(w.id)} style={{ background: 'none', border: 'none', color: 'var(--color-text-dim)', cursor: 'pointer', fontSize: '1rem', padding: 4 }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {activeWarnings.length === 0 && (
        <div className="card">
          <div style={{ textAlign: 'center', padding: 16 }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-green)' }}>No active cautions</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: 4 }}>
              Safety checks are running in the background
            </div>
          </div>
        </div>
      )}

      {/* Acetaminophen Tracker */}
      <div className="card">
        <div className="card-title">Acetaminophen Today</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            fontSize: '1.8rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums',
            color: apapTotal > 3000 ? 'var(--color-red)' : apapTotal > 2000 ? 'var(--color-amber)' : 'var(--color-green)',
          }}>
            {apapTotal}
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>mg of 4000 mg max</div>
            <div style={{
              height: 6, width: 160, background: 'var(--color-surface-raised)', borderRadius: 3, marginTop: 6, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: 3,
                width: `${Math.min(100, (apapTotal / 4000) * 100)}%`,
                background: apapTotal > 3000 ? 'var(--color-red)' : apapTotal > 2000 ? 'var(--color-amber)' : 'var(--color-green)',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Sedation Watch */}
      <div className="card">
        <div className="card-title">Sedation Watch</div>
        {sedatingMeds.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            No sedating medications logged today
          </p>
        ) : (
          <>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-amber)', marginBottom: 8 }}>
              {sedatingMeds.length} sedating medication{sedatingMeds.length > 1 ? 's' : ''} active today
            </p>
            {sedatingMeds.map((e) => (
              <div key={e.id} style={{
                padding: '8px 12px', background: 'var(--color-amber-soft)', borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem', marginBottom: 4,
              }}>
                {e.label} — {new Date(e.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </div>
            ))}
            {patient.conditions.includes('COPD') && (
              <div style={{
                marginTop: 8, padding: '8px 12px', background: 'var(--color-red-soft)',
                borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--color-red)',
              }}>
                🫁 COPD patient — monitor breathing and alertness closely
              </div>
            )}
          </>
        )}
      </div>

      {/* What Not To Stack */}
      <div className="card">
        <div className="card-title">What Not to Stack</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--color-amber)' }}>Tylenol + Lortab</strong> — both contain acetaminophen. Track total daily intake.
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--color-amber)' }}>Gabapentin + Lortab</strong> — increased drowsiness, fall risk, respiratory depression.
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--color-amber)' }}>Any opioid + COPD</strong> — higher respiratory depression risk. Monitor closely.
          </div>
        </div>
      </div>

      {/* Active Rules */}
      <div className="card">
        <div className="card-title">Safety Rules Active</div>
        {DEFAULT_SAFETY_RULES.filter((r) => r.enabled).map((rule) => (
          <div key={rule.id} style={{
            padding: '8px 0', borderBottom: '1px solid rgba(71, 85, 105, 0.2)',
            fontSize: '0.8rem',
          }}>
            <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{rule.name}</div>
            <div style={{ color: 'var(--color-text-dim)', marginTop: 2 }}>{rule.description}</div>
          </div>
        ))}
      </div>

      {/* Dismissed Warnings History */}
      {dismissedWarnings.length > 0 && (
        <div className="card" style={{ opacity: 0.7 }}>
          <div className="card-title">Recent Dismissed</div>
          {dismissedWarnings.map((w) => (
            <div key={w.id} style={{ padding: '6px 0', fontSize: '0.75rem', color: 'var(--color-text-dim)', borderBottom: '1px solid rgba(71,85,105,0.15)' }}>
              {w.title} — {new Date(w.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
