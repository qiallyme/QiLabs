/* ─── EventFeed — Chronological timeline of care events ─── */
import React from 'react';
import { useCareStore } from '../../store/careStore';
import { MED_COLOR_MAP } from '../../data/medications';

interface EventFeedProps {
  filter?: string;
  limit?: number;
}

export const EventFeed: React.FC<EventFeedProps> = ({ filter, limit }) => {
  const { events, settings, deleteEvent } = useCareStore();

  let filtered = events;
  if (filter && filter !== 'all') {
    filtered = events.filter((e) => e.type === filter);
  }
  if (limit) {
    filtered = filtered.slice(0, limit);
  }

  const handleDelete = (id: string, label: string) => {
    if (window.confirm(`Delete entry "${label}"?`)) {
      deleteEvent(id);
    }
  };

  if (filtered.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 24, color: 'var(--color-text-dim)' }}>
        No events recorded yet
      </div>
    );
  }

  return (
    <div>
      {filtered.map((event) => {
        const dateObj = new Date(event.created_at);
        const time = dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        const color = MED_COLOR_MAP[(event.details?.medication_key as string) || event.category] || 'var(--color-accent)';

        return (
          <div key={event.id} className="timeline-item group relative">
            <span className="timeline-time">{time}</span>
            <span className="timeline-dot" style={{ background: color }} />
            <div className="timeline-content flex justify-between items-start w-full">
              <div className="flex-1">
                <div className="timeline-label">{event.label}</div>
                <div className="timeline-meta">
                  {event.dose && <span>{event.dose} • </span>}
                  {event.input_method === 'voice' && <span>🎤 Voice • </span>}
                  <span>{event.created_by}</span>
                </div>
                {event.note && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: 4, fontStyle: 'italic' }}>
                    {event.note}
                  </div>
                )}
              </div>
              
              {settings.admin_mode && (
                <button 
                  onClick={() => handleDelete(event.id, event.label)}
                  className="p-2 -mr-2 opacity-30 hover:opacity-100 text-red-400 transition-opacity"
                  title="Delete Entry"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
