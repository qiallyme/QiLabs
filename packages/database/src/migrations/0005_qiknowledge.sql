-- ==========================================
-- 📝 MIGRATION 0005: QIKNOWLEDGE
-- Notes, Wikis, and Authored Content
-- ==========================================

CREATE SCHEMA IF NOT EXISTS qiknowledge;

-- 1. NOTES (QiNote)
CREATE TABLE IF NOT EXISTS qiknowledge.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES qione.tenants(id) ON DELETE CASCADE,
    qid TEXT UNIQUE NOT NULL REFERENCES qigraph.master_index(qid) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content_md TEXT,
    content_html TEXT,
    sensitivity TEXT NOT NULL DEFAULT 'internal' CHECK (sensitivity IN ('public', 'internal', 'confidential')),
    author_id UUID REFERENCES qione.users(id) ON DELETE SET NULL,
    meta JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_tenant ON qiknowledge.notes(tenant_id);