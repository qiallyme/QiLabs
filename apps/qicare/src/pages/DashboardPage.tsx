/* ─── DashboardPage — The "Right Now" home screen ─── */
import React, { useCallback, useState } from 'react';
import { RightNowCard } from '../components/dashboard/RightNowCard';
import { TimerCard } from '../components/dashboard/TimerCard';
import { CautionCard } from '../components/dashboard/CautionCard';
import { NextDueCard } from '../components/dashboard/NextDueCard';
import { QuickActions } from '../components/dashboard/QuickActions';
import { EventFeed } from '../components/timeline/EventFeed';
import { SymptomModal } from '../components/log/SymptomModal';
import { useCareStore } from '../store/careStore';
import { useTimerStore } from '../store/timerStore';
import { evaluateSafety } from '../engine/safetyEngine';
import { createTimerFromEvent } from '../engine/timerEngine';
import { MEDICATIONS } from '../data/medications';
import type { CareEvent, SymptomCheck } from '../types';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { patient, events, warnings, addEvent, addWarning, setSymptomCheck } = useCareStore();
  const { addTimer } = useTimerStore();
  const [isSymptomModalOpen, setIsSymptomModalOpen] = useState(false);

  const handleQuickAction = useCallback((key: string) => {
    const now = new Date().toISOString();
    let event: CareEvent | null = null;

    if (key === 'pain_check') {
      setIsSymptomModalOpen(true);
      return;
    }

    if (MEDICATIONS[key]) {
      const med = MEDICATIONS[key];
      event = {
        id: `evt_${Date.now()}`,
        patient_id: patient.id, household_id: patient.household_id,
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
    } else if (key === 'ice_on') {
      event = {
        id: `evt_${Date.now()}`, patient_id: patient.id, household_id: patient.household_id,
        type: 'timer', category: 'ice', label: 'Ice applied',
        details: { action: 'on' },
        input_method: 'manual', created_by: 'Caregiver', created_at: now, synced: false,
      };
    }

    if (event) {
      addEvent(event);
      if (event.type === 'medication') {
        const newWarnings = evaluateSafety(event, events, patient, warnings);
        newWarnings.forEach(addWarning);
      }
      const timer = createTimerFromEvent(event);
      if (timer) addTimer(timer);
    }
  }, [patient, events, warnings, addEvent, addWarning, addTimer]);

  const handleSymptomSave = (check: SymptomCheck) => {
    const now = new Date().toISOString();
    setSymptomCheck(check);
    
    const event: CareEvent = {
      id: `evt_${Date.now()}`, patient_id: patient.id, household_id: patient.household_id,
      type: 'symptom', category: 'pain', 
      label: `Pain level ${check.pain_level}/10 logged`,
      details: { ...check },
      input_method: 'manual', created_by: 'Caregiver', created_at: now, synced: false,
    };
    
    addEvent(event);
    const timer = createTimerFromEvent(event);
    if (timer) addTimer(timer);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Right Now</h1>
      </div>

      <CautionCard />
      <RightNowCard />
      <NextDueCard />
      <TimerCard />
      <QuickActions onAction={handleQuickAction} />

      <SymptomModal 
        isOpen={isSymptomModalOpen} 
        onClose={() => setIsSymptomModalOpen(false)} 
        onSave={handleSymptomSave}
      />

      {/* Recent Activity Preview */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div className="card-title" style={{ margin: 0 }}>Recent Activity</div>
          <button
            onClick={() => onNavigate('timeline')}
            style={{
              background: 'none', border: 'none', color: 'var(--color-accent)',
              fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            View All →
          </button>
        </div>
        <EventFeed limit={5} />
      </div>

      {/* Medical Disclaimer */}
      <div style={{
        textAlign: 'center', padding: '16px 12px', fontSize: '0.65rem',
        color: 'var(--color-text-dim)', lineHeight: 1.4,
      }}>
        Mom Care supports caregiving decisions but does not replace medical advice.
        Always consult a healthcare provider for medical concerns.
      </div>
    </div>
  );
};
