export async function onRequestPost({ request, env }) {
  try {
    const { text } = await request.json();
    const apiKey = env.OPENAI_API_KEY;

    if (!text) {
      return new Response(JSON.stringify({ error: 'No text provided' }), { status: 400 });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert caregiving assistant. Convert natural language into structured JSON actions for a caregiving app.
            
            Action Types:
            1. log_medication: { medication: string, quantity: number, unit?: string }
            2. log_treatment_start: { treatment_type: string }
            3. log_treatment_end: { treatment_type: string }
            4. start_timer: { timer_type: string, timer_minutes?: number }
            5. log_symptom: { symptom_type: string, symptom_value: number, notes?: string }
            6. query_next: { query: 'next_due' }
            7. query_history: { query: 'today_meds' | 'recent_events' }
            8. query_status: { query: string }

            Examples:
            "I need to take tylenol soon" -> { "type": "query_status", "query": "check_tylenol" }
            "Mom took 2 tylenol" -> { "type": "log_medication", "medication": "tylenol", "quantity": 2 }
            "Start a 20 minute ice timer" -> { "type": "start_timer", "timer_type": "ice", "timer_minutes": 20 }
            
            Return ONLY valid JSON.`,
          },
          { role: 'user', content: text },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    const action = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(action), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
