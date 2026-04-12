/* ─── PillButton — Rounded action button ─── */
import React from 'react';

interface PillButtonProps {
  label: string;
  variant?: 'primary' | 'ghost' | 'teal' | 'amber' | 'red' | 'green';
  icon?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export const PillButton: React.FC<PillButtonProps> = ({
  label, variant = 'ghost', icon, onClick, disabled, className = '', fullWidth
}) => (
  <button
    className={`pill-btn pill-btn-${variant} ${fullWidth ? 'w-full' : ''} ${className}`}
    onClick={onClick}
    disabled={disabled}
    type="button"
  >
    {icon && <span>{icon}</span>}
    {label}
  </button>
);
