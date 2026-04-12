/* ─── AppShell — Root layout wrapper ─── */
import React, { useState } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { DashboardPage } from '../../pages/DashboardPage';
import { QuickLogPage } from '../../pages/QuickLogPage';
import { TimelinePage } from '../../pages/TimelinePage';
import { SafetyPage } from '../../pages/SafetyPage';
import { ProfilePage } from '../../pages/ProfilePage';
import { SettingsPage } from '../../pages/SettingsPage';
import { KBPage } from '../../pages/KBPage';
import { VoiceFab } from '../log/VoiceInput';

export const AppShell: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);

  const renderPage = () => {
    if (showSettings) return <SettingsPage onClose={() => setShowSettings(false)} />;
    switch (activeTab) {
      case 'dashboard': return <DashboardPage onNavigate={setActiveTab} />;
      case 'log': return <QuickLogPage />;
      case 'timeline': return <TimelinePage />;
      case 'safety': return <SafetyPage />;
      case 'profile': return <ProfilePage />;
      case 'kb': return <KBPage />;
      default: return <DashboardPage onNavigate={setActiveTab} />;
    }
  };

  return (
    <>
      <Header onSettingsClick={() => setShowSettings(!showSettings)} />
      {renderPage()}
      <VoiceFab />
      <BottomNav activeTab={showSettings ? '' : activeTab} onTabChange={(t) => { setShowSettings(false); setActiveTab(t); }} />
    </>
  );
};
