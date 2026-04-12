import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { getRoomMessages } from '../lib/queries';
import { sendMessage as sendMutation, softDeleteMessage } from '../lib/mutations';
import type { Database } from '../../../types/database.types';

type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];

export function useChatMessages(roomId: string, currentUserId: string) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const loadMessages = useCallback(async () => {
        if (!roomId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getRoomMessages(roomId, 50);
            setMessages(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load messages'));
        } finally {
            setLoading(false);
        }
    }, [roomId]);

    useEffect(() => {
        loadMessages();

        if (!roomId) return;

        const channel = supabase
            .channel(`chat_room_${roomId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `room_id=eq.${roomId}`,
                },
                (payload) => {
                    const newMsg = payload.new as ChatMessage;

                    if (newMsg.deleted_at) return;

                    setMessages((prev) => {
                        // Dedupe by id first, then client_message_id
                        const exists = prev.some(
                            (m) => m.id === newMsg.id || m.client_message_id === newMsg.client_message_id
                        );
                        if (exists) return prev;
                        return [...prev, newMsg];
                    });
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `room_id=eq.${roomId}`,
                },
                (payload) => {
                    const updatedMsg = payload.new as ChatMessage;

                    setMessages((prev) => {
                        // Remove from UI if the message is soft-deleted
                        if (updatedMsg.deleted_at) {
                            return prev.filter((m) => m.id !== updatedMsg.id);
                        }
                        // Otherwise apply the update
                        return prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m));
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomId, loadMessages]);

    const sendMessage = async (body: string) => {
        try {
            await sendMutation(roomId, currentUserId, body);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to send message'));
        }
    };

    const deleteMessage = async (messageId: string) => {
        try {
            await softDeleteMessage(messageId, currentUserId);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to delete message'));
        }
    };

    return {
        messages,
        loading,
        error,
        sendMessage,
        deleteMessage,
        refresh: loadMessages,
    };
}