import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabase";

export default function CalendarPage() {
    const { tenantId } = useParams();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        fetchEvents();
    }, [tenantId, currentMonth]);

    const fetchEvents = async () => {
        setLoading(true);
        // Simplified query for the current month
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString();
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString();

        const { data, error } = await supabase
            .schema("qichronicle")
            .from("events")
            .select("*")
            .eq("tenant_id", tenantId)
            .gte("start_at", startOfMonth)
            .lte("start_at", endOfMonth);

        if (error) console.error(error);
        else setEvents(data || []);
        setLoading(false);
    };

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const numDays = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);

    const days = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} style={{ height: '100px', border: '1px solid rgba(255,255,255,0.05)' }} />);
    }
    for (let d = 1; d <= numDays; d++) {
        const dateStr = new Date(year, month, d).toDateString();
        const dayEvents = events.filter(e => new Date(e.start_at).toDateString() === dateStr);

        days.push(
            <div key={d} style={{ height: '100px', border: '1px solid rgba(255,255,255,0.05)', padding: '4px', overflow: 'hidden' }}>
                <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{d}</div>
                {dayEvents.map(e => (
                    <div key={e.id} style={{
                        fontSize: '0.75rem',
                        background: 'var(--accent-color)',
                        padding: '2px 4px',
                        borderRadius: '2px',
                        marginBottom: '2px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {e.title}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="calendar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="secondary" onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}>Prev</button>
                    <button className="secondary" onClick={() => setCurrentMonth(new Date())}>Today</button>
                    <button className="secondary" onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}>Next</button>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '8px', fontWeight: 'bold' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {days}
            </div>
        </div>
    );
}
