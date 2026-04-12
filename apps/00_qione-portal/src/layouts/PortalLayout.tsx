import { useState } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Archive, 
  Home, 
  Scale, 
  Settings, 
  LogOut, 
  User,
  Menu,
  X,
  FileText,
  Bot,
  Database
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { clsx } from 'clsx'

export const PortalLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, activeTenant, tenants, setActiveTenant, signOut } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'QiArchive', icon: <Archive size={20} />, path: '/archive' },
    { name: 'QiHome', icon: <Home size={20} />, path: '/home' },
    { name: 'QiDocs', icon: <FileText size={20} />, path: '/docs' },
    { name: 'QiAI', icon: <Bot size={20} />, path: '/ai' },
    { name: 'QiCase', icon: <Scale size={20} />, path: '/legal' },
    { name: 'Data', icon: <Database size={20} />, path: '/data' },
  ]

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 sticky top-0 z-40">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden mr-3 p-2 rounded-lg hover:bg-gray-100"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="flex items-center gap-2">
          <span className="font-bold text-xl tracking-tight">QiOne</span>
          <span className="hidden sm:inline text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase">v2</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex gap-1 ml-8">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.name}
                to={item.path}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Settings */}
          <Link
            to="/settings"
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <Settings size={20} />
          </Link>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="hidden md:inline text-sm font-medium text-gray-700">
                {user?.user_metadata?.full_name || 'User'}
              </span>
            </button>

            {userMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setUserMenuOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 max-h-[80vh] overflow-y-auto">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="font-medium text-gray-900">{user?.user_metadata?.full_name || 'Portal User'}</div>
                    <div className="text-sm text-gray-500 truncate">{user?.email}</div>
                  </div>

                  {/* Tenant Switcher */}
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Active Space</div>
                    <div className="space-y-1">
                      {tenants.map(tenant => (
                        <button
                          key={tenant.id}
                          onClick={() => {
                            setActiveTenant(tenant)
                            setUserMenuOpen(false)
                          }}
                          className={clsx(
                            'w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors text-left',
                            activeTenant?.id === tenant.id 
                              ? 'bg-blue-50 text-blue-700 font-medium' 
                              : 'text-gray-700 hover:bg-gray-100'
                          )}
                        >
                          <span className="truncate">{tenant.name}</span>
                          {activeTenant?.id === tenant.id && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User size={16} />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 py-4 px-4">
          <nav className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 bg-gray-50'
                  )}
                >
                  {item.icon}
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-6">
        <Outlet />
      </main>
    </div>
  )
}
