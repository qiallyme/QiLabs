/* ─── Header — Top bar with patient name and settings ─── */
import React from 'react';
import { useCareStore } from '../../store/careStore';

interface HeaderProps {
  onSettingsClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  const patient = useCareStore((s) => s.patient);

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--glass-border)',
      }}
    >
      <div>
        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text)' }}>
          Mom Care
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          Caring for {patient.name}
        </div>
      </div>
      <button
        onClick={onSettingsClick}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '1.4rem',
          cursor: 'pointer',
          padding: 8,
          color: 'var(--color-text-muted)',
        }}
        aria-label="Settings"
      >
        ⚙️
      </button>
    </header>
  );
};
