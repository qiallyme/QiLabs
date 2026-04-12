import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { outlineApi, evidenceApi, engineApi, manuscriptApi } from '../lib/api'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import EvidenceBadge from '../components/EvidenceBadge'
import { useToast } from '../components/ToastContainer'

interface OutlineNode {
  id: string
  node_type: string
  title: string
  goal: string | null
  order_index: number
  status: string
  word_target?: number
}

interface EvidenceStatus {
  count: number
  is_thin: boolean
  warning?: string
}

export default function OutlineStudio() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [nodes, setNodes] = useState<OutlineNode[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editGoal, setEditGoal] = useState('')
  const [editWordTarget, setEditWordTarget] = useState<number | undefined>(undefined)
  const [evidenceStatus, setEvidenceStatus] = useState<Record<string, EvidenceStatus>>({})
  const { addToast } = useToast()

  useEffect(() => {
    if (id) {
      loadOutline()
    }
  }, [id])

  async function loadOutline() {
    if (!id) return
    try {
      const response = await outlineApi.get(id)
      setNodes(response.data.nodes || [])
      
      // Load evidence status for each node
      const statusMap: Record<string, EvidenceStatus> = {}
      for (const node of response.data.nodes || []) {
        try {
          const evResponse = await evidenceApi.get(node.id)
          statusMap[node.id] = {
            count: evResponse.data.count || 0,
            is_thin: evResponse.data.is_thin || false,
            warning: evResponse.data.warning,
          }
        } catch {
          statusMap[node.id] = { count: 0, is_thin: true }
        }
      }
      setEvidenceStatus(statusMap)
    } catch (error) {
      console.error('Failed to load outline:', error)
      addToast('Failed to load outline', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function generateOutline() {
    if (!id) return
    setLoading(true)
    try {
      await outlineApi.generate(id)
      addToast('Outline generation started...', 'info')
      await loadOutline()
    } catch (error) {
      console.error('Failed to generate outline:', error)
      addToast('Failed to generate outline', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function mapEvidence() {
    if (!id) return
    setLoading(true)
    try {
      await evidenceApi.map(id)
      addToast('Evidence mapped successfully', 'success')
      await loadOutline()
    } catch (error) {
      console.error('Failed to map evidence:', error)
      addToast('Failed to map evidence', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function approveOutline() {
    if (!id) return
    setLoading(true)
    try {
      await engineApi.resume(id)
      addToast('Outline approved!', 'success')
      await loadOutline()
    } catch (error) {
      console.error('Failed to approve outline:', error)
      addToast('Failed to approve outline', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function updateNode(nodeId: string) {
    setLoading(true)
    try {
      await outlineApi.update(nodeId, {
        title: editTitle,
        goal: editGoal,
        word_target: editWordTarget,
      })
      setEditing(null)
      addToast('Node updated successfully!', 'success')
      await loadOutline()
    } catch (error) {
      console.error('Failed to update node:', error)
      addToast('Failed to update node', 'error')
    } finally {
      setLoading(false)
    }
  }

  function startEdit(node: OutlineNode) {
    setEditing(node.id)
    setEditTitle(node.title)
    setEditGoal(node.goal || '')
    setEditWordTarget(node.word_target)
  }

  if (loading && nodes.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1>Outline Studio</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {nodes.length === 0 && (
            <button onClick={generateOutline} disabled={loading}>
              {loading ? <LoadingSpinner /> : 'Generate Outline'}
            </button>
          )}
          {nodes.length > 0 && (
            <>
              <button onClick={mapEvidence} disabled={loading}>
                {loading ? <LoadingSpinner /> : 'Map Evidence'}
              </button>
              <button onClick={approveOutline} disabled={loading}>
                {loading ? <LoadingSpinner /> : 'Approve Outline'}
              </button>
              <button onClick={generateBackmatter} disabled={loading}>
                {loading ? <LoadingSpinner /> : 'Generate Back-matter'}
              </button>
              <button onClick={() => navigate(`/books/${id}/draft`)} disabled={nodes.length === 0}>
                Go to Drafting Studio
              </button>
            </>
          )}
        </div>
      </div>

      {nodes.length === 0 ? (
        <div>
          <p>No outline yet. Generate one to get started.</p>
        </div>
      ) : (
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Order</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Type</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Title</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Goal</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Word Target</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Evidence</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((node) => {
                const evStatus = evidenceStatus[node.id] || { count: 0, is_thin: true }
                return (
                  <tr key={node.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.5rem' }}>{node.order_index}</td>
                    <td style={{ padding: '0.5rem' }}>{node.node_type}</td>
                    <td style={{ padding: '0.5rem' }}>
                      {editing === node.id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          style={{ width: '100%', padding: '0.25rem' }}
                        />
                      ) : (
                        node.title
                      )}
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      {editing === node.id ? (
                        <textarea
                          value={editGoal}
                          onChange={(e) => setEditGoal(e.target.value)}
                          style={{ width: '100%', padding: '0.25rem', minHeight: '60px' }}
                        />
                      ) : (
                        node.goal || '-'
                      )}
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      {editing === node.id ? (
                        <input
                          type="number"
                          placeholder="Word Target"
                          value={editWordTarget === undefined ? '' : editWordTarget}
                          onChange={(e) =>
                            setEditWordTarget(e.target.value ? parseInt(e.target.value) : undefined)
                          }
                          style={{ width: '100%', padding: '0.25rem' }}
                        />
                      ) : (
                        node.word_target ? `${node.word_target} words` : '-'
                      )}
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      {evStatus.is_thin ? (
                        <EvidenceBadge count={evStatus.count} warning={evStatus.warning} />
                      ) : (
                        <span style={{ color: '#4CAF50', fontSize: '0.875rem' }}>
                          ✓ {evStatus.count} chunks
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <StatusBadge status={node.status} />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      {editing === node.id ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => updateNode(node.id)} disabled={loading}>
                            {loading ? <LoadingSpinner /> : 'Save'}
                          </button>
                          <button onClick={() => setEditing(null)} disabled={loading}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(node)} disabled={loading}>
                          Edit
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
  )
}
