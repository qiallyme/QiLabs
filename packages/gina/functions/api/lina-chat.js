export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json().catch(() => ({}));
    const { messages = [], language = "en", voice = false, source } = body;

    const lastUser =
      messages.filter((m) => m.role === "user").slice(-1)[0]?.content || "";

    // TODO: replace this block with real RAG + OpenAI call
    const reply =
      "Thank you for sharing that with me. I can hear how heavy that feels. 💛\n\n" +
      "In the real Lumara app, I would:\n" +
      "• Ask a couple of gentle questions so I understand the situation\n" +
      "• Notify the right navigator on our team (housing, safety, or paperwork)\n" +
      "• Come back with a clear, simple plan for your next steps\n\n" +
      "Here in the demo, I can help you imagine what that plan might look like.";

    const responseBody = {
      reply,
      audio: null,
      meta: {
        rag_used: false,
        source: source || null,
        language
      }
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders()
      }
    });
  } catch (err) {
    console.error("Lina API error:", err);
    return new Response(
      JSON.stringify({
        reply:
          "I’m having trouble reaching the Lumara network right now. Please try again later, or contact local emergency services if you’re in immediate danger. 💛",
        audio: null,
        meta: { rag_used: false, error: true }
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders()
        }
      }
    );
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}
