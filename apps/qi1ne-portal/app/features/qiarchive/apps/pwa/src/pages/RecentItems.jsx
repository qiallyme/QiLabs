import React, { useState, useEffect } from 'react'
import { FileText, ExternalLink, Clock } from 'lucide-react'
import { API_URLS } from '../config'

const RecentItems = () => {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        try {
            const res = await fetch(API_URLS.RECENT_DOCS + '?limit=50')
            const json = await res.json()
            setItems(json)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    if (loading) return <div>Loading Cloud Ledger...</div>

    return (
        <div>
            <h2 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Recent Documents</h2>
            {items.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: '#94a3b8' }}>No documents in ledger yet.</div>
            ) : (
                items.map((doc) => (
                    <div key={doc.qdoc_id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem' }}>
                        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                            <FileText size={20} color="#6366f1" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.875rem', fontFamily: 'monospace' }}>{doc.qdoc_id}</span>
                                <span className={`badge badge-${doc.status?.toLowerCase() === 'uploaded' ? 'success' : 'warning'}`}>{doc.status}</span>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {doc.original_filename || 'Unknown Document'}
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.625rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Clock size={10} /> {new Date(doc.created_at).toLocaleString()}
                                </span>
                                {doc.paperless_url && (
                                    <a href={doc.paperless_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.625rem', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <ExternalLink size={10} /> View Source
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}

export default RecentItems
