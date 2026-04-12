import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabase";

export default function TimelinePage() {
    const { tenantId } = useParams();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, [tenantId]);

    const fetchEvents = async () => {
        setLoading(true);
        // Fetch events and their links
        const { data: eventsData, error: eventsError } = await supabase
            .schema("qichronicle")
            .from("events")
            .select("*, event_links(*)")
            .eq("tenant_id", tenantId)
            .order("start_at", { ascending: false });

        if (eventsError) console.error(eventsError);
        else setEvents(eventsData || []);
        setLoading(false);
    };

    if (loading) return <div>Loading timeline...</div>;

    return (
        <div className="timeline">
            {events.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No events found. Start by creating one!
                </div>
            ) : (
                <div style={{ position: 'relative', paddingLeft: '40px', borderLeft: '2px solid var(--accent-color)' }}>
                    {events.map((event) => (
                        <div key={event.id} style={{ marginBottom: '32px', position: 'relative' }}>
                            <div style={{
                                position: 'absolute',
                                left: '-51px',
                                top: '0',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: 'var(--accent-color)',
                                border: '4px solid var(--surface-color)'
                            }} />
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                {new Date(event.start_at).toLocaleString()}
                                {event.end_at && ` - ${new Date(event.end_at).toLocaleString()}`}
                            </div>
                            <h3 style={{ margin: '0 0 8px 0' }}>{event.title}</h3>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{event.description}</div>
                            {event.tags && event.tags.length > 0 && (
                                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                    {event.tags.map((tag: string) => (
                                        <span key={tag} style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {event.event_links && event.event_links.length > 0 && (
                                <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', opacity: 0.7 }}>Links</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {event.event_links.map((link: any) => (
                                            <a key={link.id} href={link.target_id.startsWith('http') ? link.target_id : '#'} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--accent-color)', textDecoration: 'none' }}>
                                                📎 {link.label || link.link_type}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
