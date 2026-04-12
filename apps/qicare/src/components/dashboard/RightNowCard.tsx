/* ─── RightNowCard — Current care status summary ─── */
import React from 'react';
import { useCareStore } from '../../store/careStore';
import { assessCareLevel } from '../../engine/decisionEngine';
import { StatusBadge } from '../shared/StatusBadge';

export const RightNowCard: React.FC = () => {
  const { patient, events, lastSymptomCheck } = useCareStore();
  const todayEvents = events.filter((e) => {
    const d = new Date(e.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const guidance = assessCareLevel(lastSymptomCheck, todayEvents, patient);

  const badgeVariant = guidance.level === 'urgent' ? 'alert'
    : guidance.level === 'call_doctor' ? 'caution'
    : guidance.level === 'treat_home' ? 'caution'
    : 'monitor';

  const badgeIcon = guidance.level === 'urgent' ? '🚨'
    : guidance.level === 'call_doctor' ? '📞'
    : guidance.level === 'treat_home' ? '🏠'
    : '✅';

  return (
    <div className="card">
      <div className="card-title">Right Now</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <StatusBadge variant={badgeVariant} label={guidance.title} icon={badgeIcon} />
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>
          {todayEvents.length} events today
        </span>
      </div>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: 8 }}>
        {guidance.message}
      </p>
      {guidance.factors.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
          {guidance.factors.map((f, i) => (
            <span
              key={i}
              style={{
                fontSize: '0.7rem',
                padding: '3px 8px',
                borderRadius: 999,
                background: 'var(--color-surface-raised)',
                color: 'var(--color-text-muted)',
              }}
            >
              {f}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
