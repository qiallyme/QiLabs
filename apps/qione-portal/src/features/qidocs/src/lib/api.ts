/**
 * QiNote v2.0 - API Client
 * Generic API client for /notes, /ingest, /query, /gina/note_assist
 */

import type {
  Note,
  CreateNoteRequest,
  UpdateNoteRequest,
  IngestRequest,
  IngestResponse,
  IngestStatus,
  QueryRequest,
  QueryResponse,
  NoteAssistRequest,
  NoteAssistResponse,
} from '../types/note';

const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'http://localhost:7130';
const INGEST_WORKER_URL = import.meta.env.VITE_INGEST_WORKER_URL || WORKER_URL;
const MEMORY_WORKER_URL = import.meta.env.VITE_MEMORY_WORKER_URL || WORKER_URL;

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(`API error: ${response.status} ${response.statusText} - ${error.detail || 'Unknown error'}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to backend at ${url}. Make sure the server is running.`);
    }
    throw error;
  }
}

// Notes API
export const notesApi = {
  create: async (data: CreateNoteRequest): Promise<Note> => {
    return fetchJson<Note>(`${WORKER_URL}/notes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  get: async (id: string): Promise<Note> => {
    return fetchJson<Note>(`${WORKER_URL}/notes/${id}`);
  },

  update: async (id: string, data: UpdateNoteRequest): Promise<Note> => {
    return fetchJson<Note>(`${WORKER_URL}/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  list: async (params?: { realm?: string; tag?: string; q?: string }): Promise<Note[]> => {
    const searchParams = new URLSearchParams();
    if (params?.realm) searchParams.set('realm', params.realm);
    if (params?.tag) searchParams.set('tag', params.tag);
    if (params?.q) searchParams.set('q', params.q);
    
    const query = searchParams.toString();
    return fetchJson<Note[]>(`${WORKER_URL}/notes${query ? `?${query}` : ''}`);
  },
};

// Ingestion API
export const ingestApi = {
  ingest: async (data: IngestRequest): Promise<IngestResponse> => {
    return fetchJson<IngestResponse>(`${INGEST_WORKER_URL}/ingest`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getStatus: async (ingestionId: string): Promise<IngestStatus> => {
    const response = await fetchJson<any>(`${INGEST_WORKER_URL}/ingest/${ingestionId}`);
    // Map backend IngestStatusResponse to frontend IngestStatus format
    // Backend returns: id, file_path, status, slug, realm, created_at, updated_at, error
    // Frontend expects: ingestion_id, status, error_message, started_at, completed_at
    return {
      ingestion_id: response.id,
      status: response.status || 'queued',
      error_message: response.error || null,
      started_at: response.created_at || null,
      completed_at: response.updated_at || null,
    };
  },
};

// Query API
export const queryApi = {
  query: async (data: QueryRequest): Promise<QueryResponse> => {
    return fetchJson<QueryResponse>(`${MEMORY_WORKER_URL}/query`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Note Assist API
export const noteAssistApi = {
  assist: async (data: NoteAssistRequest): Promise<NoteAssistResponse> => {
    return fetchJson<NoteAssistResponse>(`${WORKER_URL}/gina/note_assist`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

