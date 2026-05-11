import { supabase } from '../../../lib/supabase/client';

export async function createRoom(name: string, memberIds: string[] = []): Promise<any> {
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error('Room name cannot be empty');

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) throw new Error('Not authenticated');

    const { data: room, error: roomError } = await (supabase as any)
        .from('chat_rooms')
        .insert({ name: trimmedName, created_by: authData.user.id })
        .select()
        .single();

    if (roomError) throw roomError;

    // Deduplicate member IDs and ensure the creator's ID is removed
    const extraMemberIds = Array.from(new Set(memberIds)).filter(
        (id) => id !== authData.user!.id
    );

    // Only run the insert if there are additional members to add
    if (extraMemberIds.length > 0) {
        const membersToInsert = extraMemberIds.map((id) => ({
            room_id: room.id,
            user_id: id,
            joined_at: new Date().toISOString(),
        }));

        const { error: membersError } = await (supabase as any)
            .from('chat_room_members')
            .insert(membersToInsert);

        if (membersError) throw membersError;
    }

    return room;
}

export async function addRoomMember(roomId: string, userId: string) {
    const { error } = await (supabase as any)
        .from('chat_room_members')
        .insert({ room_id: roomId, user_id: userId, joined_at: new Date().toISOString() });

    if (error) throw error;
}

export async function leaveRoom(roomId: string, userId: string) {
    const { error } = await (supabase as any)
        .from('chat_room_members')
        .update({ left_at: new Date().toISOString() })
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .is('left_at', null);

    if (error) throw error;
}

export async function sendMessage(roomId: string, senderId: string, body: string): Promise<any> {
    const trimmedBody = body.trim();
    if (!trimmedBody) throw new Error('Message body cannot be empty');

    const client_message_id = crypto.randomUUID();

    const { data, error } = await (supabase as any)
        .from('chat_messages')
        .insert({
            room_id: roomId,
            sender_id: senderId,
            client_message_id,
            body: trimmedBody,
            deleted_at: null,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function softDeleteMessage(messageId: string, senderId: string) {
    const { error } = await (supabase as any)
        .from('chat_messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('sender_id', senderId)
        .is('deleted_at', null);

    if (error) throw error;
}