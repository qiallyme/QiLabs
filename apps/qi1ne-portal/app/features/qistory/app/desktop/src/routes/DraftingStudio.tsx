import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { outlineApi, draftingApi, evidenceApi } from '../lib/api'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import EvidenceBadge from '../components/EvidenceBadge'
import { useToast } from '../components/ToastContainer'

interface OutlineNode {
  id: string
  title: string
  status: string
  order_index: number
}

interface Evidence {
  link_id?: string  // Added for detach
  chunk_id: string
  chunk_text: string
  relevance_score: number
  raw_title: string
  raw_type: string
  manual_link?: boolean  // Added to show manual attachments
}

interface EvidenceStatus {
  evidence: Evidence[]
  count: number
  is_thin: boolean
  warning?: string
}

export default function DraftingStudio() {
  const { id, nodeId } = useParams<{ id: string; nodeId?: string }>()
  const [nodes, setNodes] = useState<OutlineNode[]>([])
  const [selectedNode, setSelectedNode] = useState<OutlineNode | null>(null)
  const [draft, setDraft] = useState('')
  const [draftId, setDraftId] = useState<string | null>(null)
  const [draftVersion, setDraftVersion] = useState<number | null>(null)
  const [draftStatus, setDraftStatus] = useState<string | null>(null)
  const [evidenceStatus, setEvidenceStatus] = useState<EvidenceStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [showEvidenceSearch, setShowEvidenceSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [continuityFlags, setContinuityFlags] = useState<any>(null)
  const [recaps, setRecaps] = useState<{ chapter?: string; book?: string } | null>(null)
  const [styleDrift, setStyleDrift] = useState<any>(null)
  const [heatmap, setHeatmap] = useState<any>(null)
  const [overrideThinEvidence, setOverrideThinEvidence] = useState(false)
  const [showOverrideModal, setShowOverrideModal] = useState(false)
  const [branches, setBranches] = useState<Array<{ id: string; label: string; created_at: string }>>([])
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null) // null = "Main" branch
  const [showNewBranchModal, setShowNewBranchModal] = useState(false)
  const [newBranchLabel, setNewBranchLabel] = useState('')
  const [showDiffViewer, setShowDiffViewer] = useState(false)
  const [draftList, setDraftList] = useState<Array<{ id: string; draft_version: number; branch_id: string | null; created_at: string }>>([])
  const [selectedDraft1, setSelectedDraft1] = useState<string | null>(null)
  const [selectedDraft2, setSelectedDraft2] = useState<string | null>(null)
  const [diffResult, setDiffResult] = useState<any>(null)
  const { addToast } = useToast()

  useEffect(() => {
    if (id) {
      loadOutline()
      if (nodeId) {
        selectNode(nodeId)
      }
    }
  }, [id, nodeId])

  async function loadOutline() {
    if (!id) return
    try {
      const response = await outlineApi.get(id)
      setNodes(response.data.nodes || [])
      if (response.data.nodes.length > 0 && !nodeId) {
        // Select first unlocked node
        const unlocked = response.data.nodes.find((n: any) => n.status !== 'locked')
        if (unlocked) {
          selectNode(unlocked.id)
        }
      }
    } catch (error) {
      console.error('Failed to load outline:', error)
    }
  }

  async function selectNode(nodeId: string) {
    setLoading(true)
    try {
      const node = nodes.find((n: OutlineNode) => n.id === nodeId)
      if (node) {
        setSelectedNode(node)
        // Load evidence
        const evidenceResponse = await evidenceApi.get(nodeId)
        setEvidenceStatus({
          evidence: evidenceResponse.data.evidence || [],
          count: evidenceResponse.data.count || 0,
          is_thin: evidenceResponse.data.is_thin || false,
          warning: evidenceResponse.data.warning,
        })
        // Load branches
        try {
          const branchesResponse = await draftingApi.listBranches(nodeId)
          const branchList = branchesResponse.data.branches || []
          setBranches(branchList)
          // Default to first branch or "Main" (null)
          if (branchList.length > 0 && !activeBranchId) {
            setActiveBranchId(branchList[0].id)
          } else {
            setActiveBranchId(null) // "Main" branch
          }
        } catch (error) {
          console.error('Failed to load branches:', error)
          setBranches([])
          setActiveBranchId(null)
        }
        
        // Load draft if it exists (for active branch)
        try {
          const draftResponse = await draftingApi.get(nodeId, activeBranchId || undefined)
          setDraft(draftResponse.data.draft_text || '')
          setDraftId(draftResponse.data.draft_id || null)
          setDraftVersion(draftResponse.data.draft_version || null)
          setDraftStatus(draftResponse.data.status || null)
        } catch (error: any) {
          // No draft found is OK
          if (error.response?.status !== 404) {
            console.error('Failed to load draft:', error)
          }
          setDraft('')
          setDraftId(null)
          setDraftVersion(null)
          setDraftStatus(null)
        }
        setContinuityFlags(null)
        setStyleDrift(null)
        setRecaps(null)
        setOverrideThinEvidence(false) // Reset override when switching nodes
        // Load heatmap
        await loadHeatmap()
        // Load draft list for diff viewer
        await loadDraftList()
      }
    } catch (error) {
      console.error('Failed to load node:', error)
    } finally {
      setLoading(false)
    }
  }

  async function generateSample() {
    if (!selectedNode) return
    setLoading(true)
    try {
      const response = await draftingApi.sample(selectedNode.id)
      setDraft(response.data.sample_text)
    } catch (error) {
      console.error('Failed to generate sample:', error)
      alert('Failed to generate sample')
    } finally {
      setLoading(false)
    }
  }

  async function generateDraft(force: boolean = false) {
    if (!selectedNode) return
    setLoading(true)
    try {
      const response = await draftingApi.draft(selectedNode.id, force, activeBranchId || undefined)
      setDraft(response.data.draft_text)
      setDraftId(response.data.section_id || null)
      // Draft version will be set when we reload the draft
      if (response.data.section_id) {
        try {
          const draftResponse = await draftingApi.get(selectedNode.id, activeBranchId || undefined)
          setDraftVersion(draftResponse.data.draft_version || null)
          setDraftStatus(draftResponse.data.status || null)
        } catch (e) {
          // Ignore
        }
      }
      if (response.data.word_count && response.data.word_target) {
        const diff = Math.abs(response.data.word_count - response.data.word_target)
        const percent = (diff / response.data.word_target) * 100
        if (percent > 15) {
          alert(
            `Word count warning: ${response.data.word_count} words (target: ${response.data.word_target}, ±15% = ${Math.round(response.data.word_target * 0.85)}-${Math.round(response.data.word_target * 1.15)})`
          )
        }
      }
      addToast('Draft generated!', 'success')
    } catch (error: any) {
      console.error('Failed to generate draft:', error)
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('Thin evidence')) {
        if (
          confirm(
            'Thin evidence detected. Draft may be low quality. Force generation anyway?'
          )
        ) {
          await generateDraft(true)
        }
      } else {
        addToast(error.response?.data?.detail || 'Failed to generate draft', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  async function saveDraft() {
    if (!selectedNode || !draft || !draftId) return
    if (draftStatus === 'locked') {
      addToast('Cannot save locked draft. Use "Create New Version" instead.', 'error')
      return
    }
    setLoading(true)
    try {
      await draftingApi.update(selectedNode.id, {
        draft_text: draft,
        create_new_version: false,
      })
      addToast('Draft saved!', 'success')
      // Reload draft to get updated version
      const draftResponse = await draftingApi.get(selectedNode.id, activeBranchId || undefined)
      setDraftVersion(draftResponse.data.draft_version || null)
      setDraftStatus(draftResponse.data.status || null)
    } catch (error: any) {
      console.error('Failed to save draft:', error)
      addToast(error.response?.data?.detail || 'Failed to save draft', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function createNewVersion() {
    if (!selectedNode || !draft) return
    setLoading(true)
    try {
      await draftingApi.update(selectedNode.id, {
        draft_text: draft,
        create_new_version: true,
      })
      addToast('New draft version created!', 'success')
      // Reload draft to get new version info
      const draftResponse = await draftingApi.get(selectedNode.id, activeBranchId || undefined)
      setDraft(draftResponse.data.draft_text || '')
      setDraftId(draftResponse.data.draft_id || null)
      setDraftVersion(draftResponse.data.draft_version || null)
      setDraftStatus(draftResponse.data.status || null)
    } catch (error: any) {
      console.error('Failed to create new version:', error)
      addToast(error.response?.data?.detail || 'Failed to create new version', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function checkContinuity() {
    if (!selectedNode || !draft) return
    setLoading(true)
    try {
      const response = await draftingApi.continuityCheck(selectedNode.id, {
        check_contradictions: true,
        check_timeline: true,
        check_repetition: true,
        check_tone: true,
      })
      setContinuityFlags(response.data.continuity_check)
    } catch (error) {
      console.error('Failed to check continuity:', error)
      alert('Failed to check continuity')
    } finally {
      setLoading(false)
    }
  }

  async function approveDraft() {
    if (!selectedNode) return
    setLoading(true)
    try {
      await draftingApi.approve(selectedNode.id, true)
      alert('Draft approved')
      await loadOutline()
    } catch (error) {
      console.error('Failed to approve:', error)
      alert('Failed to approve')
    } finally {
      setLoading(false)
    }
  }

  async function lockSection() {
    if (!selectedNode) return
    if (!confirm('Lock this section into the final manuscript?')) return
    setLoading(true)
    try {
      const response = await draftingApi.lock(selectedNode.id, activeBranchId || undefined)
      setRecaps({
        chapter: response.data.chapter_recap,
        book: response.data.book_recap,
      })
      // Reload draft to get updated status
      try {
        const draftResponse = await draftingApi.get(selectedNode.id, activeBranchId || undefined)
        setDraftStatus(draftResponse.data.status || null)
        setDraftVersion(draftResponse.data.draft_version || null)
      } catch (e) {
        // Ignore
      }
      addToast('Section locked', 'success')
      await loadOutline()
      // Move to next unlocked node
      const unlocked = nodes.find((n: OutlineNode) => n.id !== selectedNode.id && n.status !== 'locked')
      if (unlocked) {
        selectNode(unlocked.id)
      }
    } catch (error) {
      console.error('Failed to lock:', error)
      addToast('Failed to lock section', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function checkStyleDrift() {
    if (!selectedNode) return
    setLoading(true)
    try {
      const response = await draftingApi.styleDrift(selectedNode.id)
      setStyleDrift(response.data)
    } catch (error: any) {
      console.error('Failed to check style drift:', error)
      if (error.response?.status === 404) {
        alert('No draft found. Please generate a draft first.')
      } else {
        alert('Failed to check style drift')
      }
    } finally {
      setLoading(false)
    }
  }

  async function retoneSection() {
    if (!selectedNode || !styleDrift) return
    setLoading(true)
    try {
      const response = await draftingApi.retone(selectedNode.id, true) // Create new version
      setDraft(response.data.draft_text)
      setStyleDrift(null) // Clear drift after retone
      alert('Section retoned')
    } catch (error: any) {
      console.error('Failed to retone:', error)
      if (error.response?.status === 404) {
        alert('No draft found. Please generate a draft first.')
      } else {
        alert('Failed to retone section')
      }
    } finally {
      setLoading(false)
    }
  }

  async function loadHeatmap() {
    if (!selectedNode) return
    try {
      const response = await draftingApi.heatmap(selectedNode.id)
      setHeatmap(response.data.heatmap)
    } catch (error) {
      console.error('Failed to load heatmap:', error)
      setHeatmap(null)
    }
  }

  async function searchEvidence() {
    if (!selectedNode || !searchQuery.trim()) return
    try {
      const response = await evidenceApi.search(selectedNode.id, searchQuery)
      setSearchResults(response.data.results || [])
    } catch (error) {
      console.error('Failed to search evidence:', error)
    }
  }

  async function attachEvidence(chunkId: string) {
    if (!selectedNode) return
    setLoading(true)
    try {
      await evidenceApi.attach(selectedNode.id, chunkId, 1.0)
      addToast('Evidence attached!', 'success')
      await selectNode(selectedNode.id) // Reload evidence
      setShowEvidenceSearch(false)
      setSearchQuery('')
      setSearchResults([])
    } catch (error) {
      console.error('Failed to attach evidence:', error)
      addToast('Failed to attach evidence', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function detachEvidence(linkId: string) {
    if (!selectedNode || !linkId) return
    setLoading(true)
    try {
      await evidenceApi.detach(selectedNode.id, linkId)
      addToast('Evidence detached!', 'success')
      await selectNode(selectedNode.id) // Reload evidence
    } catch (error) {
      console.error('Failed to detach evidence:', error)
      addToast('Failed to detach evidence', 'error')
    } finally {
      setLoading(false)
    }
  }

  const canDraft = evidenceStatus && (!evidenceStatus.is_thin || evidenceStatus.count >= 3 || overrideThinEvidence)
  
  function handleDraftClick() {
    if (evidenceStatus?.is_thin && evidenceStatus.count < 3 && !overrideThinEvidence) {
      setShowOverrideModal(true)
    } else {
      generateDraft(overrideThinEvidence)
    }
  }
  
  function confirmOverride() {
    setOverrideThinEvidence(true)
    setShowOverrideModal(false)
    generateDraft(true)
  }

  async function createBranch() {
    if (!selectedNode || !newBranchLabel.trim()) return
    setLoading(true)
    try {
      const response = await draftingApi.createBranch(selectedNode.id, newBranchLabel.trim())
      setBranches([...branches, response.data])
      setActiveBranchId(response.data.id)
      setNewBranchLabel('')
      setShowNewBranchModal(false)
      addToast('Branch created!', 'success')
      // Reload draft for new branch
      await selectNode(selectedNode.id)
    } catch (error: any) {
      console.error('Failed to create branch:', error)
      addToast(error.response?.data?.detail || 'Failed to create branch', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleBranchChange(branchId: string | null) {
    setActiveBranchId(branchId)
    if (selectedNode) {
      // Reload draft for selected branch
      try {
        const draftResponse = await draftingApi.get(selectedNode.id, branchId || undefined)
        setDraft(draftResponse.data.draft_text || '')
        setDraftId(draftResponse.data.draft_id || null)
        setDraftVersion(draftResponse.data.draft_version || null)
        setDraftStatus(draftResponse.data.status || null)
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.error('Failed to load draft:', error)
          addToast('Failed to load draft', 'error')
        } else {
          // No draft in this branch yet
          setDraft('')
          setDraftId(null)
          setDraftVersion(null)
          setDraftStatus(null)
        }
      }
      // Reload draft list for diff viewer
      await loadDraftList()
    }
  }

  async function loadDraftList() {
    if (!selectedNode) return
    try {
      const response = await draftingApi.listDrafts(selectedNode.id, activeBranchId || undefined)
      setDraftList(response.data.drafts || [])
    } catch (error) {
      console.error('Failed to load draft list:', error)
    }
  }

  async function showDiff() {
    if (!selectedNode || !selectedDraft1 || !selectedDraft2) return
    if (selectedDraft1 === selectedDraft2) {
      addToast('Please select two different drafts', 'warning')
      return
    }
    setLoading(true)
    try {
      // Fetch both drafts from the list (listDrafts returns full draft_text)
      const draftsResponse = await draftingApi.listDrafts(selectedNode.id, activeBranchId || undefined)
      const draft1 = draftsResponse.data.drafts.find((d: any) => d.id === selectedDraft1)
      const draft2 = draftsResponse.data.drafts.find((d: any) => d.id === selectedDraft2)
      
      if (!draft1 || !draft2) {
        addToast('Could not find selected drafts', 'error')
        return
      }
      
      // Use diff library to compute diff
      const Diff = await import('diff')
      const diff = Diff.diffLines(draft1.draft_text || '', draft2.draft_text || '')
      setDiffResult(diff)
    } catch (error: any) {
      console.error('Failed to compute diff:', error)
      addToast('Failed to compute diff', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 200px)', gap: '1rem' }}>
      {/* Left: Outline Tree */}
      <div style={{ width: '250px', borderRight: '1px solid #ddd', overflow: 'auto' }}>
        <h3>Outline</h3>
        <div>
          {nodes.map((node: OutlineNode) => (
            <div
              key={node.id}
              onClick={() => selectNode(node.id)}
              style={{
                padding: '0.5rem',
                cursor: 'pointer',
                background: selectedNode?.id === node.id ? '#e3f2fd' : 'transparent',
                borderLeft:
                  selectedNode?.id === node.id ? '3px solid #2196F3' : '3px solid transparent',
              }}
            >
              <div style={{ fontWeight: selectedNode?.id === node.id ? 'bold' : 'normal' }}>
                {node.order_index}. {node.title}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                {node.status === 'locked' ? '🔒 Locked' : node.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center: Draft Editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Branch Selector */}
        {selectedNode && (
          <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#f5f5f5', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontWeight: 'bold' }}>Branch:</label>
            <select
              value={activeBranchId || ''}
              onChange={(e) => handleBranchChange(e.target.value || null)}
              style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="">Main</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowNewBranchModal(true)}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              disabled={loading}
            >
              + New Branch
            </button>
          </div>
        )}
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={generateSample} disabled={loading || !selectedNode}>
            Generate Sample
          </button>
          <button
            onClick={handleDraftClick}
            disabled={loading || !selectedNode}
            style={{
              background: evidenceStatus?.is_thin && evidenceStatus.count < 3 && !overrideThinEvidence
                ? '#ff9800'
                : undefined,
            }}
            title={
              evidenceStatus?.is_thin && evidenceStatus.count < 3 && !overrideThinEvidence
                ? 'Thin evidence warning. Click to override or add more sources.'
                : overrideThinEvidence
                ? 'Override enabled - drafting with thin evidence'
                : ''
            }
          >
            Draft Full Section
            {overrideThinEvidence && ' (Override)'}
          </button>
          {evidenceStatus?.is_thin && evidenceStatus.count < 3 && overrideThinEvidence && (
            <button
              onClick={() => setOverrideThinEvidence(false)}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
            >
              Clear Override
            </button>
          )}
          <button onClick={checkContinuity} disabled={loading || !selectedNode || !draft}>
            Check Continuity
          </button>
          <button onClick={checkStyleDrift} disabled={loading || !selectedNode}>
            Check Style Drift
          </button>
          <button onClick={approveDraft} disabled={loading || !selectedNode || !draft}>
            Approve
          </button>
          <button
            onClick={lockSection}
            disabled={loading || !selectedNode || selectedNode.status === 'locked'}
            style={{ marginLeft: 'auto', background: '#4CAF50', color: 'white' }}
          >
            Lock Section
          </button>
          <button
            onClick={() => {
              loadDraftList()
              setShowDiffViewer(true)
            }}
            disabled={loading || !selectedNode || draftList.length < 2}
            title={draftList.length < 2 ? 'Need at least 2 drafts to compare' : 'Compare two drafts'}
            style={{ marginLeft: '0.5rem' }}
          >
            Compare Drafts
          </button>
        </div>

        {/* Diff Viewer Modal */}
        {showDiffViewer && (
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
              minWidth: '600px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
          >
            <h3 style={{ marginTop: 0 }}>Compare Drafts</h3>
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Draft 1:</label>
                <select
                  value={selectedDraft1 || ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedDraft1(e.target.value || null)}
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  <option value="">Select draft...</option>
                  {draftList.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      Version {d.draft_version} ({new Date(d.created_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Draft 2:</label>
                <select
                  value={selectedDraft2 || ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedDraft2(e.target.value || null)}
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  <option value="">Select draft...</option>
                  {draftList.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      Version {d.draft_version} ({new Date(d.created_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                onClick={showDiff}
                disabled={!selectedDraft1 || !selectedDraft2 || selectedDraft1 === selectedDraft2 || loading}
                style={{ background: '#2196F3', color: 'white' }}
              >
                Show Diff
              </button>
              <button onClick={() => { setShowDiffViewer(false); setDiffResult(null); setSelectedDraft1(null); setSelectedDraft2(null) }}>
                Close
              </button>
            </div>
            {diffResult && (
              <div
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '1rem',
                  background: '#f9f9f9',
                  maxHeight: '60vh',
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {diffResult.map((part: any, idx: number) => {
                  const color = part.added ? '#4CAF50' : part.removed ? '#f44336' : '#666'
                  const background = part.added ? '#e8f5e9' : part.removed ? '#ffebee' : 'transparent'
                  return (
                    <span key={idx} style={{ color, background, padding: '0.1rem 0' }}>
                      {part.value}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* New Branch Modal */}
        {showNewBranchModal && (
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
              minWidth: '300px',
            }}
          >
            <h3>Create New Branch</h3>
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Branch Label:</label>
              <input
                type="text"
                value={newBranchLabel}
                onChange={(e) => setNewBranchLabel(e.target.value)}
                placeholder="e.g., Alternative Ending"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newBranchLabel.trim()) {
                    createBranch()
                  }
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button onClick={() => { setShowNewBranchModal(false); setNewBranchLabel('') }}>Cancel</button>
              <button
                onClick={createBranch}
                disabled={!newBranchLabel.trim() || loading}
                style={{ background: '#2196F3', color: 'white' }}
              >
                Create
              </button>
            </div>
          </div>
        )}

        {/* Override Confirmation Modal */}
        {showOverrideModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
            }}
            onClick={() => setShowOverrideModal(false)}
          >
            <div
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '8px',
                maxWidth: '500px',
                zIndex: 10001,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ marginTop: 0 }}>⚠️ Thin Evidence Warning</h3>
              <p>
                This section has only {evidenceStatus?.count || 0} evidence chunks (recommended: 3+).
                Drafting with thin evidence may result in hallucinations or inaccurate content.
              </p>
              <p style={{ fontWeight: 'bold' }}>Are you sure you want to proceed?</p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  onClick={confirmOverride}
                  style={{
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Yes, Override & Draft
                </button>
                <button
                  onClick={() => setShowOverrideModal(false)}
                  style={{
                    background: '#e0e0e0',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {continuityFlags && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '1rem',
              background: continuityFlags.overall_ok ? '#e8f5e9' : '#fff3e0',
              border: `1px solid ${continuityFlags.overall_ok ? '#4CAF50' : '#ff9800'}`,
              borderRadius: '4px',
            }}
          >
            <h4 style={{ marginTop: 0 }}>Continuity Check</h4>
            {continuityFlags.contradictions?.length > 0 && (
              <div>
                <strong>Contradictions:</strong>
                <ul>
                  {continuityFlags.contradictions.map((c: string, i: number) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
            {continuityFlags.timeline_issues?.length > 0 && (
              <div>
                <strong>Timeline Issues:</strong>
                <ul>
                  {continuityFlags.timeline_issues.map((t: string, i: number) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
            {continuityFlags.repetitions?.length > 0 && (
              <div>
                <strong>Repetitions:</strong>
                <ul>
                  {continuityFlags.repetitions.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            {continuityFlags.tone_mismatches?.length > 0 && (
              <div>
                <strong>Tone Mismatches:</strong>
                <ul>
                  {continuityFlags.tone_mismatches.map((t: string, i: number) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
            {continuityFlags.overall_ok && (
              <div style={{ color: '#4CAF50', fontWeight: 'bold' }}>✓ Overall OK</div>
            )}
          </div>
        )}

        {styleDrift && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '1rem',
              background: styleDrift.drift_score <= 0.3 ? '#e8f5e9' : styleDrift.drift_score <= 0.6 ? '#fff3e0' : '#ffebee',
              border: `1px solid ${styleDrift.drift_score <= 0.3 ? '#4CAF50' : styleDrift.drift_score <= 0.6 ? '#ff9800' : '#f44336'}`,
              borderRadius: '4px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ marginTop: 0 }}>Style Drift Analysis</h4>
              <button onClick={retoneSection} disabled={loading} style={{ background: '#2196F3', color: 'white' }}>
                Re-tone This Section
              </button>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Drift Score:</strong> {(styleDrift.drift_score * 10).toFixed(1)}/10{' '}
              {styleDrift.drift_score <= 0.3 ? '✓' : styleDrift.drift_score <= 0.6 ? '⚠' : '✗'}
            </div>
            {styleDrift.overall_assessment && (
              <div style={{ marginBottom: '0.5rem' }}>{styleDrift.overall_assessment}</div>
            )}
            {styleDrift.drift_issues && styleDrift.drift_issues.length > 0 && (
              <div>
                <strong>Issues:</strong>
                <ul>
                  {styleDrift.drift_issues.map((issue: any, i: number) => (
                    <li key={i}>
                      <strong>{issue.type}</strong> ({issue.severity}): {issue.description}
                      {issue.example && (
                        <div style={{ fontSize: '0.875rem', color: '#666', marginLeft: '1rem', fontStyle: 'italic' }}>
                          "{issue.example}"
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {recaps && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '1rem',
              background: '#e3f2fd',
              border: '1px solid #2196F3',
              borderRadius: '4px',
            }}
          >
            <h4 style={{ marginTop: 0 }}>Recaps Generated</h4>
            {recaps.chapter && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Chapter Recap:</strong>
                <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'white', borderRadius: '4px' }}>
                  {recaps.chapter}
                </div>
              </div>
            )}
            {recaps.book && (
              <div>
                <strong>Book Recap:</strong>
                <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'white', borderRadius: '4px' }}>
                  {recaps.book}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ flex: 1 }}>
          {selectedNode ? (
            <>
              <h3>{selectedNode.title}</h3>
              {evidenceStatus?.is_thin && (
                <div
                  style={{
                    padding: '0.5rem',
                    background: '#ffebee',
                    border: '1px solid #f44336',
                    borderRadius: '4px',
                    marginBottom: '1rem',
                    fontSize: '0.875rem',
                  }}
                >
                  ⚠ {evidenceStatus.warning || 'Thin evidence. Add sources or edit goal.'}
                </div>
              )}
              {draftStatus === 'locked' && (
                <div
                  style={{
                    padding: '0.5rem',
                    background: '#fff3e0',
                    border: '1px solid #ff9800',
                    borderRadius: '4px',
                    marginBottom: '1rem',
                    fontSize: '0.875rem',
                  }}
                >
                  🔒 This draft is locked. To make changes, create a new version.
                  {draftVersion && <span> (Version {draftVersion})</span>}
                </div>
              )}
              {draftVersion && draftStatus !== 'locked' && (
                <div
                  style={{
                    padding: '0.5rem',
                    background: '#e3f2fd',
                    border: '1px solid #2196F3',
                    borderRadius: '4px',
                    marginBottom: '1rem',
                    fontSize: '0.875rem',
                  }}
                >
                  Draft Version {draftVersion} • Status: {draftStatus || 'drafted'}
                </div>
              )}
              <textarea
                value={draft}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraft(e.target.value)}
                placeholder="Draft will appear here..."
                disabled={draftStatus === 'locked'}
                style={{
                  width: '100%',
                  height: '100%',
                  padding: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                  backgroundColor: draftStatus === 'locked' ? '#f5f5f5' : 'white',
                  cursor: draftStatus === 'locked' ? 'not-allowed' : 'text',
                }}
              />
              {draft && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {draftStatus === 'locked' ? (
                    <button
                      onClick={createNewVersion}
                      disabled={loading}
                      style={{
                        background: '#ff9800',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Create New Version
                    </button>
                  ) : (
                    <button
                      onClick={saveDraft}
                      disabled={loading || !draftId}
                      style={{
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: loading || !draftId ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Save Changes
                    </button>
                  )}
                  {draftStatus !== 'locked' && (
                    <button
                      onClick={createNewVersion}
                      disabled={loading}
                      style={{
                        background: '#2196F3',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Create New Version
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div>Select a section from the outline</div>
          )}
        </div>
      </div>

      {/* Right: Evidence Panel */}
      <div style={{ width: '300px', borderLeft: '1px solid #ddd', overflow: 'auto' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>
          <h3 style={{ marginTop: 0 }}>Evidence</h3>
          <button
            onClick={() => setShowEvidenceSearch(!showEvidenceSearch)}
            style={{ width: '100%', marginBottom: '0.5rem' }}
          >
            {showEvidenceSearch ? 'Hide' : 'Search & Attach'}
          </button>
        </div>

        {heatmap && (
          <div style={{ padding: '1rem', borderBottom: '1px solid #ddd', background: '#f5f5f5' }}>
            <h4 style={{ marginTop: 0, fontSize: '1rem' }}>Narrative Heatmap</h4>
            <div style={{ fontSize: '0.875rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Evidence Density:</strong> {heatmap.evidence_count} chunks{' '}
                ({(heatmap.evidence_density * 100).toFixed(0)}%)
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    background: '#e0e0e0',
                    borderRadius: '4px',
                    marginTop: '0.25rem',
                  }}
                >
                  <div
                    style={{
                      width: `${heatmap.evidence_density * 100}%`,
                      height: '100%',
                      background: heatmap.evidence_density >= 0.7 ? '#4CAF50' : heatmap.evidence_density >= 0.4 ? '#ff9800' : '#f44336',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Emotional Intensity:</strong> {(heatmap.emotional_intensity * 100).toFixed(0)}%
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    background: '#e0e0e0',
                    borderRadius: '4px',
                    marginTop: '0.25rem',
                  }}
                >
                  <div
                    style={{
                      width: `${heatmap.emotional_intensity * 100}%`,
                      height: '100%',
                      background: '#2196F3',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Topic Coverage:</strong> {(heatmap.topic_coverage * 100).toFixed(0)}%
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    background: '#e0e0e0',
                    borderRadius: '4px',
                    marginTop: '0.25rem',
                  }}
                >
                  <div
                    style={{
                      width: `${heatmap.topic_coverage * 100}%`,
                      height: '100%',
                      background: heatmap.topic_coverage >= 0.7 ? '#4CAF50' : heatmap.topic_coverage >= 0.4 ? '#ff9800' : '#f44336',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {showEvidenceSearch && (
          <div style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              placeholder="Search chunks..."
              style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && searchEvidence()}
            />
            <button onClick={searchEvidence} style={{ width: '100%' }}>
              Search
            </button>
            {searchResults.length > 0 && (
              <div style={{ marginTop: '1rem', maxHeight: '200px', overflow: 'auto' }}>
                {searchResults.map((result: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #eee',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      {result.raw_title}
                    </div>
                    {result.relevance_score !== undefined && (
                      <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>
                        Relevance: {(1 - result.relevance_score).toFixed(3)}
                      </div>
                    )}
                    <div style={{ color: '#666', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                      {result.chunk_text}
                    </div>
                    <button
                      onClick={() => attachEvidence(result.chunk_id)}
                      style={{ width: '100%', fontSize: '0.75rem' }}
                    >
                      Attach
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {evidenceStatus && evidenceStatus.evidence.length === 0 ? (
          <p style={{ padding: '1rem', color: '#666' }}>No evidence mapped yet</p>
        ) : (
          <div>
            {evidenceStatus?.evidence.map((ev: Evidence, idx: number) => (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid #eee',
                  fontSize: '0.875rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 'bold' }}>
                    {ev.raw_title} {ev.manual_link && <span style={{ color: '#2196F3', fontSize: '0.75rem' }}>(Manual)</span>}
                  </div>
                  {ev.link_id && (
                    <button
                      onClick={() => detachEvidence(ev.link_id!)}
                      disabled={loading}
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                      }}
                      title="Detach evidence"
                    >
                      {loading ? <LoadingSpinner /> : '×'}
                    </button>
                  )}
                </div>
                <div style={{ color: '#666', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  Score: {ev.relevance_score.toFixed(3)}
                </div>
                <div style={{ color: '#666', maxHeight: '150px', overflow: 'auto' }}>
                  {ev.chunk_text.substring(0, 200)}...
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
