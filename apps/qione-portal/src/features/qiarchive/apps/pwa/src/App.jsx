import React, { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, AlertTriangle, Activity, Settings, Info } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import RecentItems from './pages/RecentItems'
import Issues from './pages/Issues'
import AgentStatus from './pages/AgentStatus'

const Navbar = () => {
  const location = useLocation()

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Home', path: '/' },
    { icon: <FileText size={20} />, label: 'Docs', path: '/recent' },
    { icon: <AlertTriangle size={20} />, label: 'Issues', path: '/issues' },
    { icon: <Activity size={20} />, label: 'Status', path: '/status' },
  ]

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '4rem',
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path
        return (
          <Link key={item.path} to={item.path} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
            color: isActive ? '#6366f1' : '#94a3b8',
            transition: 'color 0.2s',
            flex: 1
          }}>
            {item.icon}
            <span style={{ fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

const App = () => {
  return (
    <Router>
      <div className="container">
        <header style={{ padding: '1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#6366f1' }}>Qi</span>Archive
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Cloud Dashboard
            </p>
          </div>
          <Settings size={20} style={{ color: '#94a3b8' }} />
        </header>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/recent" element={<RecentItems />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="/status" element={<AgentStatus />} />
        </Routes>

        <Navbar />
      </div>
    </Router>
  )
}

export default App
