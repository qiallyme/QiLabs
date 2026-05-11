import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { booksApi, engineApi } from '../lib/api'
import { showToast } from '../components/Toast'
import LoadingSpinner from '../components/LoadingSpinner'

const STYLE_PRESETS = {
  'candid_memoir': 'Candid, introspective memoir tone. Short, emotional sentences. No academic wording. Personal and vulnerable.',
  'literary_nonfiction': 'Literary nonfiction style. Rich, descriptive prose. Longer sentences with varied structure. Thoughtful and reflective.',
  'journalistic': 'Clear, direct journalistic style. Short paragraphs. Fact-focused. Accessible to general readers.',
  'narrative_storytelling': 'Narrative storytelling style. Scene-driven. Dialogue and action. Show, don\'t tell. Engaging and immersive.',
  'academic': 'Academic tone. Formal but clear. Evidence-based. Structured arguments. Suitable for scholarly audience.',
}

export default function BookWizard() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [book, setBook] = useState<any>(null)
  const [step, setStep] = useState<'create' | 'analyze' | 'interview' | 'outline'>('create')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    working_title: '',
    focus: '',
    purpose: '',
    audience: '',
    length_target_words: 50000,
    chapter_count: 10,
    style_anchor: '',
  })

  useEffect(() => {
    if (id) {
      loadBook()
      checkState()
    }
  }, [id])

  async function loadBook() {
    if (!id) return
    try {
      const response = await booksApi.get(id)
      setBook(response.data)
      if (response.data.style_anchor) {
        setFormData(prev => ({ ...prev, style_anchor: response.data.style_anchor }))
      }
      if (response.data.status === 'outlining') {
        setStep('outline')
      }
    } catch (error) {
      console.error('Failed to load book:', error)
      showToast('Failed to load book', 'error')
    }
  }

  async function checkState() {
    if (!id) return
    try {
      const state = await engineApi.getState(id)
      const currentState = state.data.current_state
      if (currentState === 'ANALYZING' || currentState === 'INTERVIEWING') {
        setStep('interview')
      } else if (currentState === 'OUTLINING' || currentState === 'OUTLINE_APPROVAL') {
        setStep('outline')
      }
    } catch (error) {
      // No state yet
    }
  }

  async function createBook() {
    setLoading(true)
    try {
      const response = await booksApi.create(formData)
      showToast('Book created successfully', 'success')
      navigate(`/books/${response.data.id}/wizard`)
    } catch (error) {
      console.error('Failed to create book:', error)
      showToast('Failed to create book', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function updateStyleAnchor() {
    if (!id) return
    setLoading(true)
    try {
      await booksApi.update(id, { style_anchor: formData.style_anchor })
      showToast('Style anchor updated', 'success')
    } catch (error) {
      console.error('Failed to update style anchor:', error)
      showToast('Failed to update style anchor', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function runAnalysis() {
    if (!id) return
    setLoading(true)
    try {
      await engineApi.run(id, 'INTERVIEWING')
      setStep('interview')
      showToast('Analysis complete', 'success')
    } catch (error) {
      console.error('Analysis failed:', error)
      showToast('Analysis failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function generateOutline() {
    if (!id) return
    setLoading(true)
    try {
      await engineApi.run(id, 'OUTLINE_APPROVAL')
      setStep('outline')
      showToast('Outline generated', 'success')
      navigate(`/books/${id}/outline`)
    } catch (error) {
      console.error('Outline generation failed:', error)
      showToast('Outline generation failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'create') {
    return (
      <div style={{ maxWidth: '600px' }}>
        <h1>Create New Book</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label>Working Title</label>
            <input
              type="text"
              value={formData.working_title}
              onChange={(e) => setFormData({ ...formData, working_title: e.target.value })}
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          <div>
            <label>Focus</label>
            <textarea
              value={formData.focus}
              onChange={(e) => setFormData({ ...formData, focus: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', minHeight: '100px' }}
            />
          </div>
          <div>
            <label>Purpose</label>
            <textarea
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', minHeight: '100px' }}
            />
          </div>
          <div>
            <label>Target Audience</label>
            <input
              type="text"
              value={formData.audience}
              onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div>
              <label>Target Words</label>
              <input
                type="number"
                value={formData.length_target_words}
                onChange={(e) =>
                  setFormData({ ...formData, length_target_words: parseInt(e.target.value) })
                }
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
            <div>
              <label>Chapters</label>
              <input
                type="number"
                value={formData.chapter_count}
                onChange={(e) =>
                  setFormData({ ...formData, chapter_count: parseInt(e.target.value) })
                }
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
          </div>
          <div>
            <label>
              Writing Style Anchor
              <span style={{ fontSize: '0.875rem', color: '#666', marginLeft: '0.5rem' }}>
                (Optional - helps maintain consistent tone)
              </span>
            </label>
            <div style={{ marginBottom: '0.5rem' }}>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    setFormData({ ...formData, style_anchor: STYLE_PRESETS[e.target.value as keyof typeof STYLE_PRESETS] })
                  }
                }}
                style={{ width: '100%', padding: '0.5rem' }}
              >
                <option value="">Choose a preset style...</option>
                <option value="candid_memoir">Candid Memoir</option>
                <option value="literary_nonfiction">Literary Nonfiction</option>
                <option value="journalistic">Journalistic</option>
                <option value="narrative_storytelling">Narrative Storytelling</option>
                <option value="academic">Academic</option>
              </select>
            </div>
            <textarea
              value={formData.style_anchor}
              onChange={(e) => setFormData({ ...formData, style_anchor: e.target.value })}
              placeholder="Describe your writing style, or choose a preset above..."
              style={{ width: '100%', padding: '0.5rem', minHeight: '100px' }}
            />
          </div>
          <button onClick={createBook} disabled={loading || !formData.working_title}>
            {loading ? <LoadingSpinner size="small" /> : 'Create Book'}
          </button>
        </div>
      </div>
    )
  }

  if (!book) {
    return <div><LoadingSpinner message="Loading book..." /></div>
  }

  return (
    <div>
      <h1>{book.working_title}</h1>
      
      {/* Style Anchor Editor (always visible if book exists) */}
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h3>Writing Style Anchor</h3>
        <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
          This style guide will be automatically included in all draft prompts to maintain consistency.
        </p>
        <div style={{ marginBottom: '0.5rem' }}>
          <select
            onChange={(e) => {
              if (e.target.value) {
                setFormData({ ...formData, style_anchor: STYLE_PRESETS[e.target.value as keyof typeof STYLE_PRESETS] })
              }
            }}
            style={{ width: '100%', padding: '0.5rem' }}
          >
            <option value="">Choose a preset style...</option>
            <option value="candid_memoir">Candid Memoir</option>
            <option value="literary_nonfiction">Literary Nonfiction</option>
            <option value="journalistic">Journalistic</option>
            <option value="narrative_storytelling">Narrative Storytelling</option>
            <option value="academic">Academic</option>
          </select>
        </div>
        <textarea
          value={formData.style_anchor}
          onChange={(e) => setFormData({ ...formData, style_anchor: e.target.value })}
          placeholder="Describe your writing style, or choose a preset above..."
          style={{ width: '100%', padding: '0.5rem', minHeight: '100px', marginBottom: '0.5rem' }}
        />
        <button onClick={updateStyleAnchor} disabled={loading || !formData.style_anchor}>
          {loading ? <LoadingSpinner size="small" /> : 'Update Style Anchor'}
        </button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        {step === 'analyze' && (
          <div>
            <p>Ready to analyze your raw data and extract themes.</p>
            <button onClick={runAnalysis} disabled={loading}>
              {loading ? <LoadingSpinner size="small" message="Analyzing..." /> : 'Run Analysis'}
            </button>
          </div>
        )}
        {step === 'interview' && (
          <div>
            <p>Analysis complete. Review the themes and proceed to outline generation.</p>
            <button onClick={generateOutline} disabled={loading}>
              {loading ? <LoadingSpinner size="small" message="Generating..." /> : 'Generate Outline'}
            </button>
          </div>
        )}
        {step === 'outline' && (
          <div>
            <p>Outline generated. Review and approve it.</p>
            <button onClick={() => navigate(`/books/${id}/outline`)}>
              Go to Outline Studio
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

