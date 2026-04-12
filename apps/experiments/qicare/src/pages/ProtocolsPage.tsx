/* ─── ProtocolsPage — Care protocol management ─── */
import React from 'react';
import { useCareStore } from '../store/careStore';
import { useTimerStore } from '../store/timerStore';
import { createCustomTimer } from '../engine/timerEngine';

export const ProtocolsPage: React.FC = () => {
  const { protocols, toggleProtocol, patient } = useCareStore();
  const { addTimer } = useTimerStore();

  const activateWithTimers = (protocolId: string) => {
    const protocol = protocols.find((p) => p.id === protocolId);
    if (!protocol) return;

    toggleProtocol(protocolId);

    // If activating, create suggested timers
    if (!protocol.active) {
      protocol.suggested_timers.forEach((st) => {
        const timer = createCustomTimer(
          st.label, st.type, st.duration_seconds / 60,
          patient.id, patient.household_id, 'Caregiver'
        );
        addTimer(timer);
      });
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Care Protocols</h1>
      </div>

      {protocols.map((p) => (
        <div key={p.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: p.active ? 'var(--color-green)' : 'var(--color-text)' }}>
                {p.active ? '🟢 ' : '⚪ '}{p.name}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{p.description}</div>
            </div>
            <button
              onClick={() => activateWithTimers(p.id)}
              className={`pill-btn ${p.active ? 'pill-btn-red' : 'pill-btn-green'}`}
              style={{ padding: '8px 16px', fontSize: '0.8rem', flexShrink: 0 }}
            >
              {p.active ? 'Stop' : 'Start'}
            </button>
          </div>

          {/* Monitoring Prompts */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-teal)', textTransform: 'uppercase', marginBottom: 4 }}>
              📋 Monitor
            </div>
            {p.monitoring_prompts.map((m, i) => (
              <div key={i} style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', padding: '2px 0' }}>• {m}</div>
            ))}
          </div>

          {/* Caution Notes */}
          {p.caution_notes.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-amber)', textTransform: 'uppercase', marginBottom: 4 }}>
                ⚠️ Cautions
              </div>
              {p.caution_notes.map((n, i) => (
                <div key={i} style={{ fontSize: '0.8rem', color: 'var(--color-amber)', padding: '2px 0', opacity: 0.85 }}>{n}</div>
              ))}
            </div>
          )}

          {/* Suggested Timers */}
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: 4 }}>
              ⏱️ Timers
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {p.suggested_timers.map((t, i) => (
                <span key={i} style={{
                  padding: '4px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600,
                  background: 'var(--color-accent-soft)', color: 'var(--color-accent)',
                }}>
                  {t.label} ({Math.round(t.duration_seconds / 60)}m)
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
