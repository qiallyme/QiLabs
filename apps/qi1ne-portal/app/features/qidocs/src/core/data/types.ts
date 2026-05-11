/**
 * Lightweight database type snapshot for QiNote
 * 
 * This matches the Supabase schema in QiSystem/schema/qi_supabase.sql
 * For full types, generate from Supabase CLI:
 * npx supabase gen types typescript --project-id your-project-id
 */

export interface QiNodeRow {
  id: string;
  qid: string;
  realm: string;
  orbit: string;
  system: string;
  title: string;
  status: string | null;
  tags: string[] | null;
  app_id: string | null;
  app_tags: string[] | null;
  origin_qid: string | null;
  influence_qid: string | null;
  companion_qid: string | null;
  occurred_at: string | null;
  created_at: string;
  updated_at: string;
  workspace_id: string | null;
  meta: any;
}

export interface QiChunkRow {
  id: string;
  qid: string;
  chunk_index: number;
  content: string;
  realm: string;
  orbit: string;
  system: string;
  workspace_id: string | null;
  embedding: number[] | null;
  created_at: string;
  updated_at: string;
  meta: any;
}

export interface Database {
  public: {
    Tables: {
      qi_nodes: {
        Row: QiNodeRow;
        Insert: Partial<QiNodeRow>;
        Update: Partial<QiNodeRow>;
      };
      qi_chunks: {
        Row: QiChunkRow;
        Insert: Partial<QiChunkRow>;
        Update: Partial<QiChunkRow>;
      };
      qi_events: {
        Row: {
          id: number;
          created_at: string;
          event_type: string;
          qid: string | null;
          app_id: string | null;
          payload: any;
        };
        Insert: {
          created_at?: string;
          event_type: string;
          qid?: string | null;
          app_id?: string | null;
          payload?: any;
        };
        Update: {
          created_at?: string;
          event_type?: string;
          qid?: string | null;
          app_id?: string | null;
          payload?: any;
        };
      };
    };
  };
}

