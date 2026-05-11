import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { projectApi, manuscriptApi } from '../lib/api'

export default function BookDetail() {
  const { id } = useParams<{ id: string }>()
  const [book, setBook] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [packing, setPacking] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  useEffect(() => {
    if (id) {
      loadBook(id)
    }
  }, [id])

  async function loadBook(bookId: string) {
    try {
      const response = await axios.get(`/api/books/${bookId}`)
      setBook(response.data)
    } catch (error) {
      console.error('Failed to load book:', error)
    } finally {
      setLoading(false)
    }
  }

  async function packProject() {
    if (!id) return
    setPacking(true)
    try {
      const response = await projectApi.pack(id)
      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/zip' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${book?.working_title?.replace(' ', '_') || 'project'}_pack.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      alert('Project packed successfully!')
    } catch (error) {
      console.error('Failed to pack project:', error)
      alert('Failed to pack project')
    } finally {
      setPacking(false)
    }
  }

  async function exportManuscript(format: string, template?: string) {
    if (!id) return
    setExporting(true)
    try {
      const response = await manuscriptApi.export(id, { format, template })
      const blob = new Blob([response.data], { type: response.headers['content-type'] })
      const contentDisposition = response.headers['content-disposition']
      let filename = `manuscript_${id}.${format}`
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1]
        }
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      alert(`Exported to ${filename} successfully!`)
    } catch (error: any) {
      console.error('Failed to export manuscript:', error)
      alert(`Failed to export: ${error.response?.data?.detail || error.message}`)
    } finally {
      setExporting(false)
      setShowExportModal(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!book) {
    return <div>Book not found</div>
  }

  return (
    <div>
      <h1>{book.working_title}</h1>
      <p>Status: {book.status}</p>
      <p>Created: {new Date(book.created_at).toLocaleDateString()}</p>
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <a href={`/books/${id}/wizard`}>Wizard</a>
        <a href={`/books/${id}/outline`}>Outline</a>
        <a href={`/books/${id}/draft`}>Drafting</a>
        <button onClick={() => setShowExportModal(true)} disabled={exporting} style={{ padding: '0.5rem 1rem' }}>
          {exporting ? 'Exporting...' : 'Export Manuscript'}
        </button>
        <button onClick={packProject} disabled={packing} style={{ padding: '0.5rem 1rem' }}>
          {packing ? 'Packing...' : 'Pack Project'}
        </button>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            zIndex: 10001,
            minWidth: '400px',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Export Manuscript</h3>
          <p style={{ marginBottom: '1.5rem', color: '#666' }}>
            Choose a format to export your manuscript:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={() => exportManuscript('markdown')}
              disabled={exporting}
              style={{
                padding: '0.75rem 1rem',
                background: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: exporting ? 'not-allowed' : 'pointer',
                textAlign: 'left',
              }}
            >
              <strong>Markdown (.md)</strong>
              <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                Plain text with formatting
              </div>
            </button>
            <button
              onClick={() => exportManuscript('txt')}
              disabled={exporting}
              style={{
                padding: '0.75rem 1rem',
                background: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: exporting ? 'not-allowed' : 'pointer',
                textAlign: 'left',
              }}
            >
              <strong>Plain Text (.txt)</strong>
              <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                Unformatted text file
              </div>
            </button>
            <button
              onClick={() => exportManuscript('docx', 'manuscript')}
              disabled={exporting}
              style={{
                padding: '0.75rem 1rem',
                background: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: exporting ? 'not-allowed' : 'pointer',
                textAlign: 'left',
              }}
            >
              <strong>DOCX (Manuscript Standard)</strong>
              <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                12pt Times, double-spaced, publisher-ready
              </div>
            </button>
            <button
              onClick={() => exportManuscript('epub')}
              disabled={exporting}
              style={{
                padding: '0.75rem 1rem',
                background: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: exporting ? 'not-allowed' : 'pointer',
                textAlign: 'left',
              }}
            >
              <strong>EPUB (.epub)</strong>
              <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                E-book format (requires pandoc or ebooklib)
              </div>
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button
              onClick={() => setShowExportModal(false)}
              disabled={exporting}
              style={{ padding: '0.5rem 1rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

