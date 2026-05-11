// apps/qilauncher/components/chat/ChatSidebar.tsx
import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../../types';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { speak, isSpeaking, isTTSSupported } from '../../utils/speech';

interface ChatSidebarProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClearChat?: () => void;
  onInvokeTool?: (tool: string, args: Record<string, any>, label: string) => void;
}

export function ChatSidebar({ messages, onSendMessage, onClearChat, onInvokeTool }: ChatSidebarProps) {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [currentlySpeaking, setCurrentlySpeaking] = useState(false);
  const lastSpokenMessageIdRef = useRef<string | null>(null);
  const speakingCheckIntervalRef = useRef<number | null>(null);

  // Load voice preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('gina_voice_enabled');
    if (saved !== null) {
      setIsVoiceEnabled(saved === 'true');
    }
  }, []);

  // Monitor speaking state
  useEffect(() => {
    if (isTTSSupported()) {
      speakingCheckIntervalRef.current = window.setInterval(() => {
        setCurrentlySpeaking(isSpeaking());
      }, 500);
    }

    return () => {
      if (speakingCheckIntervalRef.current) {
        clearInterval(speakingCheckIntervalRef.current);
      }
    };
  }, []);

  // Speak new GINA messages using ElevenLabs TTS
  useEffect(() => {
    if (!isVoiceEnabled) return;

    // Find the most recent GINA message
    const ginaMessages = messages.filter(m => m.sender === 'gina');
    if (ginaMessages.length === 0) return;

    const latestGinaMessage = ginaMessages[ginaMessages.length - 1];

    // Only speak if it's a new message (not already spoken)
    if (latestGinaMessage.id && latestGinaMessage.id !== lastSpokenMessageIdRef.current) {
      lastSpokenMessageIdRef.current = latestGinaMessage.id;
      
      // Basic length guard
      const text = latestGinaMessage.text ?? "";
      if (!text.trim()) return;

      // Call TTS endpoint (ElevenLabs via /gina/tts)
      (async () => {
        try {
          await speak(text);
        } catch (error) {
          console.error('[GINA TTS] Failed to speak message:', error);
          // Don't break the chat - just log the error
        }
      })();
    }
  }, [messages, isVoiceEnabled]);

  const handleVoiceToggle = (enabled: boolean) => {
    setIsVoiceEnabled(enabled);
    localStorage.setItem('gina_voice_enabled', String(enabled));
  };

  return (
    <div className="w-96 flex-shrink-0 glass-panel flex flex-col h-full hidden lg:flex border-l border-white/10">
      <ChatHeader 
        onClearChat={onClearChat} 
        isVoiceEnabled={isVoiceEnabled}
        onVoiceToggle={handleVoiceToggle}
        isSpeaking={currentlySpeaking}
      />
      <MessageList messages={messages} onInvokeTool={onInvokeTool} />
      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
}

