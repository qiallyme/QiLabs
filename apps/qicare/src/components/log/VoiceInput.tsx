/* ─── VoiceInput / VoiceFab — Floating voice button + modal ─── */
import React, { useState, useCallback } from 'react';
import { useVoice } from '../../hooks/useVoice';
import { useCareStore } from '../../store/careStore';
import { useTimerStore } from '../../store/timerStore';
import { evaluateSafety } from '../../engine/safetyEngine';
import { createTimerFromEvent, createCustomTimer } from '../../engine/timerEngine';
import { getCommandDescription } from '../../engine/voiceParser';
import { MEDICATIONS } from '../../data/medications';
import type { CareEvent } from '../../types';
import { Modal } from '../shared/Modal';

export const VoiceFab: React.FC = () => {
  const { isListening, isThinking, isSupported, transcript, lastCommand, toggleListening, clearCommand } = useVoice();
  const { addEvent, addWarning, patient, events, warnings } = useCareStore();
  const { addTimer } = useTimerStore();
  const [showModal, setShowModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');

  const executeCommand = useCallback(() => {
    if (!lastCommand?.parsed) return;
    const action = lastCommand.parsed;

    if (action.type === 'log_medication' && action.medication) {
      const medKey = action.medication;
      const med = MEDICATIONS[medKey];
      if (!med) {
        setConfirmMessage(`Unknown medication: ${medKey}`);
        return;
      }

      const event: CareEvent = {
        id: `evt_${Date.now()}`,
        patient_id: patient.id,
        household_id: patient.household_id,
        type: 'medication',
        category: med.category,
        label: `${med.name} ${med.dose}`,
        details: { medication_key: medKey, quantity: action.quantity || 1 },
        dose: med.dose,
        route: med.route,
        input_method: 'voice',
        created_by: 'Caregiver',
        created_at: new Date().toISOString(),
        synced: false,
      };

      addEvent(event);

      // Safety check
      const newWarnings = evaluateSafety(event, events, patient, warnings);
      newWarnings.forEach(addWarning);

      // Auto-timer
      const timer = createTimerFromEvent(event);
      if (timer) addTimer(timer);

      setConfirmMessage(`✓ Logged: ${med.name} ${med.dose}`);
    } else if (action.type === 'log_treatment_start') {
      const event: CareEvent = {
        id: `evt_${Date.now()}`,
        patient_id: patient.id,
        household_id: patient.household_id,
        type: 'treatment',
        category: 'breathing',
        label: 'Breathing treatment started',
        details: { treatment_type: 'nebulizer' },
        input_method: 'voice',
        created_by: 'Caregiver',
        created_at: new Date().toISOString(),
        synced: false,
      };
      addEvent(event);
      setConfirmMessage('✓ Breathing treatment started');
    } else if (action.type === 'log_treatment_end') {
      const event: CareEvent = {
        id: `evt_${Date.now()}`,
        patient_id: patient.id,
        household_id: patient.household_id,
        type: 'treatment',
        category: 'breathing',
        label: 'Breathing treatment completed',
        details: { treatment_type: 'nebulizer' },
        input_method: 'voice',
        created_by: 'Caregiver',
        created_at: new Date().toISOString(),
        synced: false,
      };
      addEvent(event);
      const timer = createTimerFromEvent(event);
      if (timer) addTimer(timer);
      setConfirmMessage('✓ Treatment completed — next treatment timer started');
    } else if (action.type === 'log_symptom') {
      const event: CareEvent = {
        id: `evt_${Date.now()}`,
        patient_id: patient.id,
        household_id: patient.household_id,
        type: 'symptom',
        category: action.symptom_type || 'general',
        label: `${action.symptom_type} check — level ${action.symptom_value}`,
        details: { [action.symptom_type || 'value']: action.symptom_value },
        input_method: 'voice',
        created_by: 'Caregiver',
        created_at: new Date().toISOString(),
        synced: false,
      };
      addEvent(event);
      setConfirmMessage(`✓ ${action.symptom_type}: ${action.symptom_value}`);
    } else if (action.type === 'start_timer') {
      const t = createCustomTimer(
        `${action.timer_type} timer`,
        action.timer_type === 'ice' ? 'ice' : 'custom',
        action.timer_minutes || 20,
        patient.id,
        patient.household_id,
        'Caregiver'
      );
      addTimer(t);
      setConfirmMessage(`✓ Timer started: ${action.timer_type} (${action.timer_minutes || 20} min)`);
    } else if (action.type === 'query_status') {
      const q = action.query || 'current_status';
      // Logic to check last dose or general status
      setConfirmMessage(`Checking status: ${q.replace('check_', '')}...`);
    } else {
      setConfirmMessage(getCommandDescription(action));
    }

    setTimeout(() => {
      setConfirmMessage('');
      setShowModal(false);
    }, 2000);
    clearCommand();
  }, [lastCommand, addEvent, addWarning, addTimer, patient, events, warnings, clearCommand]);

  // Auto-execute when a command is parsed
  React.useEffect(() => {
    if (lastCommand?.parsed && !isThinking && lastCommand.confidence > 0.7) {
      executeCommand();
    } else if (lastCommand?.parsed && !isThinking) {
      setShowModal(true);
    }
  }, [lastCommand, isThinking]);

  if (!isSupported) return null;

  return (
    <>
      <button
        className={`voice-fab ${isListening ? 'listening' : ''}`}
        onClick={() => {
          toggleListening();
          if (!isListening) setShowModal(true);
        }}
        aria-label={isListening ? 'Stop listening' : 'Voice command'}
      >
        {isListening ? '🔴' : '🎤'}
      </button>

      <Modal open={showModal && (isListening || isThinking || !!confirmMessage || !!transcript)} onClose={() => { setShowModal(false); }}>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          {isListening && (
            <>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎤</div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-accent)', marginBottom: 8 }}>
                Listening…
              </div>
              {transcript && (
                <div style={{
                  fontSize: '0.9rem', color: 'var(--color-text)', padding: '12px 16px',
                  background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-md)',
                  fontStyle: 'italic',
                }}>
                  "{transcript}"
                </div>
              )}
          {isThinking && !isListening && (
            <>
              <div style={{ fontSize: '3rem', marginBottom: 16 }} className="spin">🌀</div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-accent)' }}>
                Thinking…
              </div>
            </>
          )}
            </>
          )}
          {confirmMessage && (
            <div style={{
              fontSize: '1rem', fontWeight: 600,
              color: confirmMessage.startsWith('✓') ? 'var(--color-green)' : 'var(--color-amber)',
              padding: 16,
            }}>
              {confirmMessage}
            </div>
          )}
          {lastCommand && !lastCommand.parsed && !isListening && (
            <div style={{ fontSize: '0.9rem', color: 'var(--color-amber)', padding: 16 }}>
              Could not understand: "{lastCommand.raw_text}"
              <br />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>
                Try: "Log Tylenol two tablets" or "Start ice timer"
              </span>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
