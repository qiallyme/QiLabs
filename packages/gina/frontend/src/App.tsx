import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import './index.css';
import { Home } from './pages/Home';
import { NavigatorDashboard } from './pages/NavigatorDashboard';
import { ClientPortal } from './pages/ClientPortal';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/navigator" element={<NavigatorDashboard />} />
          <Route path="/portal-demo" element={<ClientPortal />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
};

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <nav style={{
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '12px 24px',
        display: 'flex',
        gap: '16px',
        alignItems: 'center'
      }}>
        <Link to="/" style={{ 
          textDecoration: 'none', 
          color: '#111827', 
          fontWeight: 600,
          fontSize: '1.1rem'
        }}>
          Lumara Navigator
        </Link>
        <Link 
          to="/" 
          style={{ 
            textDecoration: 'none', 
            color: location.pathname === '/' ? '#0ea5e9' : '#6b7280',
            fontSize: '0.9rem'
          }}
        >
          Home
        </Link>
        <Link 
          to="/navigator" 
          style={{ 
            textDecoration: 'none', 
            color: location.pathname === '/navigator' ? '#0ea5e9' : '#6b7280',
            fontSize: '0.9rem'
          }}
        >
          Navigator Dashboard
        </Link>
        <Link 
          to="/portal-demo" 
          style={{ 
            textDecoration: 'none', 
            color: location.pathname === '/portal-demo' ? '#0ea5e9' : '#6b7280',
            fontSize: '0.9rem'
          }}
        >
          Client Portal
        </Link>
      </nav>
      <main style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
};

export default App;
