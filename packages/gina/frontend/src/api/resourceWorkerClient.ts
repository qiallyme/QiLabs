// frontend/src/api/resourceWorkerClient.ts

export type NeedOrOfferType = "need" | "offer";

export interface MatchRequest {
  query: string;
  type: NeedOrOfferType;
  location?: string;
  tags?: string[];
  limit?: number;
}

export interface MatchResult {
  id: string;
  title: string;
  summary: string;
  distance_score?: number | null;
  similarity_score?: number | null;
  type: NeedOrOfferType;
}

export interface MatchResponse {
  matches: MatchResult[];
  demo?: boolean;
}

export interface CreateResourceRequest {
  type: NeedOrOfferType;
  description: string;
  location?: string;
  tags?: string[];
}

export interface CreateResourceResponse {
  demo: boolean;
  resource: {
    id: string;
    type: NeedOrOfferType;
    description: string;
    location?: string | null;
    tags?: string[];
    created_via: string;
  };
  note?: string;
}

// ---------------
// SAFE ENV LOADER
// ---------------

const env =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env
    : (globalThis as any).__VITE_ENV__ || {};

const WORKER_BASE = (env.VITE_RESOURCE_WORKER_URL || "").replace(/\/+$/, "");


// ---------------
// MATCH RESOURCES
// ---------------

export async function matchResources(
  payload: MatchRequest
): Promise<MatchResponse> {
  // No worker configured → local stub
  if (!WORKER_BASE) {
    const stub: MatchResult = {
      id: "local-demo-1",
      title:
        payload.type === "need"
          ? "Local demo match for your member need"
          : "Local demo match for your community offer",
      summary:
        `No VITE_RESOURCE_WORKER_URL set — using local stub. Query="${payload.query}"`,
      type: payload.type,
      similarity_score: 0.75,
      distance_score: null
    };
    return { matches: [stub], demo: true };
  }

  const res = await fetch(`${WORKER_BASE}/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    console.error("matchResources error:", res.status, await res.text());
    throw new Error(`Worker /match error: ${res.status}`);
  }

  return (await res.json()) as MatchResponse;
}


// ---------------
// CREATE RESOURCE
// ---------------

export async function createResource(
  payload: CreateResourceRequest
): Promise<CreateResourceResponse> {
  // No worker configured → local stub
  if (!WORKER_BASE) {
    return {
      demo: true,
      resource: {
        id: "local-demo-res-" + Math.random().toString(36).slice(2),
        type: payload.type,
        description: payload.description,
        location: payload.location ?? null,
        tags: payload.tags ?? [],
        created_via: "frontend-local-demo"
      },
      note:
        "VITE_RESOURCE_WORKER_URL is not set. Using local stub version of create()."
    };
  }

  const res = await fetch(`${WORKER_BASE}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    console.error("createResource error:", res.status, await res.text());
    throw new Error(`Worker /create error: ${res.status}`);
  }

  return (await res.json()) as CreateResourceResponse;
}

// ---------------
// GET GRAPH DATA
// ---------------

export interface GraphNode {
  id: string;
  type: "need" | "offer";
  label: string;
  category?: string;
  location?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
}

export interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  error?: string;
}

export async function getGraphData(): Promise<GraphResponse> {
  // No worker configured → return empty with error
  if (!WORKER_BASE) {
    return {
      nodes: [],
      edges: [],
      error: "VITE_RESOURCE_WORKER_URL is not set. Configure it to enable the resource graph."
    };
  }

  try {
    const res = await fetch(`${WORKER_BASE}/graph`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        nodes: [],
        edges: [],
        error: `Worker /graph error: ${res.status}. ${text}`
      };
    }

    const data = await res.json();
    if (data.error) {
      return {
        nodes: [],
        edges: [],
        error: data.error
      };
    }

    return {
      nodes: data.nodes || [],
      edges: data.edges || []
    };
  } catch (err) {
    console.error("getGraphData error:", err);
    return {
      nodes: [],
      edges: [],
      error: "Couldn't reach the resource graph worker. Make sure it's running and VITE_RESOURCE_WORKER_URL is set correctly."
    };
  }
}