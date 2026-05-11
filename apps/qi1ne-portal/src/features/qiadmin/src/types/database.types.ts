export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface QiCase {
  id: string;
  tenant_id: string;
  qid?: string | null;
  case_name: string;
  case_number?: string | null;
  court?: string | null;
  judge?: string | null;
  opposing_counsel?: string | null;
  status?: string | null;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export type Database = any; // Placeholder for full supabase DB generation