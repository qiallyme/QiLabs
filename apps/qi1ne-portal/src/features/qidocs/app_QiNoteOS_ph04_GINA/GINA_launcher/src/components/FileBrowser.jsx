import { useState, useEffect } from 'react'
import './FileBrowser.css'

export default function FileBrowser({ orchestratorUrl, onFileSelect }) {
  const [fileHistory, setFileHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState(null)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetchFileHistory()
  }, [orchestratorUrl])

  async function fetchFileHistory() {
    try {
      const res = await fetch(`${orchestratorUrl}/file_history?per_page=100`)
      if (res.ok) {
        const data = await res.json()
        setFileHistory(data.items || [])
      }
    } catch (error) {
      console.error('Failed to fetch file history:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFiles = fileHistory.filter(item => {
    if (!filter) return true
    const search = filter.toLowerCase()
    return (
      item.file_path?.toLowerCase().includes(search) ||
      item.event_type?.toLowerCase().includes(search) ||
      item.actor?.toLowerCase().includes(search)
    )
  })

  // Group by file path
  const fileGroups = filteredFiles.reduce((acc, item) => {
    const path = item.file_path || 'unknown'
    if (!acc[path]) {
      acc[path] = []
    }
    acc[path].push(item)
    return acc
  }, {})

  function handleFileClick(filePath, events) {
    setSelectedFile({ path: filePath, events })
    if (onFileSelect) {
      onFileSelect({ path: filePath, events })
    }
  }

  if (loading) {
    return <div className="file-browser-loading">Loading file history...</div>
  }

  return (
    <div className="file-browser">
      <div className="file-browser-header">
        <h3>File Browser</h3>
        <input
          type="text"
          placeholder="Search files..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="file-search"
        />
      </div>
      
      <div className="file-browser-content">
        <div className="file-list">
          {Object.entries(fileGroups).map(([path, events]) => (
            <div
              key={path}
              className={`file-item ${selectedFile?.path === path ? 'selected' : ''}`}
              onClick={() => handleFileClick(path, events)}
            >
              <div className="file-path">{path}</div>
              <div className="file-meta">
                <span>{events.length} event{events.length !== 1 ? 's' : ''}</span>
                <span className="file-last-event">
                  {new Date(events[0]?.timestamp || events[0]?.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {selectedFile && (
          <div className="file-details">
            <h4>File Details</h4>
            <div className="file-path-display">{selectedFile.path}</div>
            <div className="file-events">
              <h5>Processing History</h5>
              {selectedFile.events.map((event, idx) => (
                <div key={idx} className="event-item">
                  <div className="event-header">
                    <span className="event-type">{event.event_type}</span>
                    <span className="event-actor">{event.actor}</span>
                    <span className="event-time">
                      {new Date(event.timestamp || event.created_at).toLocaleString()}
                    </span>
                  </div>
                  {event.meta && (
                    <div className="event-meta">
                      <pre>{JSON.stringify(event.meta, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

