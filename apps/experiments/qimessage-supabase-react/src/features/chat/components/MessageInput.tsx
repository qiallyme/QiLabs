import { useState } from 'react';

interface MessageInputProps {
    onSendMessage: (body: string) => Promise<void>;
    disabled?: boolean;
}

export const MessageInput = ({ onSendMessage, disabled }: MessageInputProps) => {
    const [text, setText] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed || disabled || isSending) return;

        try {
            setIsSending(true);
            await onSendMessage(trimmed);
            setText(''); // Only clear on success
        } catch (error) {
            console.error('Failed to send:', error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t bg-background">
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                disabled={disabled || isSending}
                className="flex-1 bg-muted px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
            <button
                type="submit"
                disabled={disabled || isSending || !text.trim()}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium disabled:opacity-50 transition-opacity"
            >
                Send
            </button>
        </form>
    );
};