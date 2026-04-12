/* ─── App — Root component with theme management ─── */
import React, { useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { useCareStore } from './store/careStore';

export default function App() {
  const { settings, initializeSync } = useCareStore();

  useEffect(() => {
    initializeSync();
  }, [initializeSync]);

  // Apply theme and accessibility classes
  useEffect(() => {
    const root = document.documentElement;
    if (settings.dark_mode) {
      root.classList.remove('light');
    } else {
      root.classList.add('light');
    }

    if (settings.large_text) {
      document.body.classList.add('large-text');
    } else {
      document.body.classList.remove('large-text');
    }
  }, [settings.dark_mode, settings.large_text]);

  return <AppShell />;
}
