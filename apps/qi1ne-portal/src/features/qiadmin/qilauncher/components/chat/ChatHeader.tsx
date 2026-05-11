// apps/qilauncher/components/chat/ChatHeader.tsx
import { MoreVertical, X, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect } from 'react';
import { isTTSSupported } from '../../utils/speech';

interface ChatHeaderProps {
  onClearChat?: () => void;
  isVoiceEnabled: boolean;
  onVoiceToggle: (enabled: boolean) => void;
  isSpeaking?: boolean;
}

const VOICE_ENABLED_KEY = 'gina_voice_enabled';

export function ChatHeader({ onClearChat, isVoiceEnabled, onVoiceToggle, isSpeaking = false }: ChatHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);

  useEffect(() => {
    setTtsSupported(isTTSSupported());
  }, []);

  const handleVoiceToggle = () => {
    const newValue = !isVoiceEnabled;
    onVoiceToggle(newValue);
    localStorage.setItem(VOICE_ENABLED_KEY, String(newValue));
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-white/10 relative">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">G</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold">GINA</h3>
            {isSpeaking && (
              <span className="text-xs text-cyan-400 animate-pulse">Speaking...</span>
            )}
          </div>
          <p className="text-xs text-slate-400">Local Mode</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Voice toggle button */}
        {ttsSupported && (
          <button
            onClick={handleVoiceToggle}
            className={`p-2 rounded-lg transition-colors ${
              isVoiceEnabled
                ? 'text-cyan-400 hover:bg-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title={isVoiceEnabled ? 'Voice: On (click to disable)' : 'Voice: Off (click to enable)'}
          >
            {isVoiceEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
        )}
        
        {/* Menu button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 bg-slate-800 border border-white/10 rounded-lg shadow-lg z-50 min-w-[160px]">
              <button
                onClick={() => {
                  if (onClearChat) onClearChat();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5 flex items-center gap-2 rounded-t-lg"
              >
                <RotateCcw className="w-4 h-4" />
                Clear Chat
              </button>
              <button
                onClick={() => setShowMenu(false)}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5 flex items-center gap-2 rounded-b-lg"
              >
                <X className="w-4 h-4" />
                Close Menu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

