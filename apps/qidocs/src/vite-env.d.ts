/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WORKER_URL?: string;
  readonly VITE_INGEST_WORKER_URL?: string;
  readonly VITE_MEMORY_WORKER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

