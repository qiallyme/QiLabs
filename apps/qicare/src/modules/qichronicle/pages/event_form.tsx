import React, { useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function EventForm({ tenantId, onSave }: { tenantId: string, onSave: () => void }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [kind, setKind] = useState("event");
    const [startAt, setStartAt] = useState("");
    const [endAt, setEndAt] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .schema("qichronicle")
            .from("events")
            .insert([{
                tenant_id: tenantId,
                title,
                description,
                kind,
                start_at: new Date(startAt).toISOString(),
                end_at: endAt ? new Date(endAt).toISOString() : null,
            }]);

        if (error) {
            alert(error.message);
        } else {
            setTitle("");
            setDescription("");
            setStartAt("");
            setEndAt("");
            onSave();
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>Title</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }} />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }} />
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px' }}>Kind</label>
                    <select value={kind} onChange={e => setKind(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
                        <option value="event">Event</option>
                        <option value="meeting">Meeting</option>
                        <option value="task">Task</option>
                        <option value="milestone">Milestone</option>
                    </select>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px' }}>Start At</label>
                    <input required type="datetime-local" value={startAt} onChange={e => setStartAt(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }} />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px' }}>End At (Optional)</label>
                    <input type="datetime-local" value={endAt} onChange={e => setEndAt(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }} />
                </div>
            </div>
            <button type="submit" disabled={loading} style={{ padding: '12px', borderRadius: '8px', background: 'var(--accent-color)', color: 'white', border: 'none', cursor: 'pointer' }}>
                {loading ? "Saving..." : "Create Event"}
            </button>
        </form>
    );
}
