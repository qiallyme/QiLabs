/**
 * Rideshare Battle Boards - Worker API
 * Secure-ish proxy between PWA and Supabase REST API (service role).
 * - Proper CORS allowlist (echo Origin if allowed)
 * - Correct OPTIONS preflight
 * - Pass through Supabase status codes (so debugging isn't hell)
 * - Clamp numeric inputs to prevent negatives / NaN
 */

function parseAllowedOrigins(env) {
  return (env.CORS_ALLOW_ORIGINS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

function buildCorsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = parseAllowedOrigins(env);

  // If no allowlist configured, default to deny (safer). You can loosen later.
  const allowOrigin = allowed.includes(origin) ? origin : "";

  return {
    ...(allowOrigin ? { "Access-Control-Allow-Origin": allowOrigin } : {}),
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

function json(data, { status = 200, headers = {} } = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}

function clampNum(x) {
  const n = Number(x);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

function clampInt(x) {
  const n = Math.floor(Number(x));
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

function assertDriver(driver) {
  if (driver !== "Cody" && driver !== "Zai") {
    throw new Error("driver must be 'Cody' or 'Zai'");
  }
}

function assertDate(d) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) throw new Error("date must be YYYY-MM-DD");
}

async function forwardSupabase(request, env, supabaseUrl) {
  // forward response body + status; add CORS
  const corsHeaders = buildCorsHeaders(request, env);
  const text = await supabaseUrl.res.text();

  return new Response(text, {
    status: supabaseUrl.res.status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;

    const corsHeaders = buildCorsHeaders(request, env);

    // OPTIONS preflight
    if (method === "OPTIONS") {
      // If Origin isn't allowed, return 204 without ACAO header; browser will block.
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const sbUrl = (env.SUPABASE_URL || "").replace(/\/$/, "");
    const sbKey = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!sbUrl || !sbKey) {
      return json(
        { error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in Worker env" },
        { status: 500, headers: corsHeaders }
      );
    }

    try {
      // GET /api/drives?driver=Cody&start=YYYY-MM-DD&end=YYYY-MM-DD
      if (url.pathname === "/api/drives" && method === "GET") {
        const driver = url.searchParams.get("driver");
        const start = url.searchParams.get("start");
        const end = url.searchParams.get("end");

        if (!driver || !start || !end) {
          return json({ error: "Missing parameters: driver,start,end" }, { status: 400, headers: corsHeaders });
        }

        assertDriver(driver);
        assertDate(start);
        assertDate(end);

        const res = await fetch(
          `${sbUrl}/rest/v1/drives_daily?driver=eq.${encodeURIComponent(driver)}&drive_date=gte.${start}&drive_date=lte.${end}&order=drive_date.asc`,
          { headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` } }
        );

        const supa = { res };
        return forwardSupabase(request, env, supa);
      }

      // POST /api/drives (Upsert)
      if (url.pathname === "/api/drives" && method === "POST") {
        const body = await request.json();

        if (!body?.driver || !body?.drive_date) {
          return json({ error: "Missing required fields: driver, drive_date" }, { status: 400, headers: corsHeaders });
        }

        assertDriver(body.driver);
        assertDate(body.drive_date);

        // Validation & clamping
        const cleanData = {
          drive_date: body.drive_date,
          driver: body.driver,

          online_hours: clampNum(body.online_hours),
          driving_hours: clampNum(body.driving_hours),
          hours_in_last_24: clampNum(body.hours_in_last_24),

          rides_completed: clampInt(body.rides_completed),
          rides_rejected: clampInt(body.rides_rejected),

          earnings: clampNum(body.earnings),
          tips: clampNum(body.tips),
          gas_cost: clampNum(body.gas_cost),
          other_costs: clampNum(body.other_costs),

          rating_stars:
            body.rating_stars === null || body.rating_stars === undefined || body.rating_stars === ""
              ? null
              : clampNum(body.rating_stars),

          safety_issue: Boolean(body.safety_issue),

          challenge_progress: body.challenge_progress || null,
          tier_points:
            body.tier_points === null || body.tier_points === undefined || body.tier_points === ""
              ? null
              : clampInt(body.tier_points),

          perk_value: clampNum(body.perk_value),

          notes: body.notes || null,
        };

        const res = await fetch(`${sbUrl}/rest/v1/drives_daily?on_conflict=drive_date,driver`, {
          method: "POST",
          headers: {
            apikey: sbKey,
            Authorization: `Bearer ${sbKey}`,
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates,return=representation",
          },
          body: JSON.stringify(cleanData),
        });

        const supa = { res };
        return forwardSupabase(request, env, supa);
      }

      // GET /api/challenges?driver=Cody
      if (url.pathname === "/api/challenges" && method === "GET") {
        const driver = url.searchParams.get("driver");
        if (!driver) return json({ error: "Missing parameter: driver" }, { status: 400, headers: corsHeaders });

        assertDriver(driver);

        const res = await fetch(`${sbUrl}/rest/v1/challenges?driver=eq.${encodeURIComponent(driver)}&order=start_date.desc`, {
          headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` },
        });

        const supa = { res };
        return forwardSupabase(request, env, supa);
      }

      // GET /api/tier?driver=Cody&date=YYYY-MM-DD
      if (url.pathname === "/api/tier" && method === "GET") {
        const driver = url.searchParams.get("driver");
        const date = url.searchParams.get("date");
        if (!driver || !date) {
          return json({ error: "Missing parameters: driver,date" }, { status: 400, headers: corsHeaders });
        }

        assertDriver(driver);
        assertDate(date);

        const res = await fetch(
          `${sbUrl}/rest/v1/tier_periods?driver=eq.${encodeURIComponent(driver)}&period_start=lte.${date}&period_end=gte.${date}&order=period_start.desc&limit=1`,
          { headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` } }
        );

        const supa = { res };
        return forwardSupabase(request, env, supa);
      }

      return json({ error: "Endpoint not found" }, { status: 404, headers: corsHeaders });
    } catch (err) {
      return json({ error: err?.message || String(err) }, { status: 500, headers: corsHeaders });
    }
  },
};
