import React, { useState, useEffect } from 'react'
import { Monitor, Folder, Hash, Info, RefreshCw, Activity } from 'lucide-react'
import { API_URLS } from '../config'

const AgentStatus = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        try {
            const res = await fetch(API_URLS.AGENT_STATUS)
            const json = await res.json()
            setData(json)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    if (loading) return <div>Checking mission control...</div>

    const agent = data || {}

    return (
        <div>
            <h2 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Agent Status Details</h2>

            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '50%' }}>
                        <Monitor size={24} color="#6366f1" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>{agent.machine_name || 'Disconnected'}</h3>
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Windows Local Client Agent</p>
                    </div>
                </div>

                <div style={{ gap: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                    <StatusRow
                        icon={<Activity size={16} />}
                        label="Cloud Connectivity"
                        value={agent.agent_status === 'online' ? 'Connected' : 'Offline'}
                        color={agent.agent_status === 'online' ? '#22c55e' : '#ef4444'}
                    />
                    <StatusRow
                        icon={<Folder size={16} />}
                        label="Watch Folder"
                        value={agent.watch_folder || 'Unknown'}
                        breakWord
                    />
                    <StatusRow
                        icon={<RefreshCw size={16} />}
                        label="Last Sync"
                        value={agent.last_seen_at ? new Date(agent.last_seen_at).toLocaleString() : '--'}
                    />
                    <StatusRow
                        icon={<Hash size={16} />}
                        label="Processed Today"
                        value={agent.processed_today || 0}
                    />
                </div>
            </div>

            {/* Technical Timeline */}
            <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', margin: '1.5rem 0 0.75rem', letterSpacing: '0.1em' }}>Technical Timeline</h3>
            <Timeline />

            <div className="card" style={{ background: '#020617', border: '1px solid #1e293b', marginTop: '1.5rem' }}>
                <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6366f1', marginBottom: '1rem' }}>Raw Manifest</h3>
                <p style={{ fontSize: '0.625rem', color: '#475569', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {JSON.stringify(agent, null, 2)}
                </p>
            </div>
        </div>
    )
}

const Timeline = () => {
    const [events, setEvents] = useState([])

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch(API_URLS.RECENT_EVENTS + '?limit=10')
                const data = await res.json()
                setEvents(data)
            } catch (e) { }
        }
        fetchEvents()
        const interval = setInterval(fetchEvents, 10000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {events.map((ev, i) => (
                <div key={i} className="card" style={{ padding: '0.75rem', margin: 0, fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 800, color: '#f8fafc' }}>{ev.event_type.toUpperCase()}</span>
                        <span style={{ color: '#475569' }}>{new Date(ev.created_at).toLocaleTimeString()}</span>
                    </div>
                    <div style={{ color: '#94a3b8' }}>
                        {ev.document_id} • {ev.machine_name}
                    </div>
                </div>
            ))}
        </div>
    )
}

const StatusRow = ({ icon, label, value, color, breakWord }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}>
            {icon}
            <span style={{ fontSize: '0.875rem' }}>{label}</span>
        </div>
        <span style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: color || '#f8fafc',
            textAlign: 'right',
            wordBreak: breakWord ? 'break-all' : 'normal',
            flex: 1
        }}>
            {value}
        </span>
    </div>
)

export default AgentStatus
