import { useEffect, useState } from 'react'

const LOCAL_API = import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:8000'

interface SystemStatus {
  timestamp: string
  data_root: string
  directories: Record<string, { exists: boolean; path: string }>
  inbox_file_count: number
  env_checks: Record<string, boolean>
}

interface QueueFile {
  filename: string
  path: string
  size_bytes: number
  modified: string
}

type ApiStatus = 'checking' | 'online' | 'offline'

export default function SystemStatusPage() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking')
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [queue, setQueue] = useState<QueueFile[]>([])
  const [ingesting, setIngesting] = useState(false)
  const [ingestResult, setIngestResult] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<string>('')

  const fetchStatus = async () => {
    try {
      const [statusRes, queueRes] = await Promise.all([
        fetch(`${LOCAL_API}/status`),
        fetch(`${LOCAL_API}/queue`),
      ])
      if (!statusRes.ok) throw new Error('API error')
      const s = await statusRes.json()
      const q = await queueRes.json()
      setStatus(s)
      setQueue(q.files || [])
      setApiStatus('online')
      setLastRefresh(new Date().toLocaleTimeString())
    } catch {
      setApiStatus('offline')
    }
  }

  const triggerIngest = async () => {
    setIngesting(true)
    setIngestResult(null)
    try {
      const res = await fetch(`${LOCAL_API}/ingest`, { method: 'POST' })
      const data = await res.json()
      setIngestResult(data.exit_code === 0 ? '✅ Ingest triggered successfully' : `❌ Error: ${data.stderr}`)
      await fetchStatus()
    } catch {
      setIngestResult('❌ Could not reach local API — is it running?')
    } finally {
      setIngesting(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">System Status</h1>
            <p className="text-sm text-slate-500 mt-1">
              Local API: <code className="text-xs bg-slate-100 px-1 rounded">{LOCAL_API}</code>
              {lastRefresh && <span className="ml-3">Last refresh: {lastRefresh}</span>}
            </p>
          </div>
          <button
            onClick={fetchStatus}
            className="text-sm px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            ↻ Refresh
          </button>
        </div>

        {/* API Status Banner */}
        <div className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${
          apiStatus === 'online'   ? 'border-emerald-200 bg-emerald-50 text-emerald-800' :
          apiStatus === 'offline'  ? 'border-red-200 bg-red-50 text-red-800' :
                                     'border-slate-200 bg-slate-50 text-slate-600'
        }`}>
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            apiStatus === 'online' ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]' :
            apiStatus === 'offline' ? 'bg-red-500' : 'bg-slate-400 animate-pulse'
          }`} />
          <span className="text-sm font-medium">
            {apiStatus === 'online'  && 'Local Python API is online'}
            {apiStatus === 'offline' && 'Local Python API is offline — run: just dev-all'}
            {apiStatus === 'checking'&& 'Connecting to local API...'}
          </span>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Data Directories */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Data Directories</h2>
            {status ? (
              <div className="space-y-2">
                {Object.entries(status.directories).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-mono">{key}</span>
                    <span className={`flex items-center gap-1.5 font-medium ${val.exists ? 'text-emerald-600' : 'text-red-500'}`}>
                      <span className={`w-2 h-2 rounded-full ${val.exists ? 'bg-emerald-500' : 'bg-red-400'}`} />
                      {val.exists ? 'exists' : 'missing'}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-100 text-sm text-slate-500">
                  <span className="font-medium text-slate-700">{status.inbox_file_count}</span> files in inbox
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Waiting for local API...</p>
            )}
          </div>

          {/* Env Checks */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Environment</h2>
            {status ? (
              <div className="space-y-2">
                {Object.entries(status.env_checks).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-mono">{key.replace(/_/g, ' ')}</span>
                    <span className={`flex items-center gap-1.5 font-medium ${val ? 'text-emerald-600' : 'text-amber-600'}`}>
                      <span className={`w-2 h-2 rounded-full ${val ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                      {val ? 'set' : 'missing'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Waiting for local API...</p>
            )}
          </div>

        </div>

        {/* Ingest Panel */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Inbox Queue</h2>
            <button
              onClick={triggerIngest}
              disabled={ingesting || apiStatus !== 'online'}
              className="px-4 py-1.5 text-sm font-semibold rounded-full bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {ingesting ? 'Running...' : '▶ Run Ingest'}
            </button>
          </div>

          {ingestResult && (
            <div className="mb-3 text-sm px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
              {ingestResult}
            </div>
          )}

          {queue.length === 0 ? (
            <p className="text-sm text-slate-400">
              {apiStatus === 'online' ? 'Inbox is empty — drop files into C:/QiData/inbox/' : 'Connect local API to see queue'}
            </p>
          ) : (
            <div className="space-y-1.5">
              {queue.map((f, i) => (
                <div key={i} className="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-2">
                  <span className="font-mono text-slate-700 truncate max-w-xs">{f.filename}</span>
                  <span className="text-slate-400 text-xs flex-shrink-0 ml-2">
                    {(f.size_bytes / 1024).toFixed(1)} KB
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
