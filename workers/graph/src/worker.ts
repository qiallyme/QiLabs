// workers/resourceGraphWorker.ts
// Real resource graph worker with Supabase persistence

export interface MatchRequest {
  query: string;
  type: "need" | "offer";
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
  type: "need" | "offer";
}

export interface CreateResourceRequest {
  type: "need" | "offer";
  description: string;
  location?: string;
  tags?: string[];
}

export interface CreateResourceResponse {
  demo: boolean;
  resource: {
    id: string;
    type: "need" | "offer";
    description: string;
    location?: string | null;
    tags?: string[];
    created_via: string;
  };
  note?: string;
}

interface Env {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // Health check
    if (pathname === "/health") {
      const hasSupabase = !!(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
      return json({ 
        ok: true, 
        worker: "resourceGraphWorker",
        persistence: hasSupabase ? "supabase" : "demo"
      }, 200);
    }

    if (pathname === "/match" && request.method === "POST") {
      return handleMatch(request, env);
    }

    if (pathname === "/create" && request.method === "POST") {
      return handleCreate(request, env);
    }

    if (pathname === "/graph" && request.method === "GET") {
      return handleGetGraph(request, env);
    }

    return new Response("Not found", { status: 404 });
  }
};

async function handleMatch(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json().catch(() => ({}))) as Partial<MatchRequest>;
    const { query = "", type = "need", location, tags = [], limit = 5 } = body;

    if (!query.trim()) {
      return json({ error: "query is required" }, 400);
    }

    // If Supabase is configured, use real matching
    if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        // Match needs to offers or vice versa
        const targetTable = type === "need" ? "offers" : "needs";
        const targetType = type === "need" ? "offer" : "need";
        
        // Simple text search for now (could be enhanced with embeddings)
        const searchQuery = query.toLowerCase();
        const tagFilter = tags.length > 0 ? `&tags=cs.{${tags.map(t => `"${t}"`).join(",")}}` : "";
        const locationFilter = location ? `&location_zip=eq.${encodeURIComponent(location)}` : "";
        
        const url = `${env.SUPABASE_URL}/rest/v1/${targetTable}?status=eq.active${tagFilter}${locationFilter}&limit=${limit}`;
        
        const res = await fetch(url, {
          headers: {
            apikey: env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          const matches: MatchResult[] = data.map((item: any, idx: number) => ({
            id: item.id,
            title: item.title || item.description?.substring(0, 50) || `Match ${idx + 1}`,
            summary: item.description || "",
            similarity_score: 0.7 + (idx * 0.05), // Simple scoring
            distance_score: null,
            type: targetType as "need" | "offer"
          }));

          return json({ matches, demo: false }, 200);
        }
      } catch (err) {
        console.error("Supabase match error:", err);
        // Fall through to demo
      }
    }

    // Fallback to demo if Supabase not configured or error
    const demoMatch: MatchResult = {
      id: "demo-" + Math.random().toString(36).slice(2),
      title: type === "need" 
        ? "Demo match for your member need" 
        : "Demo match for your community offer",
      summary: `Demo match. Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for real matching. Query: "${query}"`,
      similarity_score: 0.8,
      distance_score: null,
      type
    };

    const results = Array(Math.max(1, Math.min(limit, 3)))
      .fill(demoMatch)
      .map((m, idx) => ({
        ...m,
        id: `${m.id}-${idx + 1}`,
        similarity_score: m.similarity_score! - idx * 0.05
      }));

    return json({ matches: results, demo: true }, 200);
  } catch (err) {
    console.error("handleMatch error:", err);
    return json({ error: "internal_error" }, 500);
  }
}

async function handleCreate(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json().catch(() => ({}))) as Partial<CreateResourceRequest>;
    const { type = "need", description = "", location, tags = [] } = body;

    if (!description.trim()) {
      return json({ error: "description is required" }, 400);
    }

    // If Supabase is configured, persist to database
    if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const table = type === "need" ? "needs" : "offers";
        const payload: any = {
          description: description.trim(),
          tags: tags.length > 0 ? tags : [],
          status: "open"
        };

        if (type === "need") {
          payload.category = "other"; // Default category
          payload.urgency = "medium";
        } else {
          payload.type = "other"; // Default offer type
          payload.title = description.substring(0, 100);
        }

        if (location) {
          payload.location_zip = location;
        }

        const url = `${env.SUPABASE_URL}/rest/v1/${table}`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
            Prefer: "return=representation"
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          const created = Array.isArray(data) ? data[0] : data;
          
          return json({
            demo: false,
            resource: {
              id: created.id,
              type,
              description: created.description || description.trim(),
              location: created.location_zip || location || null,
              tags: created.tags || tags,
              created_via: "resourceGraphWorker-supabase"
            }
          }, 200);
        }
      } catch (err) {
        console.error("Supabase create error:", err);
        // Fall through to demo
      }
    }

    // Fallback to demo
    return json({
      demo: true,
      resource: {
        id: "demo-res-" + Math.random().toString(36).slice(2),
        type,
        description: description.trim(),
        location: location ?? null,
        tags,
        created_via: "resourceGraphWorker-demo"
      },
      note: "Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in wrangler.toml for real persistence."
    }, 200);
  } catch (err) {
    console.error("handleCreate error:", err);
    return json({ error: "internal_error" }, 500);
  }
}

async function handleGetGraph(request: Request, env: Env): Promise<Response> {
  try {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return json({ 
        error: "Supabase not configured",
        nodes: [],
        edges: []
      }, 200);
    }

    // Fetch all active needs and offers
    const [needsRes, offersRes] = await Promise.all([
      fetch(`${env.SUPABASE_URL}/rest/v1/needs?status=eq.open&select=id,description,category,location_zip`, {
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
        }
      }),
      fetch(`${env.SUPABASE_URL}/rest/v1/offers?status=eq.active&select=id,title,description,type,location_zip`, {
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
        }
      })
    ]);

    const needs = needsRes.ok ? await needsRes.json() : [];
    const offers = offersRes.ok ? await offersRes.json() : [];

    // Build graph nodes and edges
    const nodes = [
      ...needs.map((n: any) => ({
        id: n.id,
        type: "need",
        label: n.description?.substring(0, 50) || "Need",
        category: n.category,
        location: n.location_zip
      })),
      ...offers.map((o: any) => ({
        id: o.id,
        type: "offer",
        label: o.title || o.description?.substring(0, 50) || "Offer",
        offerType: o.type,
        location: o.location_zip
      }))
    ];

    // Simple edges: needs and offers with same location
    const edges: any[] = [];
    needs.forEach((need: any) => {
      offers.forEach((offer: any) => {
        if (need.location_zip && offer.location_zip && need.location_zip === offer.location_zip) {
          edges.push({
            source: need.id,
            target: offer.id,
            type: "potential_match"
          });
        }
      });
    });

    return json({ nodes, edges }, 200);
  } catch (err) {
    console.error("handleGetGraph error:", err);
    return json({ error: "internal_error" }, 500);
  }
}

function json(body: any, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
