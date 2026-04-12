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
      cases: {
        Row: {
          id: string
          created_at: string
          user_id: string
          title: string
          type: 'Eviction' | 'Debt' | 'Divorce' | 'Other'
          status: 'Active' | 'Closed'
          trial_date: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          title: string
          type: 'Eviction' | 'Debt' | 'Divorce' | 'Other'
          status?: 'Active' | 'Closed'
          trial_date?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          title?: string
          type?: 'Eviction' | 'Debt' | 'Divorce' | 'Other'
          status?: 'Active' | 'Closed'
          trial_date?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          created_at: string
          case_id: string
          title: string
          status: 'Todo' | 'In Progress' | 'Done'
          due_date: string | null
          priority: 'High' | 'Medium' | 'Low'
        }
        Insert: {
          id?: string
          created_at?: string
          case_id: string
          title: string
          status?: 'Todo' | 'In Progress' | 'Done'
          due_date?: string | null
          priority?: 'High' | 'Medium' | 'Low'
        }
        Update: {
          id?: string
          created_at?: string
          case_id?: string
          title?: string
          status?: 'Todo' | 'In Progress' | 'Done'
          due_date?: string | null
          priority?: 'High' | 'Medium' | 'Low'
        }
      }
      evidence: {
        Row: {
          id: string
          created_at: string
          case_id: string
          file_url: string
          filename: string
          tags: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          case_id: string
          file_url: string
          filename: string
          tags?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          case_id?: string
          file_url?: string
          filename?: string
          tags?: string[] | null
        }
      }
    }
  }
}