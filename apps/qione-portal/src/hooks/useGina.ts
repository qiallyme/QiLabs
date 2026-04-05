import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiClient from '../api/client';

export type Message = {
  role: 'user' | 'gina';
  content: string;
  timestamp: Date;
};

export const useGina = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'gina', content: "Hello Cody. How can I help you manage the QiAlly ecosystem today?", timestamp: new Date() }
  ]);

  const mutation = useMutation({
    mutationFn: async (text: string) => {
      // Points to your FastAPI 'ai.py' endpoint
      const response = await apiClient.post('/ai/chat', { message: text });
      return response.data;
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'gina', content: data.reply, timestamp: new Date() }]);
    }
  });

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: text, timestamp: new Date() }]);
    mutation.mutate(text);
  };

  return { messages, sendMessage, isThinking: mutation.isPending };
};