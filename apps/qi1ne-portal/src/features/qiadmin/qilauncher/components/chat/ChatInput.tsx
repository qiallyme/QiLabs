// apps/qilauncher/components/chat/ChatInput.tsx
import { useState, useEffect } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [inputText, setInputText] = useState('');

  const {
    isListening,
    hasMicPermission,
    transcript,
    startListening,
    stopListening,
    isSupported: isSTTSupported,
  } = useSpeechRecognition({
    onResult: (finalTranscript) => {
      if (finalTranscript.trim()) {
        setInputText(finalTranscript);
        // Auto-send after a short delay to allow user to see the transcript
        setTimeout(() => {
          onSendMessage(finalTranscript);
          setInputText('');
        }, 300);
      }
    },
    onError: (error) => {
      console.error('Speech recognition error:', error);
    },
  });

  // Update input text with interim transcript while listening
  useEffect(() => {
    if (isListening && transcript) {
      setInputText(transcript);
    } else if (!isListening && !transcript) {
      // If we stopped listening and there's no transcript, clear the input
      // (but keep it if there's a final result that was sent)
      setInputText('');
    }
  }, [transcript, isListening]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const canUseMic = isSTTSupported && (hasMicPermission === null || hasMicPermission === true);

  return (
    <div className="p-4 border-t border-white/10">
      {/* Listening indicator */}
      {isListening && (
        <div className="mb-2 flex items-center gap-2 text-sm text-cyan-400 animate-pulse">
          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
          <span>Listening...</span>
        </div>
      )}
      
      <div className="flex gap-2">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isListening ? "Listening..." : "Type a message..."}
          className="flex-1 bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          rows={1}
          disabled={isListening}
        />
        
        {/* Microphone button */}
        {canUseMic && (
          <button
            onClick={handleMicClick}
            className={`px-4 py-2 rounded-lg transition-all flex items-center justify-center ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>
        )}
        
        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!inputText.trim() || isListening}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      
      {/* Mic permission error */}
      {isSTTSupported && hasMicPermission === false && (
        <div className="mt-2 text-xs text-amber-400">
          Microphone permission denied. Please enable microphone access in your browser settings.
        </div>
      )}
      
      {/* Browser not supported */}
      {!isSTTSupported && (
        <div className="mt-2 text-xs text-slate-500">
          Voice input not supported in this browser.
        </div>
      )}
    </div>
  );
}

