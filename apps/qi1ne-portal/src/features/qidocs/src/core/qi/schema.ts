export interface QiNode {
  qid: string;
  title: string;
  realm: string;
  orbit: string;
  system: string;
  status?: string;
  tags?: string[];
  summary?: string;
  body?: string;
  entanglement?: {
    origin_qid?: string;
    influence_qid?: string;
    companion_qid?: string;
  };
  time?: {
    created_at: string;
    updated_at: string;
    occurred_at?: string;
  };
  credits?: {
    author: string;
    created_by: string;
    device?: string;
  };
  source?: {
    type: string;
    files?: Array<{ path: string; kind: string }>;
    external_refs?: Array<{ url: string; label?: string }>;
  };
  indexing?: {
    embedding_ids?: string[];
    chunk_ids?: string[];
    last_embedded_at?: string;
    model_version?: string;
  };
  ai?: {
    reflective_score?: number;
    ai_tags?: string[];
    insights?: string[];
  };
}

