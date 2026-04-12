import { useState } from 'react'
import { tools, categories, Tool, CategoryId } from '../lib/tools'
import { Search, ExternalLink, Grid, LayoutGrid } from 'lucide-react'
import { clsx } from 'clsx'

interface LauncherProps {
  onClose?: () => void
}

export function Launcher({ onClose }: LauncherProps) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredTools = tools.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const handleToolClick = (tool: Tool) => {
    if (tool.external) {
      window.open(tool.url, '_blank')
    } else {
      window.location.href = tool.url
    }
    onClose?.()
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            autoFocus
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="px-4 py-2 border-b border-gray-200 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveCategory('all')}
          className={clsx(
            'px-3 py-1 text-sm rounded-full whitespace-nowrap transition-colors',
            activeCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={clsx(
              'px-3 py-1 text-sm rounded-full whitespace-nowrap transition-colors',
              activeCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* View Toggle */}
      <div className="px-4 py-2 flex justify-end gap-1 border-b border-gray-100">
        <button
          onClick={() => setViewMode('grid')}
          className={clsx(
            'p-1.5 rounded',
            viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'
          )}
        >
          <Grid className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={clsx(
            'p-1.5 rounded',
            viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'
          )}
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
      </div>

      {/* Tools Grid/List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredTools.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            No tools found matching your search.
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool)}
                className="group flex flex-col items-center p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all bg-white"
              >
                <div className={clsx(
                  'w-12 h-12 rounded-xl flex items-center justify-center mb-3 text-white',
                  tool.color
                )}>
                  <span className="text-lg font-semibold">{tool.name[0]}</span>
                </div>
                <span className="font-medium text-gray-900 text-sm">{tool.name}</span>
                <span className="text-xs text-gray-500 mt-0.5">{tool.description}</span>
                {tool.external && (
                  <ExternalLink className="w-3 h-3 text-gray-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
              >
                <div className={clsx(
                  'w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0',
                  tool.color
                )}>
                  <span className="font-semibold">{tool.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{tool.name}</div>
                  <div className="text-sm text-gray-500 truncate">{tool.description}</div>
                </div>
                <div className="px-2 py-0.5 text-xs bg-gray-100 rounded text-gray-600">
                  {tool.category}
                </div>
                {tool.external && <ExternalLink className="w-4 h-4 text-gray-400" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
