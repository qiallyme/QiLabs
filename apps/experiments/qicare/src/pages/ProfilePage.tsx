/* ─── ProfilePage — Patient profile and care information ─── */
import React, { useState } from 'react';
import { useCareStore } from '../store/careStore';
import { Modal } from '../components/shared/Modal';

export const ProfilePage: React.FC = () => {
  const { patient, protocols, toggleProtocol, settings } = useCareStore();
  const [showProtocols, setShowProtocols] = useState(false);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Patient Profile</h1>
      </div>

      {/* Name & Conditions */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div
            style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-teal))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', color: '#fff', fontWeight: 700, flexShrink: 0,
            }}
          >
            {patient.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text)' }}>{patient.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Age {patient.age}</div>
          </div>
        </div>

        <div className="card-title">Conditions</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {patient.conditions.map((c) => (
            <span key={c} className="chip active">{c}</span>
          ))}
        </div>

        <div className="card-title">Allergies</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {patient.allergies.map((a) => (
            <span key={a} style={{
              padding: '4px 12px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600,
              background: 'var(--color-red-soft)', color: 'var(--color-red)',
            }}>
              {a}
            </span>
          ))}
        </div>
      </div>

      {/* Baseline Medications */}
      <div className="card">
        <div className="card-title">Scheduled Medications</div>
        {patient.baseline_medications.map((med) => (
          <div key={med.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(71,85,105,0.2)' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>{med.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {med.dose} • {med.frequency}
            </div>
          </div>
        ))}
      </div>

      {/* PRN Medications */}
      <div className="card">
        <div className="card-title">As-Needed (PRN) Medications</div>
        {patient.prn_medications.map((med) => (
          <div key={med.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(71,85,105,0.2)' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>
              {med.name}
              {med.caution_tags.includes('opioid') && <span style={{ color: 'var(--color-amber)', fontSize: '0.7rem', marginLeft: 8 }}>⚠️ Opioid</span>}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {med.dose} • {med.frequency}
            </div>
            {med.notes && (
              <div style={{ fontSize: '0.7rem', color: 'var(--color-amber)', marginTop: 2 }}>{med.notes}</div>
            )}
          </div>
        ))}
      </div>

      {/* Care Protocols */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="card-title" style={{ margin: 0 }}>Care Protocols</div>
          <button
            onClick={() => setShowProtocols(true)}
            className="pill-btn pill-btn-ghost"
            style={{ padding: '6px 12px', fontSize: '0.7rem' }}
          >
            View All
          </button>
        </div>
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {protocols.map((p) => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', background: p.active ? 'var(--color-green-soft)' : 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-md)',
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: p.active ? 'var(--color-green)' : 'var(--color-text)' }}>
                  {p.name} {settings.admin_mode && <span style={{ fontSize: '0.65rem', color: 'var(--color-accent)', fontStyle: 'italic' }}>(Adjust)</span>}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>
                  {p.description}
                </div>
              </div>
              <button
                onClick={() => toggleProtocol(p.id)}
                className={`pill-btn ${p.active ? 'pill-btn-green' : 'pill-btn-ghost'}`}
                style={{ padding: '6px 12px', fontSize: '0.7rem', flexShrink: 0 }}
              >
                {p.active ? 'Active' : 'Start'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="card">
        <div className="card-title">Emergency & Care Contacts</div>
        {[...patient.emergency_contacts, ...patient.doctor_contacts].map((c, i) => (
          <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid rgba(71,85,105,0.2)' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>{c.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{c.role}</div>
            <a href={`tel:${c.phone}`} style={{ fontSize: '0.8rem', color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}>
              📞 {c.phone}
            </a>
          </div>
        ))}
        {patient.pharmacy_info && (
          <div style={{ padding: '8px 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            🏪 {patient.pharmacy_info}
          </div>
        )}
      </div>

      {/* Care Notes */}
      <div className="card">
        <div className="card-title">Care Notes</div>
        {patient.baseline_breathing && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-dim)', textTransform: 'uppercase' }}>Breathing Baseline</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{patient.baseline_breathing}</div>
          </div>
        )}
        {patient.mobility_notes && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-dim)', textTransform: 'uppercase' }}>Mobility</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{patient.mobility_notes}</div>
          </div>
        )}
        {patient.caffeine_habits && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-dim)', textTransform: 'uppercase' }}>Caffeine</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{patient.caffeine_habits}</div>
          </div>
        )}
        {patient.nicotine_info && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-dim)', textTransform: 'uppercase' }}>Nicotine</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{patient.nicotine_info}</div>
          </div>
        )}
        {patient.notes && (
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-dim)', textTransform: 'uppercase' }}>General Notes</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{patient.notes}</div>
          </div>
        )}
      </div>

      {/* Protocols Detail Modal */}
      <Modal open={showProtocols} onClose={() => setShowProtocols(false)} title="Care Protocols">
        {protocols.map((p) => (
          <div key={p.id} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8, color: p.active ? 'var(--color-green)' : 'var(--color-text)' }}>
              {p.active ? '🟢 ' : ''}{p.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>{p.description}</div>

            {p.monitoring_prompts.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-teal)', textTransform: 'uppercase' }}>Monitoring</div>
                {p.monitoring_prompts.map((m, i) => (
                  <div key={i} style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', padding: '2px 0' }}>• {m}</div>
                ))}
              </div>
            )}

            {p.caution_notes.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-amber)', textTransform: 'uppercase' }}>Cautions</div>
                {p.caution_notes.map((n, i) => (
                  <div key={i} style={{ fontSize: '0.8rem', color: 'var(--color-amber)', padding: '2px 0', opacity: 0.8 }}>⚠️ {n}</div>
                ))}
              </div>
            )}

            <button
              onClick={() => toggleProtocol(p.id)}
              className={`pill-btn ${p.active ? 'pill-btn-red' : 'pill-btn-green'}`}
              style={{ width: '100%', marginTop: 4 }}
            >
              {p.active ? 'Deactivate Protocol' : 'Activate Protocol'}
            </button>
          </div>
        ))}
      </Modal>
    </div>
  );
};
