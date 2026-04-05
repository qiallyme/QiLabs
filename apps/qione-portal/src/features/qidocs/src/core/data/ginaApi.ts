/**
 * Gina API Client for QiNote
 * 
 * TypeScript interfaces and helper functions for calling the Gina Worker API.
 * 
 * Base URL should be set via environment variable: VITE_WORKER_API_URL
 * (Currently not implemented - worker endpoints not yet called from frontend)
 */

export interface GinaChatRequest {
  message: string;
}

export interface GinaChatResponse {
  message: string;
  context: Array<{
    qid: string;
    title: string;
    score: number;
  }>;
}

export interface GinaSearchParams {
  q: string;
  realm?: string;
  orbit?: string;
  system?: string;
  limit?: number;
}

export interface GinaSearchResult {
  qid: string;
  content: string;
  score: number;
  realm: string;
  orbit: string;
  system: string;
}

export interface GinaSearchResponse {
  results: GinaSearchResult[];
}

export interface GinaQinoteRequest {
  action: "create" | "update";
  qid: string;
  title: string;
  body: string;
  realm: string;
  orbit: string;
  system: string;
  workspace_id?: string | null;
}

export interface GinaQinoteResponse {
  assistantMessage: string;
  noteCreated?: {
    qid: string;
    title: string;
    system: string;
  };
  noteUpdated?: {
    qid: string;
    title: string;
  };
}

/**
 * Call Gina chat endpoint
 * 
 * @param workerUrl - Base URL of the worker (e.g., https://qicockpit-gina.workers.dev)
 * @param message - User's message to Gina
 * @returns Gina's response with context
 */
export async function callGinaChat(
  workerUrl: string,
  message: string
): Promise<GinaChatResponse> {
  const response = await fetch(`${workerUrl}/gina/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Call Gina semantic search endpoint
 * 
 * @param workerUrl - Base URL of the worker
 * @param params - Search parameters
 * @returns Search results
 */
export async function callGinaSearch(
  workerUrl: string,
  params: GinaSearchParams
): Promise<GinaSearchResponse> {
  const url = new URL(`${workerUrl}/gina/search`);
  url.searchParams.set("q", params.q);
  if (params.realm) url.searchParams.set("realm", params.realm);
  if (params.orbit) url.searchParams.set("orbit", params.orbit);
  if (params.system) url.searchParams.set("system", params.system);
  if (params.limit) url.searchParams.set("limit", String(params.limit));

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Call Gina qinote endpoint (for chat with note creation)
 * 
 * Note: The actual endpoint is `/api/gina/qinote` and uses a different format.
 * This function is a placeholder for the future simplified endpoint.
 * 
 * @param workerUrl - Base URL of the worker
 * @param request - Note creation/update request
 * @returns Gina's response with optional memory node
 */
export async function callGinaQinote(
  workerUrl: string,
  request: GinaQinoteRequest
): Promise<GinaQinoteResponse> {
  // TODO: Update to match actual endpoint format when simplified endpoint is implemented
  // Current endpoint: /api/gina/qinote uses { messages, context } format
  const response = await fetch(`${workerUrl}/api/gina/qinote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: request.action === "create" 
            ? `Create note: ${request.title}\n\n${request.body}`
            : `Update note ${request.qid}: ${request.title}\n\n${request.body}`,
        },
      ],
      context: {
        realm: request.realm,
        activeNoteId: request.action === "update" ? request.qid : undefined,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  
  // Transform response to match expected format
  return {
    assistantMessage: data.assistantMessage || data.message || "Note processed",
    noteCreated: data.noteCreated,
    noteUpdated: data.noteUpdated,
  };
}

