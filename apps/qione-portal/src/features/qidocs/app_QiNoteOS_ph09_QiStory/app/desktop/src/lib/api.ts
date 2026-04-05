/** API client for backend. */
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api

// Raw Items
export const rawItemsApi = {
  list: () => api.get('/raw-items'),
  get: (id: string) => api.get(`/raw-items/${id}`),
  upload: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/raw-items/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  paste: (text: string, title?: string) =>
    api.post('/raw-items/paste', { text, title }),
  process: (itemId: string) => api.post(`/raw-items/${itemId}/process`),
  processAll: () => api.post('/raw-items/process-all'),
}

// Books
export const booksApi = {
  list: () => api.get('/books'),
  get: (id: string) => api.get(`/books/${id}`),
  create: (data: any) => api.post('/books', data),
  update: (id: string, data: any) => api.patch(`/books/${id}`, data),
}

// Outline
export const outlineApi = {
  generate: (bookId: string) => api.post(`/books/${bookId}/outline/generate`),
  get: (bookId: string) => api.get(`/books/${bookId}/outline`),
  updateNode: (nodeId: string, data: any) => api.patch(`/outline/${nodeId}`, data),
  reorder: (bookId: string, nodeIds: string[]) =>
    api.post(`/books/${bookId}/outline/reorder`, { node_ids: nodeIds }),
}

// Evidence
export const evidenceApi = {
  map: (bookId: string) => api.post(`/books/${bookId}/evidence/map`),
  get: (nodeId: string) => api.get(`/outline/${nodeId}/evidence`),
  search: (nodeId: string, query: string, topK: number = 10) =>
    api.post(`/outline/${nodeId}/evidence/search?query=${encodeURIComponent(query)}&top_k=${topK}`),
  attach: (nodeId: string, chunkId: string, relevanceScore?: number) =>
    api.post(`/outline/${nodeId}/evidence/attach`, { chunk_id: chunkId, relevance_score: relevanceScore }),
  detach: (nodeId: string, linkId: string) =>
    api.delete(`/outline/${nodeId}/evidence/${linkId}`),
}

// Drafting
export const draftingApi = {
  sample: (nodeId: string) => api.post(`/outline/${nodeId}/sample`),
  review: (nodeId: string, notes?: string) =>
    api.post(`/outline/${nodeId}/review`, { notes }),
  continuityCheck: (nodeId: string, options: any) =>
    api.post(`/outline/${nodeId}/continuity-check`, options),
  approve: (nodeId: string, approved: boolean, notes?: string) =>
    api.post(`/outline/${nodeId}/approve`, { approved, notes }),
  styleDrift: (nodeId: string) => api.post(`/outline/${nodeId}/style-check`),
  retone: (nodeId: string, createNewVersion: boolean = true) =>
    api.post(`/outline/${nodeId}/retone`, { create_new_version: createNewVersion }),
  heatmap: (nodeId: string) => api.get(`/outline/${nodeId}/heatmap`),
  getRecap: (bookId: string) => api.get(`/books/${bookId}/recap`),
  get: (nodeId: string, branchId?: string) => 
    api.get(`/outline/${nodeId}/draft${branchId ? `?branch_id=${branchId}` : ''}`),
  update: (nodeId: string, data: { draft_text: string; create_new_version?: boolean }) =>
    api.put(`/outline/${nodeId}/draft`, data),
  createBranch: (nodeId: string, label: string) =>
    api.post(`/outline/${nodeId}/branches`, { label }),
  listBranches: (nodeId: string) => api.get(`/outline/${nodeId}/branches`),
  listDrafts: (nodeId: string, branchId?: string) =>
    api.get(`/outline/${nodeId}/drafts${branchId ? `?branch_id=${branchId}` : ''}`),
  draft: (nodeId: string, force?: boolean, branchId?: string) =>
    api.post(`/outline/${nodeId}/draft?force=${force || false}${branchId ? `&branch_id=${branchId}` : ''}`),
  lock: (nodeId: string, branchId?: string) =>
    api.post(`/outline/${nodeId}/lock${branchId ? `?branch_id=${branchId}` : ''}`),
}

// Engine
export const engineApi = {
  run: (bookId: string, until: string) =>
    api.post(`/books/${bookId}/engine/run?until=${until}`),
  resume: (bookId: string) => api.post(`/books/${bookId}/engine/resume`),
  getState: (bookId: string) => api.get(`/books/${bookId}/engine/state`),
}

// Manuscript
export const manuscriptApi = {
  get: (bookId: string) => api.get(`/books/${bookId}/manuscript`),
  export: (bookId: string, format: string = 'markdown', template?: string) => {
    const body = { format, template }
    return api.post(`/books/${bookId}/export`, body, { responseType: 'blob' })
  },
  generateBackmatter: (bookId: string) => api.post(`/books/${bookId}/backmatter/generate`),
}

// System
export const systemApi = {
  status: () => api.get('/system/status'),
  testLLM: () => api.post('/system/test-llm'),
  testEmbeddings: () => api.post('/system/test-embeddings'),
}

// Project
export const projectApi = {
  pack: (bookId: string) => api.post(`/books/${bookId}/pack`, {}, { responseType: 'blob' }),
  import: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/books/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  rebuildEmbeddings: (bookId: string) => api.post(`/books/${bookId}/rebuild-embeddings`),
}

