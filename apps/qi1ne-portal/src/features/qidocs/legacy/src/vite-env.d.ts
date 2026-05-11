/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;

  // Orchestrator worker (GINA chat, health, workers status)
  readonly VITE_WORKER_URL?: string;

  // Ingestion worker (file ingestion)
  readonly VITE_INGEST_WORKER_URL?: string;

  // Memory worker (semantic search/query)
  readonly VITE_MEMORY_WORKER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
