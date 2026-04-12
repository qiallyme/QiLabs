/* ─── QuickLogPage — Fast medication, treatment, and symptom logging ─── */
import React, { useState, useCallback } from 'react';
import { useCareStore } from '../store/careStore';
import { useTimerStore } from '../store/timerStore';
import { evaluateSafety } from '../engine/safetyEngine';
import { createTimerFromEvent } from '../engine/timerEngine';
import { QUICK_LOG_ITEMS, MEDICATIONS, MED_COLOR_MAP } from '../data/medications';
import { Modal } from '../components/shared/Modal';
import type { CareEvent } from '../types';

export const QuickLogPage: React.FC = () => {
  const { patient, events, warnings, addEvent, addWarning, setSymptomCheck } = useCareStore();
  const { addTimer } = useTimerStore();
  const [feedback, setFeedback] = useState('');
  const [showPainModal, setShowPainModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 2000);
  };

  const handleLog = useCallback((key: string) => {
    const now = new Date().toISOString();

    // Special handling for pain check
    if (key === 'pain_check') {
      setShowPainModal(true);
      return;
    }

    if (key === 'note') {
      setShowNoteModal(true);
      return;
    }

    let event: CareEvent;

    if (MEDICATIONS[key]) {
      const med = MEDICATIONS[key];
      event = {
        id: `evt_${Date.now()}`, patient_id: patient.id, household_id: patient.household_id,
        type: 'medication', category: med.category, label: `${med.name} ${med.dose}`,
        details: { medication_key: key }, dose: med.dose, route: med.route,
        input_method: 'manual', created_by: 'Caregiver', created_at: now, synced: false,
      };
    } else if (key === 'breathing_start') {
      event = {
        id: `evt_${Date.now()}`, patient_id: patient.id, household_id: patient.household_id,
        type: 'treatment', category: 'breathing', label: 'Breathing treatment started',
        details: { treatment_type: 'nebulizer' },
        input_method: 'manual', created_by: 'Caregiver', created_at: now, synced: false,
      };
    } else if (key === 'breathing_end') {
      event = {
        id: `evt_${Date.now()}`, patient_id: patient.id, household_id: patient.household_id,
        type: 'treatment', category: 'breathing', label: 'Breathing treatment completed',
        details: { treatment_type: 'nebulizer' },
        input_method: 'manual', created_by: 'Caregiver', created_at: now, synced: false,
      };
    } else if (key === 'ice_on') {
      event = {
        id: `evt_${Date.now()}`, patient_id: patient.id, household_id: patient.household_id,
        type: 'timer', category: 'ice', label: 'Ice applied',
        details: { action: 'on' },
        input_method: 'manual', created_by: 'Caregiver', created_at: now, synced: false,
      };
    } else if (key === 'ice_off') {
      event = {
        id: `evt_${Date.now()}`, patient_id: patient.id, household_id: patient.household_id,
        type: 'timer', category: 'ice', label: 'Ice removed',
        details: { action: 'off' },
        input_method: 'manual', created_by: 'Caregiver', created_at: now, synced: false,
      };
    } else if (key === 'breathing_check') {
      event = {
        id: `evt_${Date.now()}`, patient_id: patient.id, household_id: patient.household_id,
        type: 'symptom', category: 'breathing', label: 'Breathing check',
        details: {},
        input_method: 'manual', created_by: 'Caregiver', created_at: now, synced: false,
      };
    } else if (key === 'blood_pressure') {
      event = {
        id: `evt_${Date.now()}`, patient_id: patient.id, household_id: patient.household_id,
        type: 'vitals', category: 'blood_pressure', label: 'Blood pressure checked',
        details: {},
        input_method: 'manual', created_by: 'Caregiver', created_at: now, synced: false,
      };
    } else if (key === 'oxygen') {
      event = {
        id: `evt_${Date.now()}`, patient_id: patient.id, household_id: patient.household_id,
        type: 'vitals', category: 'oxygen', label: 'O₂ level checked',
        details: {},
        input_method: 'manual', created_by: 'Caregiver', created_at: now, synced: false,
      };
    } else if (key === 'temperature') {
      event = {
        id: `evt_${Date.now()}`, patient_id: patient.id, household_id: patient.household_id,
        type: 'vitals', category: 'temperature', label: 'Temperature checked',
        details: {},
        input_method: 'manual', created_by: 'Caregiver', created_at: now, synced: false,
      };
    } else {
      return;
    }

    addEvent(event);

    // Safety evaluation for medication events
    if (event.type === 'medication') {
      const newWarnings = evaluateSafety(event, events, patient, warnings);
      newWarnings.forEach(addWarning);
    }

    // Auto-timer creation
    const timer = createTimerFromEvent(event);
    if (timer) addTimer(timer);

    showFeedback(`✓ ${event.label}`);
  }, [patient, events, warnings, addEvent, addWarning, addTimer]);

  const handlePainLog = (level: number) => {
    const event: CareEvent = {
      id: `evt_${Date.now()}`, patient_id: patient.id, household_id: patient.household_id,
      type: 'symptom', category: 'pain', label: `Pain check — level ${level}`,
      details: { pain_level: level },
      input_method: 'manual', created_by: 'Caregiver',
      created_at: new Date().toISOString(), synced: false,
    };
    addEvent(event);
    setSymptomCheck({ pain_level: level });
    setShowPainModal(false);
    showFeedback(`✓ Pain level ${level}`);
  };

  const handleNoteSave = () => {
    if (!noteText.trim()) return;
    const event: CareEvent = {
      id: `evt_${Date.now()}`, patient_id: patient.id, household_id: patient.household_id,
      type: 'note', category: 'general', label: noteText.trim(),
      details: {},
      input_method: 'manual', created_by: 'Caregiver',
      created_at: new Date().toISOString(), synced: false,
    };
    addEvent(event);
    setShowNoteModal(false);
    setNoteText('');
    showFeedback('✓ Note saved');
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Quick Log</h1>
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div style={{
          position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--color-green-soft)', color: 'var(--color-green)',
          padding: '10px 20px', borderRadius: 999, fontWeight: 600, fontSize: '0.875rem',
          zIndex: 300, boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          animation: 'fade-in 0.2s ease',
        }}>
          {feedback}
        </div>
      )}

      {/* Log Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {QUICK_LOG_ITEMS.map((item) => (
          <button
            key={item.key}
            className="quick-btn"
            onClick={() => handleLog(item.key)}
            style={{
              borderColor: MED_COLOR_MAP[item.key] ? `${MED_COLOR_MAP[item.key]}33` : undefined,
            }}
            aria-label={`Log ${item.label}`}
          >
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Pain Scale Modal */}
      <Modal open={showPainModal} onClose={() => setShowPainModal(false)} title="Pain Level">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
            const bg = n <= 3 ? 'var(--color-green-soft)' : n <= 6 ? 'var(--color-amber-soft)' : 'var(--color-red-soft)';
            const color = n <= 3 ? 'var(--color-green)' : n <= 6 ? 'var(--color-amber)' : 'var(--color-red)';
            return (
              <button
                key={n}
                onClick={() => handlePainLog(n)}
                style={{
                  background: bg, color, border: 'none', borderRadius: 'var(--radius-md)',
                  padding: '16px 0', fontSize: '1.3rem', fontWeight: 700, cursor: 'pointer',
                  minHeight: 56, touchAction: 'manipulation',
                }}
              >
                {n}
              </button>
            );
          })}
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: 12 }}>
          1 = minimal pain &nbsp;•&nbsp; 10 = worst possible
        </p>
      </Modal>

      {/* Note Modal */}
      <Modal open={showNoteModal} onClose={() => setShowNoteModal(false)} title="Add Note">
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="What's happening right now…"
          style={{
            width: '100%', minHeight: 120, background: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
            color: 'var(--color-text)', padding: 12, fontSize: '1rem', resize: 'vertical',
            fontFamily: 'var(--font-family)',
          }}
          autoFocus
        />
        <button
          className="pill-btn pill-btn-primary"
          style={{ width: '100%', marginTop: 12 }}
          onClick={handleNoteSave}
        >
          Save Note
        </button>
      </Modal>
    </div>
  );
};
