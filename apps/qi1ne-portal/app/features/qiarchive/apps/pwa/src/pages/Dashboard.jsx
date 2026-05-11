import React, { useState, useEffect } from 'react'
import { Activity, Clock, CheckCircle, Copy, AlertCircle, TrendingUp, ExternalLink } from 'lucide-react'
import { API_URLS } from '../config'

const Dashboard = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        try {
            const res = await fetch(API_URLS.SUMMARY)
            if (!res.ok) throw new Error('API unreachable')
            const json = await res.json()
            setData(json)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 15000)
        return () => clearInterval(interval)
    }, [])

    if (loading) return <div style={{ color: '#94a3b8' }}>Loading mission control...</div>
    if (!data) return <div style={{ color: '#ef4444' }}>Cloud is offline. Check Railway.</div>

    const agent = data?.agent || null
    const lastSeen = agent?.last_seen_at ? new Date(agent.last_seen_at) : null

    // Status Logic
    let statusColor = '#ef4444'
    let statusText = 'Offline'

    if (lastSeen) {
        const diffSec = (new Date() - lastSeen) / 1000
        if (diffSec < 60) {
            statusColor = '#22c55e'
            statusText = 'Streaming'
        } else if (diffSec < 300) {
            statusColor = '#f59e0b'
            statusText = 'Stale'
        }
    }

    return (
        <div>
            {/* Agent Quick Status */}
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '0.875rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Agent</h2>
                    <p style={{ fontWeight: 700 }}>{agent?.machine_name || 'No Agent Connected'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, boxShadow: `0 0 10px ${statusColor}` }}></div>
                        <span style={{ fontWeight: 800, fontSize: '0.75rem', color: statusColor, textTransform: 'uppercase' }}>{statusText}</span>
                    </div>
                    <p style={{ fontSize: '0.625rem', color: '#94a3b8' }}>
                        {agent.last_seen_at ? `Last active: ${new Date(agent.last_seen_at).toLocaleTimeString()}` : 'Never seen'}
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', margin: '1.5rem 0 0.75rem', letterSpacing: '0.1em' }}>Today</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <StatCard icon={<CheckCircle size={16} color="#22c55e" />} label="Uploaded" value={agent.processed_today || 0} />
                <StatCard icon={<Copy size={16} color="#94a3b8" />} label="Duplicates" value={agent.duplicates_today || 0} />
                <StatCard icon={<AlertCircle size={16} color="#ef4444" />} label="Reviews" value={agent.review_today || 0} />
                <StatCard icon={<Activity size={16} color="#6366f1" />} label="Queue" value={agent.queue_depth || 0} />
            </div>

            {/* Cloud Totals */}
            <div className="card" style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(129, 140, 248, 0.05) 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <TrendingUp size={18} color="#6366f1" />
                    <h2 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Cloud Ledger Total</h2>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800 }}>{data?.total_documents || 0}</div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Safe and sound in Paperless archive.</p>
            </div>

            {/* Paperless Action Button */}
            <a
                href="https://paperless-ngx-production-feda.up.railway.app"
                target="_blank"
                rel="noreferrer"
                className="card"
                style={{
                    marginTop: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--primary)',
                    borderColor: 'transparent',
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                }}
            >
                <div>
                    <h2 style={{ fontSize: '1rem', fontWeight: 800 }}>Open Paperless</h2>
                    <p style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Access full document manager</p>
                </div>
                <ExternalLink size={20} color="#fff" />
            </a>
        </div>
    )
}

const StatCard = ({ icon, label, value }) => (
    <div className="card" style={{ padding: '1rem', marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            {icon}
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>{label}</span>
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{value}</div>
    </div>
)

export default Dashboard
