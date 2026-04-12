-- QiArchive Cloud Ledger Schema
-- Authoritative state for the document pipeline

CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    doc_id VARCHAR(20) UNIQUE NOT NULL, -- QDOC-YYYY-NNNNNN
    file_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256
    original_filename TEXT NOT NULL,
    canonical_filename TEXT UNIQUE NOT NULL,
    slug TEXT NOT NULL,
    doc_date VARCHAR(20) DEFAULT 'undated',
    status VARCHAR(20) NOT NULL DEFAULT 'inbox',
    paperless_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    handed_off_at TIMESTAMP WITH TIME ZONE,
    indexed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_documents_doc_id ON documents(doc_id);
CREATE INDEX IF NOT EXISTS idx_documents_file_hash ON documents(file_hash);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

-- Dedupe Report Table
CREATE TABLE IF NOT EXISTS dedupe_logs (
    id SERIAL PRIMARY KEY,
    duplicate_filename TEXT NOT NULL,
    duplicate_hash VARCHAR(64) NOT NULL,
    existing_doc_id VARCHAR(20) NOT NULL REFERENCES documents(doc_id),
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
