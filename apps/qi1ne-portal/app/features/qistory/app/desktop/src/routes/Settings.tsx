import { useState, useEffect } from 'react'
import { systemApi, projectApi } from '../lib/api'
import { useParams } from 'react-router-dom'

interface SystemStatus {
  llm: {
    backend: string
    model: string
    available: boolean
    last_error?: string
    test_latency_ms?: number
    test_response_length?: number
  }
  embeddings: {
    model: string
    available: boolean
    last_error?: string
    dimension?: number
  }
  whisper: { available: boolean }
  ocr: { available: boolean }
}

export default function Settings() {
  const { id } = useParams<{ id: string }>()
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  useEffect(() => {
    loadStatus()
  }, [])

  async function loadStatus() {
    try {
      const response = await systemApi.status()
      // Transform response to match our interface
      const transformed: SystemStatus = {
        llm: {
          backend: response.data.llm.backend || 'Not configured',
          model: response.data.llm.model || 'Not configured',
          available: response.data.llm.available || false,
          last_error: response.data.llm.last_error,
          test_latency_ms: response.data.llm.test_latency_ms,
          test_response_length: response.data.llm.test_response_length,
        },
        embeddings: {
          model: response.data.embeddings.model || 'Not configured',
          available: response.data.embeddings.available || false,
          last_error: response.data.embeddings.last_error,
          dimension: response.data.embeddings.dimension,
        },
        whisper: {
          available: response.data.whisper?.available || false,
        },
        ocr: {
          available: response.data.ocr?.available || false,
        },
      }
      setStatus(transformed)
    } catch (error) {
      console.error('Failed to load system status:', error)
    }
  }

  async function testLLM() {
    setTesting(true)
    setTestResult(null)
    try {
      const response = await systemApi.testLLM()
      setTestResult(response.data)
    } catch (error) {
      setTestResult({ success: false, error: String(error) })
    } finally {
      setTesting(false)
    }
  }

  async function testEmbeddings() {
    setTesting(true)
    setTestResult(null)
    try {
      const response = await systemApi.testEmbeddings()
      setTestResult(response.data)
    } catch (error) {
      setTestResult({ success: false, error: String(error) })
    } finally {
      setTesting(false)
    }
  }

  async function rebuildEmbeddings() {
    if (!id) {
      alert('No book selected')
      return
    }
    if (!confirm('Rebuild embeddings for this book? This may take a while.')) return
    try {
      const response = await projectApi.rebuildEmbeddings(id)
      alert(`Rebuilt ${response.data.rebuilt} embeddings`)
    } catch (error) {
      console.error('Failed to rebuild embeddings:', error)
      alert('Failed to rebuild embeddings')
    }
  }

  if (!status) {
    return <div>Loading system status...</div>
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>System Settings</h1>

      {/* LLM Status */}
      <div
        style={{
          padding: '1.5rem',
          border: '1px solid #ddd',
          borderRadius: '8px',
          marginBottom: '1.5rem',
        }}
      >
        <h2>LLM Status</h2>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Backend:</strong> {status.llm.backend || 'Not configured'}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Model:</strong> {status.llm.model || 'Not configured'}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Status:</strong>{' '}
          <span style={{ color: status.llm.available ? '#4CAF50' : '#f44336' }}>
            {status.llm.available ? '✓ Available' : '✗ Unavailable'}
          </span>
        </div>
        {status.llm.last_error && (
          <div style={{ color: '#f44336', marginBottom: '1rem', fontSize: '0.875rem' }}>
            Error: {status.llm.last_error}
          </div>
        )}
        {status.llm.test_latency_ms && (
          <div style={{ fontSize: '0.875rem', color: '#666' }}>
            Last test: {status.llm.test_latency_ms}ms, {status.llm.test_response_length} chars
          </div>
        )}
        <button onClick={testLLM} disabled={testing} style={{ marginTop: '1rem' }}>
          {testing ? 'Testing...' : 'Test LLM'}
        </button>
        {testResult && (
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              background: testResult.success ? '#e8f5e9' : '#ffebee',
              borderRadius: '4px',
            }}
          >
            {testResult.success ? (
              <div>
                <strong>✓ Test passed</strong>
                <div>Latency: {testResult.latency_ms}ms</div>
                <div>Response: {testResult.response}</div>
              </div>
            ) : (
              <div>
                <strong>✗ Test failed</strong>
                <div>{testResult.error}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Embeddings Status */}
      <div
        style={{
          padding: '1.5rem',
          border: '1px solid #ddd',
          borderRadius: '8px',
          marginBottom: '1.5rem',
        }}
      >
        <h2>Embeddings Status</h2>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Model:</strong> {status.embeddings.model || 'Not configured'}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Status:</strong>{' '}
          <span style={{ color: status.embeddings.available ? '#4CAF50' : '#f44336' }}>
            {status.embeddings.available ? '✓ Available' : '✗ Unavailable'}
          </span>
        </div>
        {status.embeddings.dimension && (
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
            Dimension: {status.embeddings.dimension}
          </div>
        )}
        {status.embeddings.last_error && (
          <div style={{ color: '#f44336', marginBottom: '1rem', fontSize: '0.875rem' }}>
            Error: {status.embeddings.last_error}
          </div>
        )}
        <button onClick={testEmbeddings} disabled={testing} style={{ marginTop: '1rem' }}>
          {testing ? 'Testing...' : 'Test Embeddings'}
        </button>
        {id && (
          <button
            onClick={rebuildEmbeddings}
            style={{ marginTop: '1rem', marginLeft: '1rem' }}
          >
            Rebuild Embeddings
          </button>
        )}
      </div>

      {/* Fallback Modes Info */}
      {(!status.llm.available || !status.embeddings.available) && (
        <div
          style={{
            padding: '1.5rem',
            border: '1px solid #ff9800',
            borderRadius: '8px',
            background: '#fff3e0',
            marginBottom: '1.5rem',
          }}
        >
          <h3>Fallback Modes</h3>
          {!status.embeddings.available && (
            <div style={{ marginBottom: '0.5rem' }}>
              • Embeddings missing: You can ingest and create outlines, but evidence mapping is
              disabled.
            </div>
          )}
          {!status.llm.available && (
            <div>
              • LLM missing: You can manage your library, but the wizard and drafting features are
              disabled.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

