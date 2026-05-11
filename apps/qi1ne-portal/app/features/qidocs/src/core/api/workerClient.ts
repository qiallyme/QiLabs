/**
 * Cloudflare Worker API Client
 * 
 * Handles communication with QiOS Worker endpoints:
 * - Orchestrator (GINA chat, health, workers status)
 * - Ingestion worker (file ingestion)
 * - Memory worker (semantic search/query)
 */

// Default to local_core for development
const ORCHESTRATOR_URL = import.meta.env.VITE_WORKER_URL || 'http://localhost:7130';
const INGEST_WORKER_URL = import.meta.env.VITE_INGEST_WORKER_URL || ORCHESTRATOR_URL;
const MEMORY_WORKER_URL = import.meta.env.VITE_MEMORY_WORKER_URL || ORCHESTRATOR_URL;

export interface GinaChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  context?: Array<{ qid: string; title: string; score?: number }>;
}

export interface GinaChatRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  mode?: 'chat' | 'voice';
  with_voice?: boolean;
}

export interface GinaChatResponse {
  reply: string;
  context?: {
    queue?: {
      total: number;
      by_status: {
        pending: number;
        processing: number;
        complete: number;
        error: number;
      };
    };
    workers?: Array<{
      name: string;
      status: string;
      last_heartbeat: string | null;
      meta: Record<string, any>;
    }>;
    health?: {
      status: string;
      runtime: string;
      last_tick: string | null;
    };
  };
  tool_suggestions?: Array<{
    tool: string;
    label: string;
    args: Record<string, any>;
  }>;
  retrieval_used?: boolean;
  sources?: Array<{
    id: string;
    file_path: string;
    score: number;
  }>;
}

export interface IngestRequest {
  file_path: string;
  slug?: string;
  realm?: string;
  realm_slug?: string;
  mime_type?: string;
  file_ext?: string;
  text_content?: string;
  extracted_text?: string;
  qid?: string;
  meta?: any;
}

export interface IngestResponse {
  id: string;
  file_path: string;
  status: string;
  message?: string;
}

export interface IngestStatusResponse {
  id: string;
  file_path: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  message?: string;
  error?: string;
}

export interface QueryRequest {
  query: string;
  k?: number;
  matchCount?: number;
  realm?: string;
  realmSlug?: string;
  pathPrefix?: string;
  useLegacyMatchKb?: boolean;
}

export interface QueryResponse {
  results: Array<{
    source_id: string;
    score: number;
    content: string;
    file_path?: string;
    slug?: string;
  }>;
}

/**
 * Send a chat message to GINA (local_core)
 * Matches the contract from workers/local_core/gina_chat_contract.md
 */
export async function sendGinaMessage(
  request: GinaChatRequest
): Promise<GinaChatResponse> {
  if (!ORCHESTRATOR_URL) {
    throw new Error('Worker URL not configured. Set VITE_WORKER_URL environment variable.');
  }

  try {
    const response = await fetch(`${ORCHESTRATOR_URL}/gina/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: request.messages,
        mode: request.mode || 'chat',
        with_voice: request.with_voice || false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(`GINA chat failed: ${response.status} ${response.statusText} - ${errorData.detail || 'Unknown error'}`);
    }

    const data = await response.json();
    return data as GinaChatResponse;
  } catch (error) {
    console.error('Failed to send message to GINA:', error);
    
    // Provide helpful error message for connection failures
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      const backendUrl = ORCHESTRATOR_URL || 'http://localhost:7130';
      throw new Error(
        `Cannot connect to local_core backend at ${backendUrl}.\n\n` +
        `To start the backend, run:\n` +
        `  cd workers/local_core\n` +
        `  python -m uvicorn qios_local_core:app --host 0.0.0.0 --port 7130`
      );
    }
    
    throw error;
  }
}

/**
 * Ingest a file/note into the QiOS pipeline
 * Matches the contract from workers/local_core/models.py IngestRequest
 */
export async function ingestFile(request: IngestRequest): Promise<IngestResponse> {
  if (!INGEST_WORKER_URL) {
    throw new Error('Ingestion worker URL not configured. Set VITE_INGEST_WORKER_URL or VITE_WORKER_URL.');
  }

  try {
    // local_core expects 'content' field, not 'text_content'
    const payload: any = {
      file_path: request.file_path,
      slug: request.slug,
      realm: request.realm,
      realm_slug: request.realm_slug,
      mime_type: request.mime_type,
      file_ext: request.file_ext,
      content: request.text_content || request.extracted_text || '',
      qid: request.qid,
      meta: request.meta || {},
    };
    
    const response = await fetch(`${INGEST_WORKER_URL}/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || errorData.error || `Ingestion failed: ${response.status}`);
    }

    const data = await response.json();
    // local_core returns { ok: bool, id: str }, map to our interface
    return {
      ok: data.ok ?? true,
      id: data.id,
      file_path: request.file_path,
      status: 'pending', // Initial status
    } as IngestResponse;
  } catch (error) {
    console.error('Failed to ingest file:', error);
    throw error;
  }
}

