-- ==========================================
-- 📚 MIGRATION 0002: QIARCHIVE SPINE
-- The canonical identity and ingestion backbone
-- ==========================================

CREATE SCHEMA IF NOT EXISTS qiarchive;
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. PREFIX REGISTRY (Namespaces)
-- e.g., domain_prefix: 'BBR4821', entity_type: 'business', display_name: 'BuiltByRays'
CREATE TABLE IF NOT EXISTS qiarchive.prefix_registry (
    domain_prefix TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CANONICAL ARCHIVE FILES
-- The absolute source of truth for any ingested object.
CREATE TABLE IF NOT EXISTS qiarchive.archive_files (
    archive_id TEXT PRIMARY KEY, -- e.g. ULID or UUID defined by the intake worker
    domain_prefix TEXT REFERENCES qiarchive.prefix_registry(domain_prefix),
    short_code TEXT NOT NULL CHECK (short_code ~ '^Q[A-F0-9]{6}$'),
    original_filename TEXT NOT NULL,
    normalized_filename TEXT NOT NULL, -- e.g., bbr4821_2025_tax_return_qa3f91c.pdf
    sha256 TEXT NOT NULL UNIQUE,
    mime_type TEXT,
    file_ext TEXT,
    source_type TEXT, -- 'watched_inbox', 'manual_upload', 'api'
    storage_path TEXT,
    file_size BIGINT,
    status TEXT NOT NULL DEFAULT 'registered'
        CHECK (status IN ('registered', 'extracted', 'chunked', 'embedded', 'routed', 'failed')),
    route_confidence REAL DEFAULT 0,
    extracted_text TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CHUNKS & EMBEDDINGS (pgvector)
-- Sub-components of the canonical file for semantic search
CREATE TABLE IF NOT EXISTS qiarchive.archive_chunks (
    chunk_id BIGSERIAL PRIMARY KEY,
    archive_id TEXT NOT NULL REFERENCES qiarchive.archive_files(archive_id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    text TEXT NOT NULL,
    embedding VECTOR(1536),
    embedding_model TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. INGESTION WORKER JOBS
CREATE TABLE IF NOT EXISTS qiarchive.ingest_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    archive_id TEXT REFERENCES qiarchive.archive_files(archive_id) ON DELETE CASCADE,
    job_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'complete', 'failed')),
    worker_id TEXT,
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. AUDIT & LINEAGE HISTORY
CREATE TABLE IF NOT EXISTS qiarchive.file_history (
    id BIGSERIAL PRIMARY KEY,
    archive_id TEXT NOT NULL REFERENCES qiarchive.archive_files(archive_id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    actor TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_archive_files_sha256 ON qiarchive.archive_files(sha256);
CREATE INDEX idx_archive_files_status ON qiarchive.archive_files(status);
CREATE INDEX idx_archive_files_prefix ON qiarchive.archive_files(domain_prefix);
CREATE INDEX idx_archive_chunks_archive ON qiarchive.archive_chunks(archive_id);
CREATE INDEX idx_archive_chunks_embedding ON qiarchive.archive_chunks USING ivfflat (embedding vector_cosine_ops);

-- Triggers
CREATE TRIGGER update_prefix_registry_modtime BEFORE UPDATE ON qiarchive.prefix_registry FOR EACH ROW EXECUTE FUNCTION qione.update_modified_column();
CREATE TRIGGER update_archive_files_modtime BEFORE UPDATE ON qiarchive.archive_files FOR EACH ROW EXECUTE FUNCTION qione.update_modified_column();