import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import DashboardPage from '../pages/DashboardPage';
import FactsPage from '../pages/FactsPage';
import EvidencePage from '../pages/EvidencePage';
import TasksPage from '../pages/TasksPage';
import TimelinePage from '../pages/TimelinePage';
import WitnessesPage from '../pages/WitnessesPage';
import DocumentsPage from '../pages/DocumentsPage';
import TrialPrepPage from '../pages/TrialPrepPage';
import AgentPage from '../pages/AgentPage';
import SearchPage from '../pages/SearchPage';
import MatterPicker from './MatterPicker';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Overview', icon: '⚖️' },
  { id: 'facts', label: 'Facts', icon: '📋' },
  { id: 'evidence', label: 'Evidence', icon: '🗂️' },
  { id: 'tasks', label: 'Tasks', icon: '✅' },
  { id: 'timeline', label: 'Timeline', icon: '📅' },
  { id: 'witnesses', label: 'Witnesses', icon: '👥' },
  { id: 'documents', label: 'Documents', icon: '📄' },
  { id: 'trial_prep', label: 'Trial Prep', icon: '🏛️' },
  { id: 'agent', label: 'Case Agent', icon: '🤖' },
  { id: 'search', label: 'Search', icon: '🔍' },
];

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [matter, setMatter] = useState<any>(null);
  const [showPicker, setShowPicker] = useState(true);

  const handleSelectMatter = (m: any) => {
    setMatter(m);
    setShowPicker(false);
    setActivePage('dashboard');
  };

  const renderPage = () => {
    if (!matter) return null;
    const mid = matter.id;
    const props = { matterId: mid, matter };
    switch (activePage) {
      case 'dashboard': return <DashboardPage {...props} />;
      case 'facts': return <FactsPage {...props} />;
      case 'evidence': return <EvidencePage {...props} />;
      case 'tasks': return <TasksPage {...props} />;
      case 'timeline': return <TimelinePage {...props} />;
      case 'witnesses': return <WitnessesPage {...props} />;
      case 'documents': return <DocumentsPage {...props} />;
      case 'trial_prep': return <TrialPrepPage {...props} />;
      case 'agent': return <AgentPage {...props} />;
      case 'search': return <SearchPage {...props} />;
      default: return <DashboardPage {...props} />;
    }
  };

  if (showPicker) {
    return <MatterPicker onSelect={handleSelectMatter} />;
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">⚖️</div>
          <div className="sidebar-logo-text">USBLegalAid</div>
        </div>

        <div className="sidebar-case">
          {matter?.title || 'No case open'}
        </div>

        <div className="sidebar-sep" />

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-btn ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-status">
            <span className="status-dot" style={{ color: matter ? 'var(--green)' : 'var(--red)' }}>●</span>
            <span className="status-text">{matter ? 'Workspace open' : 'No workspace'}</span>
          </div>
          <button className="sidebar-open-btn" onClick={() => setShowPicker(true)}>
            Open / New Case
          </button>
          <button className="signout-btn" onClick={signOut}>
            Sign Out ({user?.email?.split('@')[0]})
          </button>
        </div>
      </aside>

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}
