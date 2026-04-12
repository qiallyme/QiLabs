/* ─── QuickActions — Fast-tap action grid on dashboard ─── */
import React from 'react';

interface QuickActionsProps {
  onAction: (key: string) => void;
}

const DASHBOARD_ACTIONS = [
  { key: 'tylenol', icon: '💊', label: 'Tylenol' },
  { key: 'gabapentin', icon: '💊', label: 'Gabapentin' },
  { key: 'lortab', icon: '💊', label: 'Lortab' },
  { key: 'breathing_start', icon: '🫁', label: 'Treatment' },
  { key: 'ice_on', icon: '🧊', label: 'Ice On' },
  { key: 'pain_check', icon: '📋', label: 'Pain Check' },
];

export const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => (
  <div className="card">
    <div className="card-title">Quick Actions</div>
    <div className="quick-grid">
      {DASHBOARD_ACTIONS.map((action) => (
        <button
          key={action.key}
          className="quick-btn"
          onClick={() => onAction(action.key)}
          aria-label={action.label}
        >
          <span className="icon">{action.icon}</span>
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  </div>
);
