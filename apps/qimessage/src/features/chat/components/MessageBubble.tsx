import { cn } from '../../../lib/utils';
import type { Database } from '../../../types/database.types';

type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];

interface MessageBubbleProps {
    message: ChatMessage;
    isOwnMessage: boolean;
    senderName?: string; // We pass this in from the profiles join
    showHeader: boolean;
}

export const MessageBubble = ({ message, isOwnMessage, senderName = 'Unknown', showHeader }: MessageBubbleProps) => {
    return (
        <div className={cn("flex mt-2", isOwnMessage ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[75%] w-fit flex flex-col gap-1", isOwnMessage && "items-end")}>

                {showHeader && (
                    <div className={cn("flex items-center gap-2 text-xs px-3", isOwnMessage && "justify-end flex-row-reverse")}>
                        <span className="font-medium text-muted-foreground">{senderName}</span>
                        <span className="text-muted-foreground/50 text-[10px]">
                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                )}

                <div
                    className={cn(
                        "py-2 px-3 rounded-2xl text-sm w-fit break-words",
                        isOwnMessage
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-muted text-foreground rounded-tl-sm",
                        message.deleted_at && "italic opacity-50 bg-transparent border border-dashed"
                    )}
                >
                    {message.deleted_at ? "This message was deleted" : message.body}
                </div>
            </div>
        </div>
    );
};