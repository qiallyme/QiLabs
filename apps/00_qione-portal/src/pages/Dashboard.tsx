import { useState, useEffect } from 'react'
import { Launcher } from '../components/Launcher'
import { tools } from '../lib/tools'
import { User, Clock, Search, Grid, Plus, ExternalLink, Command } from 'lucide-react'
import { clsx } from 'clsx'

interface DashboardStats {
  quickAccess: number
  categories: number
  recentTools: string[]
}

export default function Dashboard() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    quickAccess: 0,
    categories: 6,
    recentTools: [],
  })

  useEffect(() => {
    // Load recent tools from localStorage
    const recent = JSON.parse(localStorage.getItem('qione_recent_tools') || '[]')
    setStats(prev => ({ ...prev, recentTools: recent, quickAccess: tools.length }))
  }, [])

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleToolClick = (toolUrl: string, toolName: string) => {
    // Track recent tools
    const recent = JSON.parse(localStorage.getItem('qione_recent_tools') || '[]')
    const updated = [toolName, ...recent.filter((t: string) => t !== toolName)].slice(0, 5)
    localStorage.setItem('qione_recent_tools', JSON.stringify(updated))
    
    window.open(toolUrl, toolUrl.startsWith('http') ? '_blank' : '_self')
  }

  const recentToolsData = stats.recentTools
    .map(name => tools.find(t => t.name.toLowerCase() === name.toLowerCase()))
    .filter(Boolean)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Your personal command center</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <Search className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">Search tools...</span>
            <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-500">
              <Command className="w-3 h-3" />K
            </kbd>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Grid className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.quickAccess}</div>
              <div className="text-sm text-gray-500">Total Tools</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.categories}</div>
              <div className="text-sm text-gray-500">Categories</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.recentTools.length}</div>
              <div className="text-sm text-gray-500">Recently Used</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Launch Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Quick Launch</h2>
          <button
            onClick={() => setSearchOpen(true)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View All ({tools.length})
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {tools.slice(0, 8).map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.url, tool.name)}
                className="group flex flex-col items-center p-3 rounded-xl hover:bg-gray-50 transition-colors"
                title={`${tool.name} - ${tool.description}`}
              >
                <div className={clsx(
                  'w-12 h-12 rounded-xl flex items-center justify-center mb-2 text-white transition-transform group-hover:scale-105',
                  tool.color
                )}>
                  <span className="text-lg font-bold">{tool.name[0]}</span>
                </div>
                <span className="text-xs font-medium text-gray-700 text-center">{tool.name}</span>
                {tool.external && (
                  <ExternalLink className="w-3 h-3 text-gray-400 mt-1 opacity-0 group-hover:opacity-100" />
                )}
              </button>
            ))}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-50 transition-colors border-2 border-dashed border-gray-200"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-2 bg-gray-100 text-gray-400">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-gray-500">More</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentToolsData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recently Used</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentToolsData.map((tool) => tool && (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.url, tool.name)}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className={clsx(
                  'w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0',
                  tool.color
                )}>
                  <span className="font-semibold">{tool.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{tool.name}</div>
                  <div className="text-sm text-gray-500">{tool.description}</div>
                </div>
                <div className="text-xs text-gray-400 capitalize">{tool.category}</div>
                {tool.external && <ExternalLink className="w-4 h-4 text-gray-400" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[70vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Tool Launcher</h3>
              <button
                onClick={() => setSearchOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ESC
              </button>
            </div>
            <Launcher onClose={() => setSearchOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
