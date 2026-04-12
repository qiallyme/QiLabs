export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      chat_rooms: {
        Row: {
          id: string
          created_at: string
          created_by: string | null
          name: string
        }
        Insert: {
          id?: string
          created_at?: string
          created_by?: string | null
          name: string
        }
        Update: {
          id?: string
          created_at?: string
          created_by?: string | null
          name?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          created_at: string
          room_id: string
          sender_id: string
          client_message_id: string
          body: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          room_id: string
          sender_id: string
          client_message_id: string
          body: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          room_id?: string
          sender_id?: string
          client_message_id?: string
          body?: string
          deleted_at?: string | null
        }
      }
      chat_room_members: {
        Row: {
          id: string
          room_id: string
          user_id: string
          joined_at: string
          left_at: string | null
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          joined_at?: string
          left_at?: string | null
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          joined_at?: string
          left_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          display_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          created_at?: string
        }
      }
    }
  }
}
