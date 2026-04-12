/* ─── useTimers — Real-time timer tick hook ─── */
import { useState, useEffect, useCallback } from 'react';
import { useTimerStore } from '../store/timerStore';
import { getTimerRemaining, sendTimerNotification } from '../engine/timerEngine';
import type { CareTimer } from '../types';

interface TimerDisplay {
  timer: CareTimer;
  remaining: number;
  progress: number;
  isExpired: boolean;
}

export function useTimers() {
  const { timers, completeTimer, snoozeTimer, removeTimer } = useTimerStore();
  const [displays, setDisplays] = useState<TimerDisplay[]>([]);

  useEffect(() => {
    function tick() {
      const active = timers.filter((t) => t.status === 'running' || t.status === 'snoozed');
      const ds = active.map((timer) => {
        const remaining = getTimerRemaining(timer);
        const elapsed = timer.duration_seconds - remaining;
        const progress = Math.min(1, elapsed / timer.duration_seconds);
        const isExpired = remaining <= 0;
        return { timer, remaining, progress, isExpired };
      });

      // Notify for newly expired timers
      ds.forEach((d) => {
        if (d.isExpired && d.timer.status === 'running') {
          sendTimerNotification(d.timer);
        }
      });

      setDisplays(ds);
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [timers]);

  const handleComplete = useCallback((id: string) => completeTimer(id), [completeTimer]);
  const handleSnooze = useCallback((id: string, min: number) => snoozeTimer(id, min), [snoozeTimer]);
  const handleDismiss = useCallback((id: string) => removeTimer(id), [removeTimer]);

  return { displays, handleComplete, handleSnooze, handleDismiss };
}
