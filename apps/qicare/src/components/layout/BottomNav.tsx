/* ─── BottomNav — Main tab navigation ─── */
import React from 'react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'dashboard', icon: '🏠', label: 'Now' },
  { id: 'log', icon: '➕', label: 'Log' },
  { id: 'timeline', icon: '📋', label: 'History' },
  { id: 'kb', icon: '📚', label: 'Learn' },
  { id: 'profile', icon: '👤', label: 'Profile' },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => (
  <nav className="bottom-nav" role="tablist" aria-label="Main navigation">
    {TABS.map((tab) => (
      <button
        key={tab.id}
        className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
        onClick={() => onTabChange(tab.id)}
        role="tab"
        aria-selected={activeTab === tab.id}
        aria-label={tab.label}
      >
        <span className="nav-icon">{tab.icon}</span>
        <span>{tab.label}</span>
      </button>
    ))}
  </nav>
);
