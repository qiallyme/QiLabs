import { useChatMessages } from '../hooks/useChatMessages';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface ChatShellProps {
    roomId: string;
    currentUserId: string;
}

export const ChatShell = ({ roomId, currentUserId }: ChatShellProps) => {
    const { messages, loading, error, sendMessage } = useChatMessages(roomId, currentUserId);

    if (loading && messages.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-background text-muted-foreground">
                Loading chat...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-background text-red-500">
                Error loading chat: {error.message}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full bg-background border rounded-lg overflow-hidden shadow-sm">
            {/* Note: In a real app, you would pass a dictionary of user profiles 
        to MessageList. For v1 scaffolding, we pass an empty object so it 
        defaults to 'User'.
      */}
            <MessageList
                messages={messages}
                currentUserId={currentUserId}
                profiles={{}}
            />
            <MessageInput
                onSendMessage={sendMessage}
                disabled={loading}
            />
        </div>
    );
};