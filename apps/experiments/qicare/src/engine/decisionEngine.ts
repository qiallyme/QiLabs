/* ─── Decision Engine — Lightweight care-level classification ─── */
import type { CareEvent, SymptomCheck, CareGuidance, CareLevel, Patient } from '../types';

export function assessCareLevel(
  symptoms: SymptomCheck | null,
  recentEvents: CareEvent[],
  patient: Patient
): CareGuidance {
  const factors: string[] = [];
  let level: CareLevel = 'monitor';

  if (!symptoms) {
    return {
      level: 'monitor',
      title: 'No recent symptom data',
      message: 'Log a symptom check to get care guidance.',
      factors: [],
    };
  }

  // Pain assessment
  if (symptoms.pain_level !== undefined) {
    if (symptoms.pain_level >= 8) {
      level = escalate(level, 'call_doctor');
      factors.push(`High pain level (${symptoms.pain_level}/10)`);
    } else if (symptoms.pain_level >= 6) {
      level = escalate(level, 'treat_home');
      factors.push(`Moderate pain (${symptoms.pain_level}/10)`);
    } else if (symptoms.pain_level >= 3) {
      factors.push(`Mild pain (${symptoms.pain_level}/10)`);
    }
  }

  // Breathing
  if (symptoms.breathing_status === 'distressed') {
    level = escalate(level, 'urgent');
    factors.push('Breathing distress reported');
  } else if (symptoms.breathing_status === 'struggling') {
    level = escalate(level, 'call_doctor');
    factors.push('Struggling to breathe');
  } else if (symptoms.breathing_status === 'labored') {
    level = escalate(level, 'treat_home');
    factors.push('Labored breathing');
  }

  // Sedation tracking
  const recentSedating = recentEvents.filter((e) => {
    if (e.type !== 'medication') return false;
    const key = (e.details?.medication_key as string) || '';
    return ['gabapentin', 'lortab'].includes(key);
  });
  if (recentSedating.length >= 2) {
    level = escalate(level, 'treat_home');
    factors.push('Multiple sedating meds active — monitor alertness');
  }

  // Symptom trends
  if (symptoms.swelling === 'worse') {
    level = escalate(level, 'treat_home');
    factors.push('Swelling getting worse');
  }
  if (symptoms.dizziness) {
    factors.push('Dizziness present');
    if (recentSedating.length > 0) {
      level = escalate(level, 'call_doctor');
      factors.push('Dizziness + sedating meds = fall risk');
    }
  }
  if (symptoms.mobility === 'worse') {
    level = escalate(level, 'treat_home');
    factors.push('Mobility declining');
  }

  // COPD-specific
  if (patient.conditions.includes('COPD')) {
    if (symptoms.breathing_status && symptoms.breathing_status !== 'comfortable') {
      factors.push('COPD patient — breathing concern requires closer monitoring');
    }
  }

  return {
    level,
    title: getTitleForLevel(level),
    message: getMessageForLevel(level, factors),
    factors,
  };
}

function escalate(current: CareLevel, proposed: CareLevel): CareLevel {
  const order: CareLevel[] = ['monitor', 'treat_home', 'call_doctor', 'urgent'];
  return order.indexOf(proposed) > order.indexOf(current) ? proposed : current;
}

function getTitleForLevel(level: CareLevel): string {
  switch (level) {
    case 'monitor': return 'Continue Monitoring';
    case 'treat_home': return 'Manage at Home';
    case 'call_doctor': return 'Consider Calling Doctor';
    case 'urgent': return 'Seek Immediate Care';
  }
}

function getMessageForLevel(level: CareLevel, factors: string[]): string {
  switch (level) {
    case 'monitor':
      return 'Current status appears stable. Continue regular monitoring and log any changes.';
    case 'treat_home':
      return 'Active symptoms present but manageable at home. Follow treatment plan and reassess regularly.';
    case 'call_doctor':
      return 'Symptoms suggest a check-in with the doctor may be needed. Review recent changes and call during office hours if stable.';
    case 'urgent':
      return 'Significant concern detected. If breathing is severely compromised or patient is unresponsive, call 911.';
  }
}
