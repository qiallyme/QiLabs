/**
 * GINA Chat API Contract - TypeScript Definitions
 * 
 * This file defines the exact TypeScript interfaces for the /gina/chat endpoint.
 * Use this in frontend code to ensure type safety.
 * 
 * Reference: workers/local_core/gina_chat_contract.md
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GinaChatRequest {
  messages: ChatMessage[];
}

export interface QueueContext {
  total: number;
  by_status: {
    pending?: number;
    in_progress?: number;
    complete?: number;
    quarantined?: number;
    [key: string]: number | undefined;
  };
}

export interface WorkerContext {
  name: string;
  status: string;
  last_heartbeat: string | null;
  meta: Record<string, any>;
}

export interface HealthContext {
  status: string;
  runtime: string;
  last_tick: string | null;
  layers?: Record<string, any>;
}

export interface GinaChatContext {
  queue?: QueueContext;
  workers?: WorkerContext[];
  health?: HealthContext;
}

export interface GinaChatResponse {
  reply: string;
  context?: GinaChatContext;
}

/**
 * Call GINA chat endpoint
 * 
 * @param baseUrl - Base URL of the local core (e.g., http://localhost:7130)
 * @param request - Chat request with messages array
 * @returns GINA's response with reply and optional context
 */
export async function callGinaChat(
  baseUrl: string,
  request: GinaChatRequest
): Promise<GinaChatResponse> {
  const response = await fetch(`${baseUrl}/gina/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

