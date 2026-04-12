/* ─── StatusBadge — Colored status indicator ─── */
import React from 'react';

interface StatusBadgeProps {
  variant: 'monitor' | 'caution' | 'alert';
  label: string;
  icon?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ variant, label, icon }) => (
  <span className={`status-badge status-${variant}`}>
    {icon && <span>{icon}</span>}
    {label}
  </span>
);
