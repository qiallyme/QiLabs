import React, { useState, useEffect } from 'react'
import { AlertCircle, FileX, Info, ExternalLink, Activity, Copy } from 'lucide-react'
import { API_URLS } from '../config'

const Issues = () => {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        try {
            const res = await fetch(API_URLS.ISSUES + '?limit=50')
            const json = await res.json()
            setItems(json)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    if (loading) return <div>Checking for issues...</div>

    return (
        <div>
            <h2 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Attention Queue</h2>
            {items.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: '#22c55e', paddingTop: '3rem', paddingBottom: '3rem' }}>
                    <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: '50%', display: 'inline-block', marginBottom: '1rem' }}>
                        <Activity size={32} color="#22c55e" />
                    </div>
                    <p style={{ fontWeight: 700 }}>No active issues.</p>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>All ingested files are in the cloud.</p>
                </div>
            ) : (
                items.map((doc) => (
                    <div key={doc.qdoc_id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem' }}>
                        <div style={{ background: doc.status?.toLowerCase() === 'duplicate' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                            {doc.status?.toLowerCase() === 'duplicate' ? <Copy size={20} color="#94a3b8" /> : <AlertCircle size={20} color="#ef4444" />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.875rem', fontFamily: 'monospace' }}>{doc.qdoc_id}</span>
                                <span className={`badge ${doc.status?.toLowerCase() === 'duplicate' ? 'badge-primary' : 'badge-error'}`}>{doc.status}</span>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: '#94a3b8', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                                {doc.original_filename}
                            </p>

                            {doc.duplicate_of_doc_id ? (
                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                                    Duplicate of: <span style={{ fontWeight: 700, color: '#f8fafc' }}>{doc.duplicate_of_doc_id}</span>
                                </div>
                            ) : (
                                <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#ef4444' }}>
                                    Reason: {doc.error_message || 'Unknown processing error'}
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}

const StatCard = ({ icon, label, value }) => (
    <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            {icon}
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>{label}</span>
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{value}</div>
    </div>
)

export default Issues
