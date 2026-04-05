import type { ChatMessage } from "../models/chat";

export type LinaMode = "chat" | "agent";

export interface LinaOptions {
  sessionId?: string;
  source?: string;
  voice?: boolean;
  mode?: LinaMode;
  useRag?: boolean;
  locationHint?: string;
  brand?: string; // "lina" (default) or "qially" (external caller)
}

export interface LinaResponse {
  reply: string;
  audio?: string | null;
  usedRag?: boolean;
  usedWeather?: boolean;
}

export async function sendToLina(
  history: ChatMessage[],
  options: LinaOptions
): Promise<LinaResponse> {
  // Default brand to "lina" if not specified (for Lina's own frontend)
  const optionsWithBrand = {
    ...options,
    brand: options.brand || "lina",
  };
  
  const res = await fetch("/api/lina-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ history, options: optionsWithBrand })
  });

  if (!res.ok) {
    console.error("sendToLina error:", res.status, await res.text());
    throw new Error(`Lina chat error: ${res.status}`);
  }

  const data = (await res.json()) as LinaResponse;
  return data;
}
