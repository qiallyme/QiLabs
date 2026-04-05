-- ==========================================
-- 🔐 MIGRATION 0012: QIVAULT
-- Contracts, Forms, and Formal Documents
-- ==========================================

CREATE SCHEMA IF NOT EXISTS qivault;

CREATE TABLE IF NOT EXISTS qivault.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES qione.tenants(id) ON DELETE CASCADE,
    qid TEXT UNIQUE REFERENCES qigraph.master_index(qid) ON DELETE CASCADE,
    archive_id TEXT NOT NULL REFERENCES qiarchive.archive_files(archive_id) ON DELETE CASCADE, -- The actual file

    doc_type TEXT NOT NULL CHECK (doc_type IN ('contract', 'html_doc', 'form_submission', 'receipt')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'executed', 'archived')),

    -- If it's a dynamic form, the answers live here
    form_data JSONB DEFAULT '{}'::jsonb,

    -- Signatures and formal routing
    signed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);