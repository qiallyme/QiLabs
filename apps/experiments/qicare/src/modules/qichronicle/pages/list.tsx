import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabase";

export default function ListPage() {
    const { tenantId } = useParams();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterKind, setFilterKind] = useState("all");
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchEvents();
    }, [tenantId, filterKind]);

    const fetchEvents = async () => {
        setLoading(true);
        let query = supabase
            .schema("qichronicle")
            .from("events")
            .select("*")
            .eq("tenant_id", tenantId)
            .order("start_at", { ascending: false });

        if (filterKind !== "all") {
            query = query.eq("kind", filterKind);
        }

        const { data, error } = await query;

        if (error) console.error(error);
        else setEvents(data || []);
        setLoading(false);
    };

    const filteredEvents = events.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="list-view">
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <input
                    type="text"
                    placeholder="Search events..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}
                />
                <select
                    value={filterKind}
                    onChange={(e) => setFilterKind(e.target.value)}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}
                >
                    <option value="all">All Kinds</option>
                    <option value="meeting">Meeting</option>
                    <option value="task">Task</option>
                    <option value="milestone">Milestone</option>
                    <option value="doc">Document</option>
                </select>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                        <th style={{ padding: '12px' }}>Date</th>
                        <th style={{ padding: '12px' }}>Title</th>
                        <th style={{ padding: '12px' }}>Kind</th>
                        <th style={{ padding: '12px' }}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredEvents.map(event => (
                        <tr key={event.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '12px' }}>{new Date(event.start_at).toLocaleDateString()}</td>
                            <td style={{ padding: '12px' }}>
                                <div><strong>{event.title}</strong></div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>{event.description}</div>
                            </td>
                            <td style={{ padding: '12px' }}><span style={{ textTransform: 'capitalize' }}>{event.kind}</span></td>
                            <td style={{ padding: '12px' }}>{event.status}</td>
                        </tr>
                    ))}
                    {filteredEvents.length === 0 && (
                        <tr>
                            <td colSpan={4} style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>No matching events found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
