import React from "react";
import { Link, Route, Routes, useParams, useNavigate, useLocation } from "react-router-dom";
import TimelinePage from "./pages/timeline";
import CalendarPage from "./pages/calendar";
import ListPage from "./pages/list";
import EventForm from "./pages/event_form";

export default function QiChronicle() {
    const { tenantId } = useParams();
    const nav = useNavigate();
    const location = useLocation();
    const path = location.pathname;
    const [showForm, setShowForm] = React.useState(false);

    const base = `/m/qichronicle/${tenantId}`;

    return (
        <div className="container" style={{ paddingTop: '20px' }}>
            <div className="nav-bar" style={{ marginBottom: '20px', justifyContent: 'flex-start', display: 'flex', alignItems: 'center' }}>
                <h2 style={{ marginBottom: 0 }}>QiChronicle</h2>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
                    <button onClick={() => setShowForm(!showForm)}>
                        {showForm ? "Close Form" : "New Event"}
                    </button>
                    <button className="secondary" onClick={() => nav(`/t/${tenantId}/launcher`)}>Back to Launcher</button>
                </div>
            </div>

            {showForm && tenantId && (
                <div className="glass-card fade-in" style={{ padding: '24px', marginBottom: '24px' }}>
                    <h3 style={{ marginTop: 0 }}>Create New Event</h3>
                    <EventForm tenantId={tenantId} onSave={() => setShowForm(false)} />
                </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', padding: '4px', background: 'var(--surface-color)', borderRadius: '16px', width: 'fit-content' }}>
                <Link to={`${base}/timeline`} style={{ textDecoration: 'none' }}>
                    <button className={path.includes('timeline') ? '' : 'secondary'} style={{ padding: '8px 20px', borderRadius: '12px' }}>Timeline</button>
                </Link>
                <Link to={`${base}/calendar`} style={{ textDecoration: 'none' }}>
                    <button className={path.includes('calendar') ? '' : 'secondary'} style={{ padding: '8px 20px', borderRadius: '12px' }}>Calendar</button>
                </Link>
                <Link to={`${base}/list`} style={{ textDecoration: 'none' }}>
                    <button className={path.includes('list') ? '' : 'secondary'} style={{ padding: '8px 20px', borderRadius: '12px' }}>List</button>
                </Link>
            </div>

            <div className="glass-card fade-in" style={{ padding: '24px', minHeight: '600px' }}>
                <Routes>
                    <Route path=":tenantId/timeline" element={<TimelinePage />} />
                    <Route path=":tenantId/calendar" element={<CalendarPage />} />
                    <Route path=":tenantId/list" element={<ListPage />} />
                    <Route path="*" element={<TimelinePage />} />
                </Routes>
            </div>
        </div>
    );
}
