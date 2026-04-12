/* ─── TimelinePage — Chronological event feed with filters ─── */
import React, { useState } from 'react';
import { EventFeed } from '../components/timeline/EventFeed';
import { FilterChips } from '../components/timeline/FilterChips';

const FILTER_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'medication', label: 'Medications' },
  { key: 'treatment', label: 'Treatments' },
  { key: 'symptom', label: 'Symptoms' },
  { key: 'vitals', label: 'Vitals' },
  { key: 'timer', label: 'Timers' },
  { key: 'note', label: 'Notes' },
];

export const TimelinePage: React.FC = () => {
  const [filter, setFilter] = useState('all');

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Timeline</h1>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>
          {new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
        </span>
      </div>

      <FilterChips options={FILTER_OPTIONS} active={filter} onChange={setFilter} />

      <div className="card">
        <EventFeed filter={filter === 'all' ? undefined : filter} />
      </div>
    </div>
  );
};
