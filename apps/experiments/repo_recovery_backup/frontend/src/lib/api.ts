import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });
  if (res.status === 204) return {} as T;
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Matters
  listMatters: () => request<any[]>('/api/matters'),
  getMatter: (id: string) => request<any>(`/api/matters/${id}`),
  createMatter: (data: any) => request<any>('/api/matters', { method: 'POST', body: JSON.stringify(data) }),
  updateMatter: (id: string, data: any) => request<any>(`/api/matters/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteMatter: (id: string) => request<void>(`/api/matters/${id}`, { method: 'DELETE' }),

  // Facts
  listFacts: (mid: string) => request<any[]>(`/api/matters/${mid}/facts`),
  createFact: (mid: string, data: any) => request<any>(`/api/matters/${mid}/facts`, { method: 'POST', body: JSON.stringify(data) }),
  updateFact: (mid: string, id: string, data: any) => request<any>(`/api/matters/${mid}/facts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteFact: (mid: string, id: string) => request<void>(`/api/matters/${mid}/facts/${id}`, { method: 'DELETE' }),

  // Evidence
  listEvidence: (mid: string) => request<any[]>(`/api/matters/${mid}/evidence`),
  createEvidence: (mid: string, data: any) => request<any>(`/api/matters/${mid}/evidence`, { method: 'POST', body: JSON.stringify(data) }),
  updateEvidence: (mid: string, id: string, data: any) => request<any>(`/api/matters/${mid}/evidence/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteEvidence: (mid: string, id: string) => request<void>(`/api/matters/${mid}/evidence/${id}`, { method: 'DELETE' }),

  // Tasks
  listTasks: (mid: string) => request<any[]>(`/api/matters/${mid}/tasks`),
  createTask: (mid: string, data: any) => request<any>(`/api/matters/${mid}/tasks`, { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (mid: string, id: string, data: any) => request<any>(`/api/matters/${mid}/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (mid: string, id: string) => request<void>(`/api/matters/${mid}/tasks/${id}`, { method: 'DELETE' }),

  // Deadlines
  listDeadlines: (mid: string) => request<any[]>(`/api/matters/${mid}/deadlines`),
  createDeadline: (mid: string, data: any) => request<any>(`/api/matters/${mid}/deadlines`, { method: 'POST', body: JSON.stringify(data) }),
  updateDeadline: (mid: string, id: string, data: any) => request<any>(`/api/matters/${mid}/deadlines/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteDeadline: (mid: string, id: string) => request<void>(`/api/matters/${mid}/deadlines/${id}`, { method: 'DELETE' }),

  // Timeline
  listTimeline: (mid: string) => request<any[]>(`/api/matters/${mid}/timeline`),
  createTimelineEvent: (mid: string, data: any) => request<any>(`/api/matters/${mid}/timeline`, { method: 'POST', body: JSON.stringify(data) }),
  deleteTimelineEvent: (mid: string, id: string) => request<void>(`/api/matters/${mid}/timeline/${id}`, { method: 'DELETE' }),

  // Witnesses
  listWitnesses: (mid: string) => request<any[]>(`/api/matters/${mid}/witnesses`),
  createWitness: (mid: string, data: any) => request<any>(`/api/matters/${mid}/witnesses`, { method: 'POST', body: JSON.stringify(data) }),
  updateWitness: (mid: string, id: string, data: any) => request<any>(`/api/matters/${mid}/witnesses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteWitness: (mid: string, id: string) => request<void>(`/api/matters/${mid}/witnesses/${id}`, { method: 'DELETE' }),

  // Documents
  listDocuments: (mid: string) => request<any[]>(`/api/matters/${mid}/documents`),

  // Files
  listFiles: (mid: string) => request<any[]>(`/api/matters/${mid}/files`),
  uploadFile: async (mid: string, file: File, category = 'inbox') => {
    const headers: Record<string, string> = {};
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      headers['Authorization'] = `Bearer ${data.session.access_token}`;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    const res = await fetch(`${API_BASE}/api/matters/${mid}/files/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },

  // Search
  search: (mid: string, q: string) => request<any>(`/api/matters/${mid}/search?q=${encodeURIComponent(q)}`),

  // Agent
  agentAsk: (mid: string, query: string) =>
    request<{ response: string; intent: string; source: string }>(`/api/matters/${mid}/agent/ask`, {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),
};
