/* ─── FilterChips — Scrollable filter row ─── */
import React from 'react';

interface FilterChipsProps {
  options: { key: string; label: string }[];
  active: string;
  onChange: (key: string) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({ options, active, onChange }) => (
  <div className="chip-row" style={{ marginBottom: 12 }}>
    {options.map((opt) => (
      <button
        key={opt.key}
        className={`chip ${active === opt.key ? 'active' : ''}`}
        onClick={() => onChange(opt.key)}
      >
        {opt.label}
      </button>
    ))}
  </div>
);
