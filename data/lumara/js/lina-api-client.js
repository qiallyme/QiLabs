(function () {
  const DEFAULT_BASE = "https://lina.qially.com";
  const BASE_URL = window.LINA_API_BASE || DEFAULT_BASE;

  async function sendMessage(messages, options) {
    const payload = {
      messages,
      language: options?.language || "en",
      voice: options?.voice || false,
      source: options?.source || "unknown"
    };

    const res = await fetch(`${BASE_URL}/api/lina-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Lina API error: ${res.status}`);
    }

    const data = await res.json();
    return {
      reply: data.reply,
      audio: data.audio || null,
      meta: data.meta || {}
    };
  }

  window.linaApi = { sendMessage };
})();
