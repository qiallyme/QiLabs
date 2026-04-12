/* ─── Timer Engine — Create timers from events and manage notifications ─── */
import type { CareTimer, CareEvent } from '../types';

export function createTimerFromEvent(event: CareEvent): CareTimer | null {
  const now = new Date();

  switch (event.category) {
    case 'ice': {
      if ((event.details?.action as string) === 'on') {
        const duration = 20 * 60; // 20 minutes
        return {
          id: `timer_${Date.now()}`,
          patient_id: event.patient_id,
          household_id: event.household_id,
          label: 'Ice off reminder',
          type: 'ice',
          duration_seconds: duration,
          started_at: now.toISOString(),
          ends_at: new Date(now.getTime() + duration * 1000).toISOString(),
          status: 'running',
          linked_event_id: event.id,
          created_by: event.created_by,
        };
      }
      return null;
    }

    case 'prn': {
      const medKey = (event.details?.medication_key as string) || '';
      if (['tylenol', 'ibuprofen', 'gabapentin', 'lortab'].includes(medKey)) {
        const duration = 30 * 60; // 30 minute reassessment
        return {
          id: `timer_${Date.now()}`,
          patient_id: event.patient_id,
          household_id: event.household_id,
          label: `Pain reassessment (after ${event.label})`,
          type: 'reassessment',
          duration_seconds: duration,
          started_at: now.toISOString(),
          ends_at: new Date(now.getTime() + duration * 1000).toISOString(),
          status: 'running',
          linked_event_id: event.id,
          created_by: event.created_by,
        };
      }
      return null;
    }

    case 'breathing': {
      if (event.label.toLowerCase().includes('completed') || event.label.toLowerCase().includes('finished')) {
        const duration = 4 * 60 * 60; // 4 hours
        return {
          id: `timer_${Date.now()}`,
          patient_id: event.patient_id,
          household_id: event.household_id,
          label: 'Next breathing treatment',
          type: 'breathing',
          duration_seconds: duration,
          started_at: now.toISOString(),
          ends_at: new Date(now.getTime() + duration * 1000).toISOString(),
          status: 'running',
          linked_event_id: event.id,
          created_by: event.created_by,
        };
      }
      return null;
    }

    default:
      return null;
  }
}

export function createCustomTimer(
  label: string,
  type: CareTimer['type'],
  durationMinutes: number,
  patientId: string,
  householdId: string,
  createdBy: string
): CareTimer {
  const now = new Date();
  const duration = durationMinutes * 60;
  return {
    id: `timer_${Date.now()}`,
    patient_id: patientId,
    household_id: householdId,
    label,
    type,
    duration_seconds: duration,
    started_at: now.toISOString(),
    ends_at: new Date(now.getTime() + duration * 1000).toISOString(),
    status: 'running',
    created_by: createdBy,
  };
}

export function getTimerRemaining(timer: CareTimer): number {
  const end = new Date(timer.ends_at).getTime();
  const remaining = Math.max(0, end - Date.now());
  return Math.ceil(remaining / 1000);
}

export function formatTime(seconds: number): string {
  if (seconds <= 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return Promise.resolve(false);
  if (Notification.permission === 'granted') return Promise.resolve(true);
  if (Notification.permission === 'denied') return Promise.resolve(false);
  return Notification.requestPermission().then((p) => p === 'granted');
}

export function sendTimerNotification(timer: CareTimer) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    new Notification('Mom Care — Timer Complete', {
      body: timer.label,
      icon: '/icons/icon-192.png',
      tag: timer.id,
      requireInteraction: true,
    });
  } catch {
    // iOS Safari doesn't support Notification constructor in PWA — silent fallback
  }
}
