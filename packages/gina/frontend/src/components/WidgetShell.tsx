// frontend/src/components/WidgetShell.tsx
import React, { useEffect, useRef, useState } from "react";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { sendToLina } from "../api/linaClient";
import type { ChatMessage } from "../models/chat";

let id = 0;
const nid = () => String(++id);

export const WidgetShell: React.FC<{ source: string }> = ({ source }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nid(),
      role: "assistant",
      content:
        "Hi love, I’m Lina. 💛 This is a safe demo to show how Lumara supports immigrant families in tough moments."
    }
  ]);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stable per-tab session id
  const [sessionId] = useState<string>(() => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `session_${Math.random().toString(36).slice(2)}`;
  });

  const playAudio = (dataUrl: string | null) => {
    if (!dataUrl) return;
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      audioRef.current.src = dataUrl;
      audioRef.current.play().catch(() => {});
    } catch {
      // ignore
    }
  };

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const u: ChatMessage = { id: nid(), role: "user", content: trimmed };
    const cur = [...messages, u];
    setMessages(cur);
    setLoading(true);

    try {
      const res = await sendToLina(cur, {
        sessionId,
        source,
        voice: true,
        mode: "chat",
        useRag: true
      });

      const a: ChatMessage = {
        id: nid(),
        role: "assistant",
        content:
          res.reply ||
          "I’m here with you. Something went wrong on my side, but you’re not alone. 💛"
      };
      const nextMsgs = [...cur, a];
      setMessages(nextMsgs);

      if (res.audio) {
        playAudio(res.audio as string);
      }
    } catch (e) {
      const a: ChatMessage = {
        id: nid(),
        role: "assistant",
        content:
          "I’m having trouble reaching the Lumara network right now. Please try again later, or contact local emergency services if you’re in immediate danger. 💛"
      };
      setMessages([...cur, a]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.c}>
      <ChatHeader />
      <MessageList messages={messages} />
      <ChatInput disabled={loading} onSend={handleSend} />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  c: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    borderRadius: 18,
    border: "1px solid #e5e7eb",
    background: "#fff",
    overflow: "hidden"
  }
};
