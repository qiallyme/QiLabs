import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function CareDashboard() {
    const { tenantId } = useParams();
    const nav = useNavigate();
    const [recording, setRecording] = useState(false);
    const [sttText, setSttText] = useState("");
    const [aiProcessing, setAiProcessing] = useState(false);
    const [vitals, setVitals] = useState({ spo2: 96, hr: 72 });
    const [meds, setMeds] = useState([
        { id: 1, name: "Lisinopril", dose: "10mg • Morning", time: "08:00 AM", status: "DUE NOW" },
        { id: 2, name: "Metformin", dose: "500mg • Morning", time: "08:00 AM", status: "DUE NOW" }
    ]);

    const [logs, setLogs] = useState([
        { id: 101, type: "Clinical", title: "Morning Vitals Check", time: "09:45 AM" }
    ]);

    // Mock Voice Recording & AI Processing
    const startRecording = () => {
        setRecording(true);
        setSttText("");
        // Simulate recording for 3 seconds
        setTimeout(() => {
            stopRecording("I just took my breathing treatment, feeling a bit better.");
        }, 3000);
    };

    const stopRecording = (text: string) => {
        setRecording(false);
        setSttText(text);
        processAI(text);
    };

    const processAI = async (text: string) => {
        setAiProcessing(true);
        // Simulate AI thinking
        setTimeout(() => {
            setAiProcessing(false);
            const lowerText = text.toLowerCase();
            let logEntry = { id: Date.now(), type: "AI Update", title: text, time: "Just Now" };
            
            if (lowerText.includes("breathing treatment") || lowerText.includes("nebulizer")) {
                logEntry = { ...logEntry, type: "Log", title: "Breathing Treatment Administered" };
            } else if (lowerText.includes("taking") && lowerText.includes("medicine")) {
                logEntry = { ...logEntry, type: "Medication", title: "Medication Dose Logged" };
            }
            
            setLogs([logEntry, ...logs]);
        }, 2000);
    };

    return (
        <div className="care-container slide-up">
            {/* Header */}
            <header className="care-header">
                <div>
                    <h1>Today</h1>
                    <div className="date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                </div>
                <div className="status-indicator">
                    <div className="label">Current Status</div>
                    <div className="value">Stable</div>
                </div>
            </header>

            {/* COPD Support */}
            <section className="care-card breath">
                <div className="card-header">
                    <span style={{ fontSize: '20px' }}>🌬️</span>
                    COPD COMMUNICATION SUPPORT
                </div>
                <div className="card-content">
                    "Pause — breathe in through nose — slow out through mouth."
                </div>
                <div className="card-subtext">
                    Keep instructions short and calm. Minimize interruptions during meds.
                </div>
            </section>

            {/* Vitals */}
            <section className="care-card">
                <div className="card-header">
                    <span style={{ fontSize: '18px' }}>📉</span>
                    Latest Vitals
                    <span style={{ marginLeft: 'auto', fontWeight: 400, color: '#64748b' }}>4h ago</span>
                </div>
                <div className="vitals-grid">
                    <div className="vital-stat">
                        <div className="value-row">
                            <span className="value">{vitals.spo2}</span>
                            <span className="unit">%</span>
                        </div>
                        <div className="label">SpO2 (Oxygen)</div>
                    </div>
                    <div className="vital-stat">
                        <div className="value-row">
                            <span className="value">{vitals.hr}</span>
                            <span className="unit">bpm</span>
                        </div>
                        <div className="label">Heart Rate</div>
                    </div>
                </div>
            </section>

            {/* Activity/Logs */}
            <section>
                <div className="section-title">Recent Activity</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                    {logs.map(log => (
                        <div key={log.id} className="care-card" style={{ padding: '12px 16px', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', fontWeight: 700 }}>{log.type.toUpperCase()}</div>
                                <div style={{ fontSize: '14px', fontWeight: 500 }}>{log.title}</div>
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{log.time}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Meds */}
            <section>
                <div className="section-title">Up Next</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    {meds.map(med => (
                        <div key={med.id} className="med-item">
                            <div className="med-info">
                                <div className="med-icon">💊</div>
                                <div className="med-details">
                                    <div className="name">{med.name}</div>
                                    <div className="dose">{med.dose}</div>
                                </div>
                            </div>
                            <div className="med-status">
                                <div className="time">{med.time}</div>
                                <div className="badge">{med.status}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Processing Overlay (Mock STT) */}
            {recording && (
                <div style={{
                    position: 'fixed', bottom: '180px', left: '20px', right: '20px',
                    background: 'var(--accent-primary)', padding: '16px', borderRadius: '16px',
                    color: 'white', textAlign: 'center', boxShadow: 'var(--shadow-lg)',
                    animation: 'pulse 1.5s infinite'
                }}>
                    Listening... Speak now.
                </div>
            )}
            
            {aiProcessing && (
                <div style={{
                    position: 'fixed', bottom: '180px', left: '20px', right: '20px',
                    background: 'var(--surface-color)', padding: '16px', borderRadius: '16px',
                    border: '1px solid var(--accent-primary)',
                    textAlign: 'center', boxShadow: 'var(--shadow-lg)'
                }}>
                    AI is analyzing: "{sttText}"
                </div>
            )}

            {/* FAB */}
            <button className="fab" onClick={startRecording}>
                {recording ? "⏹️" : "+"}
            </button>

            {/* Bottom Nav */}
            <nav className="bottom-nav">
                <a href="#" className="nav-item active">
                    <i style={{ fontStyle: 'normal' }}>🕒</i>
                    <span>Now</span>
                </a>
                <a href="#" className="nav-item">
                    <i style={{ fontStyle: 'normal' }}>💊</i>
                    <span>Meds</span>
                </a>
                <a href="#" className="nav-item">
                    <i style={{ fontStyle: 'normal' }}>✅</i>
                    <span>Tasks</span>
                </a>
                <a href="#" className="nav-item">
                    <i style={{ fontStyle: 'normal' }}>📦</i>
                    <span>Supply</span>
                </a>
                <a href="#" className="nav-item">
                    <i style={{ fontStyle: 'normal' }}>👤</i>
                    <span>Mother</span>
                </a>
            </nav>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.9; }
                    50% { transform: scale(1.02); opacity: 1; }
                    100% { transform: scale(1); opacity: 0.9; }
                }
            `}</style>
        </div>
    );
}
