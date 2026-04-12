import { supabase } from '../../../lib/supabase/client';
import type { Database } from '../../../types/database.types';

type ChatRoom = Database['public']['Tables']['chat_rooms']['Row'];
type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];

export async function getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
}

export async function getUserRooms() {
    // Row Level Security ensures the current user only sees rooms they are an active member of
    const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ChatRoom[];
}

export async function getRoomById(roomId: string) {
    const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

    if (error) throw error;
    return data as ChatRoom;
}

export async function getRoomMessages(roomId: string, limit = 50) {
    // Order descending to fetch the latest messages, then reverse them for chronological UI rendering
    const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return (data as ChatMessage[]).reverse();
}