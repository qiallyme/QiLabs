import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import type { Database } from '../../../types/database.types';

type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface MessageListProps {
    messages: ChatMessage[];
    currentUserId: string;
    profiles: Record<string, Profile>; // A lookup table for display names
}

export const MessageList = ({ messages, currentUserId, profiles }: MessageListProps) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Replaces the standalone useChatScroll hook
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                No messages yet.
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((message, index) => {
                const prevMessage = index > 0 ? messages[index - 1] : null;
                const isOwnMessage = message.sender_id === currentUserId;
                const showHeader = !prevMessage || prevMessage.sender_id !== message.sender_id;
                const senderProfile = profiles[message.sender_id];

                return (
                    <MessageBubble
                        key={message.id}
                        message={message}
                        isOwnMessage={isOwnMessage}
                        senderName={senderProfile?.display_name || 'User'}
                        showHeader={showHeader}
                    />
                );
            })}
            {/* Invisible element to anchor the auto-scroll */}
            <div ref={bottomRef} className="h-1" />
        </div>
    );
};