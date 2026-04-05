/**
 * QiNote v2.0 - Type Definitions
 * Editor-only note-taking app for QiOS
 */

export interface Note {
  id: string;
  title: string;
  slug: string;
  realm: string;
  content_md: string;
  content_html: string;
  tags: string[];
  backlinks: string[];
  sensitivity: 'public' | 'internal' | 'confidential' | 'restricted' | 'secret';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteRequest {
  title: string;
  slug: string;
  realm: string;
  content_md: string;
  content_html: string;
  tags?: string[];
  backlinks?: string[];
  sensitivity?: string;
  metadata?: Record<string, any>;
}

export interface UpdateNoteRequest extends Partial<CreateNoteRequest> {}

export interface IngestRequest {
  file_path: string;
  slug: string;
  mime_type?: string;
  file_ext?: string;
  content: string;
  realm?: string;
  qid?: string;
  meta?: Record<string, any>;
}

export interface IngestResponse {
  ok: boolean;
  id: string;
}

export interface IngestStatus {
  ingestion_id: string;
  status: 'queued' | 'processing' | 'complete' | 'error';
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface QueryRequest {
  query?: string;
  query_note_id?: string;
  mode?: 'search' | 'related';
  realm?: string;
  filters?: {
    tags?: string[];
    sensitivity_max?: string;
  };
  limit?: number;
  include_snippets?: boolean;
}

export interface QueryResult {
  note_id: string;
  title: string;
  realm: string;
  score: number;
  snippet_md?: string;
  path?: string;
  tags: string[];
}

export interface QueryResponse {
  results: QueryResult[];
}

export interface NoteAssistRequest {
  intent: 'summarize' | 'rewrite' | 'outline' | 'tag' | 'qa';
  note: {
    id: string;
    title: string;
    realm: string;
    content_md: string;
    tags?: string[];
  };
  selection?: {
    type: 'text' | 'range';
    value: string;
    start_offset?: number;
    end_offset?: number;
  };
  user_instruction?: string;
}

export interface NoteAssistResponse {
  intent: string;
  summary_md?: string;
  rewritten_md?: string;
  outline_md?: string;
  suggested_tags?: string[];
  answer_md?: string;
}

