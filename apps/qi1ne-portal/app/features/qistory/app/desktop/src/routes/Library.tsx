import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { rawItemsApi } from '../lib/api'

interface RawItem {
  id: string
  type: string
  title: string | null
  source_name: string | null
  imported_at: string
  text_content: string | null
  chunk_count?: number
  embedding_count?: number
  status?: 'pending' | 'processed' | 'chunked' | 'ready'
}

export default function Library() {
  const navigate = useNavigate()
  const [items, setItems] = useState<RawItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [pasteModal, setPasteModal] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [pasteTitle, setPasteTitle] = useState('')
  const [viewingItem, setViewingItem] = useState<RawItem | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const processingIntervalRef = useRef<number | null>(null)

  // Show toast notification
  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  useEffect(() => {
    loadItems()
    // Poll for updates - faster when processing
    const pollInterval = processing ? 2000 : 5000
    const interval = setInterval(loadItems, pollInterval)
    return () => clearInterval(interval)
  }, [processing])

  // Clear processing interval on unmount
  useEffect(() => {
    return () => {
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current)
      }
    }
  }, [])

  async function loadItems() {
    try {
      const response = await rawItemsApi.list()
      setItems(response.data.items || [])
    } catch (error) {
      console.error('Failed to load items:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      await rawItemsApi.upload(file)
      showToast(`File "${file.name}" uploaded successfully!`, 'success')
      await loadItems()
    } catch (error) {
      console.error('Upload failed:', error)
      showToast('Upload failed. Please try again.', 'error')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  async function handlePaste() {
    if (!pasteText.trim()) return

    setUploading(true)
    try {
      await rawItemsApi.paste(pasteText, pasteTitle || undefined)
      showToast('Text pasted successfully!', 'success')
      setPasteModal(false)
      setPasteText('')
      setPasteTitle('')
      await loadItems()
    } catch (error) {
      console.error('Paste failed:', error)
      showToast('Paste failed. Please try again.', 'error')
    } finally {
      setUploading(false)
    }
  }

  async function handleProcessAll() {
    if (!confirm('Process all unprocessed raw items into chunks? This may take a moment.')) {
      return
    }

    setProcessing(true)
    // Start faster polling during processing
    if (processingIntervalRef.current) {
      clearInterval(processingIntervalRef.current)
    }
    processingIntervalRef.current = setInterval(loadItems, 2000)

    try {
      const response = await rawItemsApi.processAll()
      const data = response.data
      showToast(
        `Processing complete! ${data.items_processed} items, ${data.chunks_created} chunks, ${data.embeddings_created} embeddings created.`,
        'success'
      )
      await loadItems()
    } catch (error: any) {
      console.error('Process failed:', error)
      showToast(`Process failed: ${error.response?.data?.detail || error.message}`, 'error')
    } finally {
      setProcessing(false)
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current)
        processingIntervalRef.current = null
      }
    }
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      const fakeEvent = {
        target: { files: [file] },
      } as any
      handleUpload(fakeEvent)
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        color: 'var(--neon-blue)',
        fontSize: '1.25rem',
        textShadow: '0 0 20px rgba(0, 212, 255, 0.5)'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #00d4ff, #a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 0 30px rgba(0, 212, 255, 0.3)',
          letterSpacing: '1px'
        }}>
          Library
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="neon-button neon-button-blue"
          >
            {uploading ? 'Uploading...' : '📤 Upload File'}
          </button>
          <button 
            onClick={() => setPasteModal(true)}
            className="neon-button neon-button-purple"
          >
            📝 Paste Text
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleUpload}
        style={{ display: 'none' }}
      />

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="glass"
        style={{
          border: '2px dashed rgba(0, 212, 255, 0.4)',
          padding: '3rem',
          textAlign: 'center',
          marginBottom: '2rem',
          borderRadius: '12px',
          color: 'var(--neon-blue)',
          fontSize: '1.1rem',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.8)'
          e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.4)'
          e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
        <div style={{ textShadow: '0 0 10px rgba(0, 212, 255, 0.5)' }}>
          Drop files here to upload
        </div>
      </div>

      {pasteModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setPasteModal(false)}
        >
          <div
            className="glass"
            style={{
              padding: '2.5rem',
              borderRadius: '16px',
              width: '600px',
              maxHeight: '80vh',
              overflow: 'auto',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              boxShadow: '0 0 40px rgba(168, 85, 247, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              marginBottom: '1.5rem',
              color: 'var(--neon-purple)',
              textShadow: '0 0 20px rgba(168, 85, 247, 0.5)',
              fontSize: '1.75rem'
            }}>
              Paste Text
            </h2>
            <input
              type="text"
              placeholder="Title (optional)"
              value={pasteTitle}
              onChange={(e) => setPasteTitle(e.target.value)}
              style={{
                width: '100%',
                marginBottom: '1rem',
                padding: '0.75rem',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '1rem'
              }}
            />
            <textarea
              placeholder="Paste your text here..."
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              style={{
                width: '100%',
                height: '300px',
                padding: '0.75rem',
                marginBottom: '1.5rem',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handlePaste}
                disabled={uploading || !pasteText.trim()}
                className="neon-button neon-button-purple"
              >
                {uploading ? 'Pasting...' : 'Paste'}
              </button>
              <button
                onClick={() => setPasteModal(false)}
                className="neon-button"
                style={{ borderColor: 'rgba(255, 255, 255, 0.3)', color: 'rgba(255, 255, 255, 0.7)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2>Items ({items.length})</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {items.length > 0 && (
              <>
                {items.some(item => (item.chunk_count || 0) > 0) && (
                  <button
                    onClick={() => navigate('/books')}
                    className="neon-button neon-button-cyan"
                  >
                    📖 Create Book →
                  </button>
                )}
                <button
                  onClick={handleProcessAll}
                  disabled={processing || items.every(item => item.status === 'ready')}
                  className="neon-button neon-button-pink"
                >
                  {processing ? '⚙️ Processing...' : '⚡ Process All → Chunks'}
                </button>
              </>
            )}
          </div>
        </div>
        {items.length === 0 ? (
          <div className="glass" style={{ 
            textAlign: 'center', 
            padding: '4rem',
            borderRadius: '16px',
            border: '2px dashed rgba(0, 212, 255, 0.4)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📚</div>
            <h3 style={{ 
              marginBottom: '1rem', 
              color: 'var(--neon-blue)',
              fontSize: '1.5rem',
              textShadow: '0 0 20px rgba(0, 212, 255, 0.5)'
            }}>
              No items yet
            </h3>
            <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
              Upload files or paste text to get started
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="neon-button neon-button-blue"
              >
                📤 Upload File
              </button>
              <button
                onClick={() => setPasteModal(true)}
                className="neon-button neon-button-purple"
              >
                📝 Paste Text
              </button>
            </div>
          </div>
        ) : (
          <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden', marginTop: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ 
                  borderBottom: '2px solid rgba(0, 212, 255, 0.3)',
                  background: 'rgba(0, 212, 255, 0.1)'
                }}>
                  <th style={{ 
                    textAlign: 'left', 
                    padding: '1rem',
                    color: 'var(--neon-blue)',
                    fontWeight: '600',
                    textShadow: '0 0 10px rgba(0, 212, 255, 0.3)'
                  }}>
                    Title
                  </th>
                  <th style={{ 
                    textAlign: 'left', 
                    padding: '1rem',
                    color: 'var(--neon-blue)',
                    fontWeight: '600',
                    textShadow: '0 0 10px rgba(0, 212, 255, 0.3)'
                  }}>
                    Type
                  </th>
                  <th style={{ 
                    textAlign: 'left', 
                    padding: '1rem',
                    color: 'var(--neon-blue)',
                    fontWeight: '600',
                    textShadow: '0 0 10px rgba(0, 212, 255, 0.3)'
                  }}>
                    Imported
                  </th>
                  <th style={{ 
                    textAlign: 'left', 
                    padding: '1rem',
                    color: 'var(--neon-blue)',
                    fontWeight: '600',
                    textShadow: '0 0 10px rgba(0, 212, 255, 0.3)'
                  }}>
                    Status
                  </th>
                  <th style={{ 
                    textAlign: 'left', 
                    padding: '1rem',
                    color: 'var(--neon-blue)',
                    fontWeight: '600',
                    textShadow: '0 0 10px rgba(0, 212, 255, 0.3)'
                  }}>
                    Chunks
                  </th>
                  <th style={{ 
                    textAlign: 'left', 
                    padding: '1rem',
                    color: 'var(--neon-blue)',
                    fontWeight: '600',
                    textShadow: '0 0 10px rgba(0, 212, 255, 0.3)'
                  }}>
                    Embeddings
                  </th>
                  <th style={{ 
                    textAlign: 'left', 
                    padding: '1rem',
                    color: 'var(--neon-blue)',
                    fontWeight: '600',
                    textShadow: '0 0 10px rgba(0, 212, 255, 0.3)'
                  }}>
                    Words
                  </th>
                  <th style={{ 
                    textAlign: 'left', 
                    padding: '1rem',
                    color: 'var(--neon-blue)',
                    fontWeight: '600',
                    textShadow: '0 0 10px rgba(0, 212, 255, 0.3)'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const wordCount = item.text_content ? item.text_content.split(/\s+/).filter(w => w.length > 0).length : 0
                  const status = item.status || (item.text_content ? 'processed' : 'pending')
                  const chunkCount = item.chunk_count || 0
                  const embeddingCount = item.embedding_count || 0
                  
                  // Status badge styling with neon colors
                  const statusConfig: Record<string, { bg: string; color: string; text: string; glow: string }> = {
                    'pending': { 
                      bg: 'rgba(236, 72, 153, 0.2)', 
                      color: '#ec4899', 
                      text: '⏳ Pending',
                      glow: '0 0 10px rgba(236, 72, 153, 0.5)'
                    },
                    'processed': { 
                      bg: 'rgba(0, 212, 255, 0.2)', 
                      color: '#00d4ff', 
                      text: '✓ Text Extracted',
                      glow: '0 0 10px rgba(0, 212, 255, 0.5)'
                    },
                    'chunked': { 
                      bg: 'rgba(168, 85, 247, 0.2)', 
                      color: '#a855f7', 
                      text: '📦 Chunked',
                      glow: '0 0 10px rgba(168, 85, 247, 0.5)'
                    },
                    'ready': { 
                      bg: 'rgba(6, 182, 212, 0.2)', 
                      color: '#06b6d4', 
                      text: '✅ Ready',
                      glow: '0 0 10px rgba(6, 182, 212, 0.5)'
                    }
                  }
                  const statusStyle = statusConfig[status] || statusConfig['pending']
                  
                  return (
                    <tr 
                      key={item.id} 
                      style={{ 
                        borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 212, 255, 0.05)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                        <strong>{item.title || item.source_name || item.id}</strong>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.375rem 0.75rem', 
                          borderRadius: '6px', 
                          background: 'rgba(0, 212, 255, 0.15)',
                          border: '1px solid rgba(0, 212, 255, 0.3)',
                          color: 'var(--neon-blue)',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}>
                          {item.type}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                        {new Date(item.imported_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.375rem 0.75rem',
                          borderRadius: '6px',
                          background: statusStyle.bg,
                          border: `1px solid ${statusStyle.color}`,
                          color: statusStyle.color,
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          textShadow: statusStyle.glow,
                          boxShadow: statusStyle.glow
                        }}>
                          {statusStyle.text}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {chunkCount > 0 ? (
                          <span style={{ 
                            fontWeight: 'bold', 
                            color: 'var(--neon-cyan)',
                            textShadow: '0 0 8px rgba(6, 182, 212, 0.5)'
                          }}>
                            {chunkCount}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {chunkCount > 0 ? (
                          <span style={{ 
                            fontWeight: 'bold',
                            color: embeddingCount === chunkCount ? 'var(--neon-cyan)' : 'var(--neon-pink)',
                            textShadow: embeddingCount === chunkCount 
                              ? '0 0 8px rgba(6, 182, 212, 0.5)' 
                              : '0 0 8px rgba(236, 72, 153, 0.5)'
                          }}>
                            {embeddingCount}/{chunkCount}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                        {wordCount > 0 ? wordCount.toLocaleString() : '-'}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {item.text_content && (
                          <button
                            onClick={() => setViewingItem(item)}
                            className="neon-button neon-button-blue"
                            style={{
                              padding: '0.5rem 1rem',
                              fontSize: '0.875rem'
                            }}
                          >
                            👁️ View
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {viewingItem && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setViewingItem(null)}
        >
          <div
            className="glass"
            style={{
              padding: '2.5rem',
              borderRadius: '16px',
              width: '85%',
              maxWidth: '1000px',
              maxHeight: '85vh',
              overflow: 'auto',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 212, 255, 0.2), inset 0 0 20px rgba(0, 212, 255, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '1.5rem',
              borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
              paddingBottom: '1rem'
            }}>
              <h2 style={{
                color: 'var(--neon-blue)',
                textShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
                margin: 0
              }}>
                {viewingItem.title || viewingItem.source_name || 'Item Content'}
              </h2>
              <button
                onClick={() => setViewingItem(null)}
                className="neon-button neon-button-pink"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem'
                }}
              >
                ✕ Close
              </button>
            </div>
            <div style={{ 
              padding: '1.5rem', 
              background: 'rgba(0, 0, 0, 0.3)', 
              borderRadius: '12px',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              lineHeight: '1.8',
              maxHeight: '55vh',
              overflow: 'auto',
              color: 'var(--text-primary)'
            }}>
              {viewingItem.text_content || 'No content available'}
            </div>
            <div style={{ 
              marginTop: '1.5rem', 
              color: 'var(--text-secondary)', 
              fontSize: '0.875rem',
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <span><strong style={{ color: 'var(--neon-blue)' }}>Type:</strong> {viewingItem.type}</span>
              <span><strong style={{ color: 'var(--neon-blue)' }}>Words:</strong> {viewingItem.text_content ? viewingItem.text_content.split(/\s+/).filter(w => w.length > 0).length.toLocaleString() : 0}</span>
              <span><strong style={{ color: 'var(--neon-blue)' }}>Chunks:</strong> {viewingItem.chunk_count || 0}</span>
              <span><strong style={{ color: 'var(--neon-blue)' }}>Embeddings:</strong> {viewingItem.embedding_count || 0}</span>
              <span><strong style={{ color: 'var(--neon-blue)' }}>Imported:</strong> {new Date(viewingItem.imported_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className="glass"
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            padding: '1rem 1.5rem',
            background: toast.type === 'success' 
              ? 'rgba(6, 182, 212, 0.2)' 
              : 'rgba(236, 72, 153, 0.2)',
            border: `1px solid ${toast.type === 'success' ? 'var(--neon-cyan)' : 'var(--neon-pink)'}`,
            color: 'var(--text-primary)',
            borderRadius: '12px',
            boxShadow: toast.type === 'success'
              ? '0 4px 20px rgba(6, 182, 212, 0.4), 0 0 20px rgba(6, 182, 212, 0.2)'
              : '0 4px 20px rgba(236, 72, 153, 0.4), 0 0 20px rgba(236, 72, 153, 0.2)',
            zIndex: 10000,
            maxWidth: '400px',
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <span style={{
              color: toast.type === 'success' ? 'var(--neon-cyan)' : 'var(--neon-pink)',
              textShadow: toast.type === 'success'
                ? '0 0 10px rgba(6, 182, 212, 0.5)'
                : '0 0 10px rgba(236, 72, 153, 0.5)'
            }}>
              {toast.message}
            </span>
            <button
              onClick={() => setToast(null)}
              style={{
                background: 'none',
                border: 'none',
                color: toast.type === 'success' ? 'var(--neon-cyan)' : 'var(--neon-pink)',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '0',
                lineHeight: '1'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
