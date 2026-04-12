/* ─── Timer Store — Concurrent timer management ─── */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CareTimer } from '../types';
import { DEMO_TIMERS } from '../data/seed';

interface TimerState {
  timers: CareTimer[];
  addTimer: (timer: CareTimer) => void;
  removeTimer: (id: string) => void;
  completeTimer: (id: string) => void;
  snoozeTimer: (id: string, minutes: number) => void;
  getActiveTimers: () => CareTimer[];
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      timers: DEMO_TIMERS,

      addTimer: (timer) =>
        set((state) => ({ timers: [...state.timers, timer] })),

      removeTimer: (id) =>
        set((state) => ({ timers: state.timers.filter((t) => t.id !== id) })),

      completeTimer: (id) =>
        set((state) => ({
          timers: state.timers.map((t) =>
            t.id === id ? { ...t, status: 'completed' as const } : t
          ),
        })),

      snoozeTimer: (id, minutes) =>
        set((state) => ({
          timers: state.timers.map((t) => {
            if (t.id !== id) return t;
            const newEnd = new Date(new Date(t.ends_at).getTime() + minutes * 60000);
            return {
              ...t,
              status: 'snoozed' as const,
              ends_at: newEnd.toISOString(),
              snoozed_until: newEnd.toISOString(),
            };
          }),
        })),

      getActiveTimers: () =>
        get().timers.filter(
          (t) => t.status === 'running' || t.status === 'snoozed'
        ),
    }),
    {
      name: 'momcare-timers',
      version: 1,
    }
  )
);
