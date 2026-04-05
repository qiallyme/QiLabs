// frontend/functions/api/lina-chat.js

const SYSTEM_PROMPT = `
You are Lina, the AI Navigator for Lumara – a national immigrant safety network in the U.S.

STYLE:
- Short, concrete responses: 2–6 sentences or a few bullet points.
- No long inspirational speeches or roleplay scripts.
- Always tie answers back to how Lumara realistically works.
- You may describe what Lumara would do; you do NOT give official legal advice or act as 911.

SAFETY:
- If someone seems in immediate danger, gently suggest contacting local emergency services
  or a trusted trusted organization.
- Be trauma-informed, non-judgmental, and stabilizing.

Tone: warm, calm, clear, grounded.
`;

const LUMARA_KB = `
Core Lumara facts:
- Lumara is a national immigrant safety network in the U.S., like AAA but for crisis navigation.
- Membership tiers (demo): $5.99 individual, $9.99 couple, $19.99 family.
- Focus: crisis navigation, practical support (housing, safety, documents, transport), multi-language help,
  and a secure document vault.
- Lumara connects members to local partners (shelters, churches, pros, advocates, drivers, etc.).
- Lumara does NOT replace lawyers or emergency services. It does not act as a law firm or 911.
- Lina's role: listen, stabilize, structure the problem, and explain how Lumara’s human team would respond.
`;

/**
 * Expected request body:
 * {
 *   "history": [{ role: "user" | "assistant", content: string, ... }, ...],
 *   "options": {
 *     "sessionId"?: string,
 *     "source"?: string,
 *     "voice"?: boolean,
 *     "mode"?: "chat" | "agent",
 *     "useRag"?: boolean,
 *     "locationHint"?: string
 *   }
 * }
 */
export async function onRequestPost({ request, env }) {
  try {
    const { history = [], options = {} } = await request.json();
    const {
      sessionId,
      source,
      voice,
      mode = "chat",
      useRag = false,
      locationHint,
      brand = "lina" // Default to "lina" for Lina's own frontend
    } = options;

    const lastUser = getLastUserContent(history);
    if (!lastUser) {
      return json({ error: "Missing user input in history" }, 400);
    }

    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("Missing OPENAI_API_KEY in env");
      return json(
        { error: "Lina is not fully configured yet. (Missing OPENAI_API_KEY.)" },
        500
      );
    }

    // Load long-term memory only if front-end history is empty but we have a session
    // AND this is Lina's own brand (not external callers like QiCockpit)
    let persistedMemoryMessages = [];
    if (brand === "lina" && Array.isArray(history) && history.length === 0 && sessionId) {
      try {
        persistedMemoryMessages = await loadConversationHistory(env, sessionId);
      } catch (e) {
        console.error("Error loading persisted history:", e);
      }
    }

    // Optional: RAG context (available to all brands, but uses Lina's RAG data)
    let ragContext = "";
    let usedRag = false;
    if (useRag && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const rag = await getRagContext(env, lastUser);
        if (rag) {
          ragContext = rag;
          usedRag = true;
        }
      } catch (e) {
        console.error("RAG context error:", e);
      }
    }

    // Optional: weather context
    let weatherContext = "";
    let usedWeather = false;
    if (env.WEATHER_API_BASE && env.WEATHER_API_KEY) {
      try {
        const wc = await getWeatherContext(env, lastUser, locationHint);
        if (wc) {
          weatherContext = wc;
          usedWeather = true;
        }
      } catch (e) {
        console.error("Weather context error:", e);
      }
    }

    const messages = buildMessages({
      mode,
      source,
      history,
      persistedMemoryMessages,
      ragContext,
      weatherContext
    });

    const completionRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: env.LINA_MODEL || "gpt-4.1-mini",
          temperature: mode === "agent" ? 0.3 : 0.4,
          max_tokens: 400,
          messages
        })
      }
    );

    if (!completionRes.ok) {
      const text = await completionRes.text();
      console.error("OpenAI error:", completionRes.status, text);
      return json(
        {
          error: "openai_error",
          status: completionRes.status,
          detail: text
        },
        500
      );
    }

    const data = await completionRes.json();
    const reply =
      data?.choices?.[0]?.message?.content ||
      "I’m here with you. It looks like my connection is limited, but this is how Lumara would normally support you.";

    // Voice stub (later: OpenAI TTS / ElevenLabs)
    let audioDataUrl = null;
    if (voice && env.LINA_TTS_PROVIDER) {
      audioDataUrl = null;
    }

    // Persist this turn to Supabase ONLY if this is Lina's own brand
    // External callers (like QiCockpit with brand="qially") should not write to Lina's DB
    if (brand === "lina" && sessionId && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        await saveConversationTurn(env, sessionId, source, lastUser, reply);
      } catch (e) {
        console.error("Error saving conversation turn:", e);
      }
    }

    return json({
      reply,
      audio: audioDataUrl,
      usedRag,
      usedWeather
    });
  } catch (err) {
    console.error("lina-chat handler error:", err);
    return json({ error: "internal_error" }, 500);
  }
}

