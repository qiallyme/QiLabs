-- ==========================================
-- 📇 MIGRATION 0011: QICRM
-- Contacts, Clients, and Organizations
-- ==========================================

CREATE SCHEMA IF NOT EXISTS qicrm;

CREATE TABLE IF NOT EXISTS qicrm.contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES qione.tenants(id) ON DELETE CASCADE,
    qid TEXT UNIQUE REFERENCES qigraph.master_index(qid) ON DELETE CASCADE,
    contact_type TEXT NOT NULL DEFAULT 'person' CHECK (contact_type IN ('person', 'company', 'vendor', 'client')),
    first_name TEXT,
    last_name TEXT,
    company_name TEXT,
    email TEXT,
    phone TEXT,
    address JSONB DEFAULT '{}'::jsonb,
    meta JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Note: Because we have `qigraph.edges`, we don't need a million linking tables!
-- If you want to link a Contact to a Tax Return, you just create an edge in `qigraph.edges`
-- from the Contact's QID to the Tax Return's QID.