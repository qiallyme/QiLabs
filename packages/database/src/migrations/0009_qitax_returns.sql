-- ==========================================
-- 🧾 MIGRATION 0009: QITAX
-- Tax Return Tracking and Filing State
-- ==========================================

CREATE SCHEMA IF NOT EXISTS qitax;

-- 1. TAX RETURNS
CREATE TABLE IF NOT EXISTS qitax.returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES qione.tenants(id) ON DELETE CASCADE,
    tax_year INT NOT NULL CHECK (tax_year >= 1900 AND tax_year <= 3000),
    return_type TEXT NOT NULL, -- e.g. '1040', 'IN-IT40'
    filing_kind TEXT NOT NULL CHECK (filing_kind IN ('original', 'amended')),
    status TEXT NOT NULL DEFAULT 'intake' CHECK (status IN ('intake', 'prep', 'review', 'signature', 'ready_to_file', 'filed', 'accepted', 'rejected')),
    version INT NOT NULL DEFAULT 1 CHECK (version >= 1),

    canonical_archive_id TEXT REFERENCES qiarchive.archive_files(archive_id) ON DELETE SET NULL, -- The final compiled PDF

    summary JSONB NOT NULL DEFAULT '{}'::jsonb, -- Flexible data: refund amounts, jurisdiction, efile status
    notes TEXT,

    created_by UUID REFERENCES qione.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, tax_year, return_type, filing_kind, version)
);

-- 2. RETURN SOURCE FILES
CREATE TABLE IF NOT EXISTS qitax.return_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_id UUID NOT NULL REFERENCES qitax.returns(id) ON DELETE CASCADE,
    archive_id TEXT NOT NULL REFERENCES qiarchive.archive_files(archive_id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('source_doc', 'signed_form', 'draft', 'final')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(return_id, archive_id)
);

CREATE TRIGGER update_qitax_returns_modtime BEFORE UPDATE ON qitax.returns FOR EACH ROW EXECUTE FUNCTION qione.update_modified_column();