// ---- helpers ----

function getLastUserContent(history) {
  if (!Array.isArray(history)) return null;
  for (let i = history.length - 1; i >= 0; i--) {
    const m = history[i];
    if (m && m.role === "user" && typeof m.content === "string") {
      return m.content;
    }
  }
  return null;
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter(
      (m) =>
        m &&
        typeof m.content === "string" &&
        (m.role === "user" || m.role === "assistant")
    )
    .map((m) => ({ role: m.role, content: m.content }));
}

function buildMessages({
  mode,
  source,
  history,
  persistedMemoryMessages,
  ragContext,
  weatherContext
}) {
  const base = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "system", content: LUMARA_KB }
  ];

  if (ragContext) {
    base.push({
      role: "system",
      content:
        "Knowledge context from Lumara's internal KB (summarized):\n" +
        ragContext
    });
  }

  if (weatherContext) {
    base.push({
      role: "system",
      content:
        "Environmental context (weather / location relevant to the user):\n" +
        weatherContext
    });
  }

  if (source) {
    base.push({
      role: "system",
      content: `This conversation is happening via: ${source}. Adjust presentation to that surface.`
    });
  }

  if (mode === "agent") {
    base.push({
      role: "system",
      content:
        "You are currently in AGENT mode. Prioritize operational clarity for Lumara staff, not member-facing comfort language."
    });
  }

  const memoryMsg =
    persistedMemoryMessages && persistedMemoryMessages.length > 0
      ? [
          {
            role: "system",
            content:
              "Here is a compact summary of previous messages for this member/session:\n" +
              persistedMemoryMessages
                .map(
                  (m) =>
                    `- [${m.role}] ${truncate(m.content, 220)}`
                )
                .join("\n")
          }
        ]
      : [];

  return [...base, ...memoryMsg, ...normalizeHistory(history)];
}

function truncate(str, max) {
  if (!str || str.length <= max) return str;
  return str.slice(0, max - 1) + "…";
}

async function getRagContext(env, queryText) {
  const url = `${env.SUPABASE_URL}/rest/v1/rpc/match_lina_docs`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({
      query_text: queryText,
      match_limit: 4
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase RAG error ${res.status}: ${text}`);
  }

  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return "";

  const parts = data.map((row, idx) => {
    const title = row.title || `Doc ${idx + 1}`;
    const summary = row.summary || row.content || "";
    const sim = row.similarity_score
      ? ` (similarity ~${row.similarity_score.toFixed(2)})`
      : "";
    return `- ${title}${sim}: ${summary}`;
  });

  return parts.join("\n");
}

async function getWeatherContext(env, userText, locationHint) {
  const lower = userText.toLowerCase();
  const shouldCheck =
    /weather|temperature|forecast|cold|hot|rain|snow/.test(lower);
  if (!shouldCheck && !locationHint) return "";

  const base = env.WEATHER_API_BASE; // e.g. https://api.openweathermap.org/data/2.5
  const key = env.WEATHER_API_KEY;
  if (!base || !key) return "";

  const q = locationHint || env.LUMARA_DEFAULT_CITY || "Indianapolis,US";
  const url = `${base}/weather?q=${encodeURIComponent(
    q
  )}&appid=${key}&units=imperial`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Weather API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const temp = data?.main?.temp;
  const conditions = data?.weather?.[0]?.description;
  if (temp == null || !conditions) return "";

  return `Current weather near "${q}": about ${temp}°F with ${conditions}.`;
}

async function saveConversationTurn(env, sessionId, source, userText, linaReply) {
  const url = `${env.SUPABASE_URL}/rest/v1/lina_conversations`;
  const headers = {
    "Content-Type": "application/json",
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    Prefer: "return=minimal"
  };

  const payload = [
    {
      session_id: sessionId,
      role: "user",
      content: userText,
      source: source || null
    },
    {
      session_id: sessionId,
      role: "assistant",
      content: linaReply,
      source: source || null
    }
  ];

  await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });
}

async function loadConversationHistory(env, sessionId) {
  const url =
    `${env.SUPABASE_URL}/rest/v1/lina_conversations` +
    `?session_id=eq.${encodeURIComponent(sessionId)}` +
    `&select=role,content,created_at` +
    `&order=created_at.desc` +
    `&limit=12`;

  const res = await fetch(url, {
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`loadConversationHistory error ${res.status}: ${text}`);
  }

  const data = await res.json();
  if (!Array.isArray(data)) return [];

  // Return in chronological order
  return data.reverse();
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
