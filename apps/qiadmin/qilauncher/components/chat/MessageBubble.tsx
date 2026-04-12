// apps/qilauncher/components/chat/MessageBubble.tsx
import { ChatMessage, ToolSuggestion } from '../../types';

interface MessageBubbleProps {
  message: ChatMessage;
  onInvokeTool?: (tool: string, args: Record<string, any>, label: string) => void;
}

export function MessageBubble({ message, onInvokeTool }: MessageBubbleProps) {
  const isGina = message.sender === 'gina';

  return (
    <div className={`flex gap-3 ${isGina ? '' : 'flex-row-reverse'}`}>
      {isGina && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xs">G</span>
        </div>
      )}
      <div className={`flex-1 ${isGina ? '' : 'flex justify-end'}`}>
        <div
          className={`max-w-[80%] rounded-lg p-3 ${
            isGina
              ? 'bg-slate-800/50 text-slate-200'
              : 'bg-cyan-500/20 text-white border border-cyan-500/30'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          
          {/* Tool Suggestions */}
          {isGina && message.toolSuggestions && message.toolSuggestions.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.toolSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => onInvokeTool?.(suggestion.tool, suggestion.args, suggestion.label)}
                  className="w-full text-left px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded text-xs text-cyan-200 transition-colors"
                >
                  🔧 {suggestion.label}
                </button>
              ))}
            </div>
          )}
          
          <p className="text-xs text-slate-400 mt-1">{message.timestamp}</p>
        </div>
      </div>
    </div>
  );
}

