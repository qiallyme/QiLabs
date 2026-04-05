/**
 * Gina Chat Panel Component
 * 
 * Docked bottom-right chat panel for interacting with Gina
 */

import { useState, useRef, useEffect } from "react";
import { sendGinaMessage, type GinaChatMessage } from "../../core/api/workerClient";
import { useQiStore } from "../../core/state/useQiStore";
import { useLocation } from "react-router-dom";

interface Props {
  activeRealm?: string;
  activeNoteId?: string;
}

export default function GinaChatPanel({ activeRealm, activeNoteId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<GinaChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I'm Gina, your AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadNodes = useQiStore((s) => s.loadNodes);
  const location = useLocation();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Extract realm from location if not provided
  const currentRealm = activeRealm || (location.pathname.includes("/realm/") 
    ? location.pathname.split("/realm/")[1]?.split("/")[0] 
    : undefined);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: GinaChatMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build messages array (include conversation history, exclude 'gina' role which is now 'assistant')
      const conversationHistory = messages
        .filter(m => m.role !== 'gina') // Filter out old 'gina' role
        .map(m => ({
          role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.content,
        }));
      
      const messagesToSend = [
        ...conversationHistory,
        {
          role: 'user' as const,
          content: userMessage.content,
        },
      ];

      const response = await sendGinaMessage({
        messages: messagesToSend,
        mode: 'chat',
      });

      const ginaMessage: GinaChatMessage = {
        role: "assistant",
        content: response.reply,
        timestamp: new Date(),
        context: response.sources?.map(s => ({
          qid: s.file_path,
          title: s.file_path.split('/').pop() || 'Unknown',
          score: s.score,
        })),
      };

      setMessages((prev) => [...prev, ginaMessage]);

      // If Gina created/updated a note, refresh the current realm
      if (currentRealm && (response.message.toLowerCase().includes("created") || 
          response.message.toLowerCase().includes("updated"))) {
        await loadNodes(currentRealm as any);
      }
    } catch (error) {
      let errorContent = "";
      if (error instanceof Error) {
        if (error.message.includes("Cannot connect to local_core")) {
          errorContent = `⚠️ **Backend Not Running**\n\n` +
            `The local_core backend is not available at ${import.meta.env.VITE_WORKER_URL || 'http://localhost:7130'}.\n\n` +
            `**To start it, run:**\n` +
            `\`\`\`bash\n` +
            `cd workers/local_core\n` +
            `python -m uvicorn qios_local_core:app --host 0.0.0.0 --port 7130\n` +
            `\`\`\``;
        } else {
          errorContent = `Sorry, I encountered an error: ${error.message}`;
        }
      } else {
        errorContent = "Unknown error occurred. Please check the console for details.";
      }
      
      const errorMessage: GinaChatMessage = {
        role: "assistant",
        content: errorContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-6 right-6 z-50
          w-14 h-14 rounded-full
          bg-gradient-to-br from-sky-500 to-purple-600
          text-white shadow-lg
          hover:from-sky-400 hover:to-purple-500
          transition-all transform hover:scale-110
          flex items-center justify-center
          ${isOpen ? "rotate-45" : ""}
        `}
        aria-label={isOpen ? "Close Gina chat" : "Open Gina chat"}
      >
        <span className="text-2xl">{isOpen ? "×" : "💬"}</span>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 h-[500px] flex flex-col rounded-2xl border border-slate-800/50 bg-slate-900/95 backdrop-blur-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                G
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Gina</h3>
                <p className="text-xs text-slate-400">AI Assistant</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`
                    max-w-[80%] rounded-2xl px-4 py-2
                    ${
                      msg.role === "user"
                        ? "bg-sky-500/20 text-slate-100 border border-sky-500/30"
                        : "bg-slate-800/60 text-slate-200 border border-slate-700/50"
                    }
                  `}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  {msg.context && msg.context.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-700/50">
                      <p className="text-xs text-slate-400 mb-1">Sources:</p>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {msg.context.map((ctx, i) => (
                          <li key={i}>• {ctx.title} (score: {ctx.score?.toFixed(2)})</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/60 rounded-2xl px-4 py-2 border border-slate-700/50">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Gina anything..."
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-4 py-2 rounded-lg bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

