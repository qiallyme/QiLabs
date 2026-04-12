/* ─── useNotifications — Request and manage notification permissions ─── */
import { useEffect, useState } from 'react';
import { requestNotificationPermission } from '../engine/timerEngine';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermission(granted ? 'granted' : 'denied');
    return granted;
  };

  return { permission, requestPermission };
}
