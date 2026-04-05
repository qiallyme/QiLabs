import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')
  
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh',
      position: 'relative',
      zIndex: 1
    }}>
      {/* Left Sidebar */}
      <aside style={{
        width: '240px',
        background: 'rgba(15, 15, 26, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '2rem 1.5rem',
        borderRight: '1px solid rgba(0, 212, 255, 0.2)',
        boxShadow: '0 0 30px rgba(0, 212, 255, 0.1)',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Logo/Title */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ 
            fontSize: '1.75rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #00d4ff, #a855f7, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 30px rgba(0, 212, 255, 0.5)',
            letterSpacing: '2px'
          }}>
            QiBook Writer
          </h1>
          <div style={{
            fontSize: '0.75rem',
            color: 'rgba(255, 255, 255, 0.5)',
            marginTop: '0.25rem',
            letterSpacing: '1px'
          }}>
            v1.0.0
          </div>
        </div>
        
        {/* Navigation */}
        <nav style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.5rem'
        }}>
          {[
            { path: '/', label: 'Library', icon: '📚' },
            { path: '/books', label: 'Books', icon: '📖' },
            { path: '/settings', label: 'Settings', icon: '⚙️' }
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                padding: '0.875rem 1rem',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive(item.path) ? '#00d4ff' : 'rgba(255, 255, 255, 0.7)',
                background: isActive(item.path) 
                  ? 'rgba(0, 212, 255, 0.15)' 
                  : 'transparent',
                border: isActive(item.path)
                  ? '1px solid rgba(0, 212, 255, 0.3)'
                  : '1px solid transparent',
                boxShadow: isActive(item.path)
                  ? '0 0 20px rgba(0, 212, 255, 0.3)'
                  : 'none',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.95rem',
                fontWeight: isActive(item.path) ? '600' : '400',
                textShadow: isActive(item.path) ? '0 0 10px rgba(0, 212, 255, 0.5)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'rgba(0, 212, 255, 0.05)'
                  e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.2)'
                  e.currentTarget.style.color = '#00d4ff'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'transparent'
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
                }
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        
        {/* Bottom Profile Icon */}
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00d4ff, #a855f7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateX(-50%) scale(1.1)'
          e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.8)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateX(-50%) scale(1)'
          e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.5)'
        }}
        >
          <span style={{ fontSize: '1.5rem' }}>👤</span>
        </div>
      </aside>
      
      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        padding: '2rem',
        position: 'relative',
        zIndex: 1,
        background: 'transparent'
      }}>
        {children}
      </main>
    </div>
  )
}

