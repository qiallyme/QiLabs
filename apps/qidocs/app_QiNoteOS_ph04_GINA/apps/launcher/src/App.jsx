import { useState, useEffect, useRef } from 'react'
import './App.css'
import { DEFAULT_ORCHESTRATOR_URL, REFRESH_INTERVAL, API_ENDPOINTS } from './config'
import { applyTheme, getStoredTheme, themes } from './theme'
import Tooltip, { STATUS_TOOLTIPS } from './components/Tooltip'
import FileBrowser from './components/FileBrowser'

function App() {
  const [health, setHealth] = useState(null)
  const [queue, setQueue] = useState(null)
  const [workers, setWorkers] = useState(null)
  const [errors, setErrors] = useState(null)
  const [loading, setLoading] = useState(true)
  const [orchestratorUrl, setOrchestratorUrl] = useState(DEFAULT_ORCHESTRATOR_URL)
  const [theme, setTheme] = useState(getStoredTheme())
  const [lastRefresh, setLastRefresh] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showFileBrowser, setShowFileBrowser] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    fetchData()
    intervalRef.current = setInterval(fetchData, REFRESH_INTERVAL)
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [orchestratorUrl])

  async function fetchData(showLoading = false) {
    if (showLoading) setIsRefreshing(true)
    try {
      const [healthRes, queueRes, workersRes, errorsRes] = await Promise.all([
        fetch(`${orchestratorUrl}${API_ENDPOINTS.health}`).catch(() => null),
        fetch(`${orchestratorUrl}${API_ENDPOINTS.queue}`).catch(() => null),
        fetch(`${orchestratorUrl}${API_ENDPOINTS.workers}`).catch(() => null),
        fetch(`${orchestratorUrl}${API_ENDPOINTS.errors}`).catch(() => null),
      ])

      if (healthRes?.ok) {
        const healthData = await healthRes.json()
        setHealth(healthData)
        console.log('Health data:', healthData)
      }
      if (queueRes?.ok) {
        const queueData = await queueRes.json()
        setQueue(queueData)
        console.log('Queue data:', queueData)
      }
      if (workersRes?.ok) {
        const workersData = await workersRes.json()
        // Convert object to array format
        const workersArray = Object.entries(workersData).map(([workerId, workerData]) => {
          // Fix status mapping: gray should stay gray, not degraded
          let state = 'gray'
          if (workerData.status === 'healthy') {
            state = 'green'
          } else if (workerData.status === 'down') {
            state = 'red'
          } else if (workerData.status === 'degraded') {
            state = 'orange'
          } else {
            // If no status or unknown, check last_heartbeat
            // If no heartbeat, it's gray (inactive)
            // If heartbeat exists but status is missing, assume degraded
            state = workerData.last_heartbeat ? 'orange' : 'gray'
          }
          
          return {
            worker_id: workerId,
            name: workerId,
            ...workerData,
            state,
          }
        })
        setWorkers(workersArray)
        console.log('Workers data:', workersArray)
      }
      if (errorsRes?.ok) {
        const errorsData = await errorsRes.json()
        setErrors(Array.isArray(errorsData) ? errorsData : [])
        console.log('Errors data:', errorsData)
      }
      
      setLastRefresh(new Date())
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setLoading(false)
    } finally {
      setIsRefreshing(false)
    }
  }

  function handleManualRefresh() {
    fetchData(true)
  }

  function toggleTheme() {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  function getStateColor(state) {
    switch (state) {
      case 'green': return 'var(--status-green)'
      case 'orange': return 'var(--status-orange)'
      case 'red': return 'var(--status-red)'
      case 'gray': return 'var(--status-gray)'
      default: return 'var(--status-gray)'
    }
  }

  function getStateLabel(state) {
    switch (state) {
      case 'green': return 'healthy'
      case 'orange': return 'degraded'
      case 'red': return 'down'
      case 'gray': return 'inactive'
      default: return 'unknown'
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <img 
            src="/logo.svg" 
            alt="QiOS Logo" 
            className="logo"
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <h1>QiOS Launcher</h1>
        </div>
        <div className="header-right">
          <div className="header-controls">
            <button 
              className="icon-button" 
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              title="Manual Refresh"
            >
              <span className="icon">⟳</span>
              {isRefreshing && <span className="spinner"></span>}
            </button>
            <button 
              className="icon-button" 
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <span className="icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>
            <button 
              className="icon-button" 
              onClick={() => setShowFileBrowser(!showFileBrowser)}
              title="Toggle File Browser"
            >
              <span className="icon">📁</span>
            </button>
          </div>
          {lastRefresh && (
            <div className="refresh-indicator">
              Last refresh: {lastRefresh.toLocaleTimeString()}
            </div>
          )}
          <div className="url-input">
            <label>Orchestrator URL:</label>
            <input
              type="text"
              value={orchestratorUrl}
              onChange={(e) => setOrchestratorUrl(e.target.value)}
              placeholder="http://localhost:8787"
            />
          </div>
        </div>
      </header>

      {loading && <div className="loading">Loading...</div>}
      
      {!loading && !health && !queue && !workers && (
        <div className="error-card">
          <h2>⚠️ No Data Available</h2>
          <p>Unable to connect to orchestrator or endpoints returned no data.</p>
          <p>Check browser console for errors.</p>
          <p>Orchestrator URL: <code>{orchestratorUrl}</code></p>
        </div>
      )}

      <div className="main-content">
        <div className="dashboard">
          {/* Health Status */}
          {health && (
            <section className="card">
              <h2>System Health</h2>
              <div className="health-grid">
                {Object.entries(health.layers || {}).map(([layer, data]) => (
                  <Tooltip key={layer} code={layer}>
                    <div className="layer-status">
                      <div
                        className="status-dot"
                        style={{ backgroundColor: getStateColor(data.state) }}
                      />
                      <span className="layer-name">{layer}</span>
                      <span className="layer-msg">{data.msg || 'ok'}</span>
                    </div>
                  </Tooltip>
                ))}
              </div>
            </section>
          )}

          {/* Queue Status */}
          {queue && (
            <section className="card">
              <h2>Ingestion Queue</h2>
              <div className="queue-stats">
                <div className="stat">
                  <span className="stat-label">Pending:</span>
                  <span className="stat-value">{queue.pending || 0}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">In Progress:</span>
                  <span className="stat-value">{queue.in_progress || 0}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Complete:</span>
                  <span className="stat-value">{queue.complete || 0}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Quarantined:</span>
                  <span className="stat-value">{queue.quarantined || 0}</span>
                </div>
              </div>
              {queue.complete > 0 && (
                <div className="queue-note">
                  <Tooltip code="complete">
                    <span className="info-icon">ℹ️</span>
                  </Tooltip>
                  <span>50 files processed. Router shows orange because workers haven't sent heartbeats yet (normal for newly deployed workers).</span>
                </div>
              )}
            </section>
          )}

          {/* Workers Status */}
          {workers && Array.isArray(workers) && workers.length > 0 && (
            <section className="card">
              <h2>Workers</h2>
              <div className="workers-list">
                {workers.map((worker) => (
                  <div key={worker.worker_id || worker.id} className="worker-item">
                    <div className="worker-header">
                      <Tooltip code={worker.state || worker.status}>
                        <div
                          className="status-dot"
                          style={{ backgroundColor: getStateColor(worker.state || worker.status) }}
                        />
                      </Tooltip>
                      <span className="worker-name">{worker.name || worker.worker_id}</span>
                      <Tooltip code={getStateLabel(worker.state || worker.status)}>
                        <span className="worker-status">({getStateLabel(worker.state || worker.status)})</span>
                      </Tooltip>
                    </div>
                    <div className="worker-details">
                      {worker.uptime_seconds !== undefined && (
                        <span>Uptime: {Math.floor(worker.uptime_seconds / 60)}m</span>
                      )}
                      {worker.last_heartbeat && (
                        <span>Last: {new Date(worker.last_heartbeat).toLocaleTimeString()}</span>
                      )}
                      {worker.phase && (
                        <span>Phase: {worker.phase}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Errors */}
          {errors && (
            <section className="card">
              <h2>Recent Errors</h2>
              {Array.isArray(errors) && errors.length > 0 ? (
                <div className="errors-list">
                  {errors.slice(0, 10).map((error, idx) => (
                    <div key={idx} className="error-item">
                      <Tooltip text={error.message || error.error_message}>
                        <span className="error-code">{error.code || error.error_code}</span>
                      </Tooltip>
                      <span className="error-msg">{error.message || error.error_message}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-errors">No errors</div>
              )}
            </section>
          )}
        </div>

        {/* File Browser Sidebar */}
        {showFileBrowser && (
          <div className="file-browser-sidebar">
            <FileBrowser 
              orchestratorUrl={orchestratorUrl}
              onFileSelect={setSelectedFile}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default App
