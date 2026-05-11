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
          username: string | null
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
  qihome: {
    Tables: {
      bills: {
        Row: {
          id: string
          category: string
          amount_estimated: number
          billing_period: string
          is_finalized: boolean
          tenant_id: string
          created_at: string
        }
        Insert: {
          category: string
          amount_estimated: number
          billing_period: string
          tenant_id: string
          is_finalized?: boolean
        }
        Update: any
      }
      bill_shares: {
        Row: {
          id: string
          bill_id: string
          user_id: string
          share_amount_estimated: number
          tenant_id: string
        }
        Insert: {
          bill_id: string
          user_id: string
          share_amount_estimated: number
          tenant_id: string
        }
        Update: any
      }
      ledger_entries: {
        Row: {
          id: string
          user_id: string
          reference_id: string | null
          entry_type: 'DEBIT' | 'CREDIT'
          amount: number
          description: string
          tenant_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          entry_type: 'DEBIT' | 'CREDIT'
          amount: number
          description: string
          tenant_id: string
          reference_id?: string | null
        }
        Update: any
      }
    }
    Views: {
      v_user_balances: {
        Row: {
          user_id: string
          username: string
          balance: string
          tenant_id: string
        }
      }
    }
    Functions: {
      [key: string]: any
    }
    Enums: {
      [key: string]: any
    }
  }
}
