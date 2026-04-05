// apps/qilauncher/components/chat/MessageList.tsx
import { useEffect, useRef } from 'react';
import { ChatMessage } from '../../types';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: ChatMessage[];
  onInvokeTool?: (tool: string, args: Record<string, any>, label: string) => void;
}

export function MessageList({ messages, onInvokeTool }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} onInvokeTool={onInvokeTool} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

