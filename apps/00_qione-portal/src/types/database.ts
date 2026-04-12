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
      [key: string]: any
    }
    Views: {
      [key: string]: any
    }
    Functions: {
      [key: string]: any
    }
    Enums: {
      [key: string]: any
    }
  }
  qione: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'user' | 'admin'
          full_name: string | null
          avatar_url: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: any
        Update: any
      }
      app_module_registry: {
        Row: {
          id: string
          slug: string
          name: string
          icon: string | null
          description: string | null
          default_enabled: boolean
          order_int: number
          created_at: string
        }
        Insert: any
        Update: any
      }
      user_module_settings: {
        Row: {
          id: string
          user_id: string
          module_id: string
          is_enabled: boolean
          created_at: string
        }
        Insert: any
        Update: any
      }
    }
    Functions: {
      get_user_modules: {
        Args: { p_user_id: string }
        Returns: any
      }
    }
  }
}