/**
 * Get ingestion status by ID
 */
export async function getIngestStatus(id: string): Promise<IngestStatusResponse> {
  if (!INGEST_WORKER_URL) {
    throw new Error('Ingestion worker URL not configured.');
  }

  try {
    const response = await fetch(`${INGEST_WORKER_URL}/ingest/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || errorData.error || `Failed to get ingest status: ${response.status}`);
    }

    const data = await response.json();
    return data as IngestStatusResponse;
  } catch (error) {
    console.error('Failed to get ingest status:', error);
    throw error;
  }
}

/**
 * Ingest a note (convenience wrapper for ingestFile)
 */
export async function ingestNote(
  title: string,
  content: string,
  realm: string,
  qid?: string,
  realmSlug?: string
): Promise<IngestResponse> {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const filePath = `realms/${realmSlug || realm.toLowerCase()}/kb/${slug}.md`;
  
  return ingestFile({
    file_path: filePath,
    slug,
    realm,
    realm_slug: realmSlug || realm.toLowerCase(),
    mime_type: 'text/markdown',
    file_ext: 'md',
    text_content: content,
    qid,
    meta: {
      title,
      ingested_from: 'qinote',
    },
  });
}

/**
 * Query the semantic memory (RAG search)
 * Matches the contract from workers/local_core/models.py QueryRequest/QueryResponse
 */
export async function queryMemory(request: QueryRequest): Promise<QueryResponse> {
  if (!MEMORY_WORKER_URL) {
    throw new Error('Memory worker URL not configured. Set VITE_MEMORY_WORKER_URL or VITE_WORKER_URL.');
  }

  try {
    const response = await fetch(`${MEMORY_WORKER_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: request.query,
        limit: request.k || request.matchCount || 10,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || errorData.error || `Query failed: ${response.status}`);
    }

    const data = await response.json();
    return data as QueryResponse;
  } catch (error) {
    console.error('Failed to query memory:', error);
    throw error;
  }
}

/**
 * Search QiNodes semantically (legacy - uses queryMemory internally)
 */
export async function searchQiNodes(query: string): Promise<Array<{ qid: string; title: string; score?: number }>> {
  try {
    const result = await queryMemory({ query, k: 10 });
    return result.results.map(result => ({
      qid: result.slug || result.file_path?.split('/').pop() || '',
      title: result.file_path?.split('/').pop() || 'Untitled',
      score: result.score,
    }));
  } catch (error) {
    console.error('Failed to search QiNodes:', error);
    return [];
  }
}

/**
 * Health check for local_core
 */
export async function checkWorkerHealth(): Promise<boolean> {
  if (!ORCHESTRATOR_URL) {
    return false;
  }

  try {
    const response = await fetch(`${ORCHESTRATOR_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

