-- 0007_namespace_registry.sql
-- Canonical Namespace Registry and Allocation Governance

CREATE SCHEMA IF NOT EXISTS registry;

-- 1. CONSTITUTIONAL BANDS REGISTRY
CREATE TABLE IF NOT EXISTS registry.namespace_bands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    band_start INTEGER NOT NULL UNIQUE,
    band_end INTEGER NOT NULL,
    band_label TEXT NOT NULL UNIQUE,
    canonical_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    allocation_mode TEXT NOT NULL DEFAULT 'manual',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT namespace_bands_status_check
        CHECK (status IN ('active', 'reserved', 'deprecated')),

    CONSTRAINT namespace_bands_allocation_mode_check
        CHECK (allocation_mode IN ('fixed', 'manual', 'auto'))
);

-- 2. OPERATIONAL ALLOCATIONS
CREATE TABLE IF NOT EXISTS registry.namespace_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    namespace_code TEXT NOT NULL,
    namespace_class TEXT NOT NULL,
    owner_type TEXT NOT NULL,
    owner_id UUID NOT NULL,
    band_start INTEGER NOT NULL REFERENCES registry.namespace_bands(band_start),
    band_label TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    display_name TEXT,
    notes TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT namespace_allocations_code_unique UNIQUE (namespace_code),

    CONSTRAINT namespace_allocations_status_check
        CHECK (status IN ('active', 'reserved', 'archived', 'released')),

    CONSTRAINT namespace_allocations_owner_type_check
        CHECK (owner_type IN ('band', 'tenant', 'matter', 'project', 'workspace', 'archive_partition', 'system')),

    CONSTRAINT namespace_allocations_class_check
        CHECK (namespace_class IN ('band', 'tenant', 'matter', 'project', 'workspace', 'archive', 'lab', 'legacy'))
);

-- 3. VALIDATION FUNCTIONS

-- Check if a namespace code is valid (simple regex + band check)
CREATE OR REPLACE FUNCTION registry.is_namespace_code_valid(code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Pattern: 4 digits followed by 3 uppercase letters, optional .3 digits
    RETURN code ~ '^\d{4}[A-Z]{3}(\.\d{3})?$';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. SEED INITIAL CANONICAL BANDS
INSERT INTO registry.namespace_bands (band_start, band_end, band_label, canonical_name, allocation_mode) VALUES
(0000, 0099, 'ROOT', 'Root', 'fixed'),
(0100, 0199, 'KBS',  'Knowledge Base', 'fixed'),
(0200, 0299, 'VLT',  'Vault', 'fixed'),
(0300, 0399, 'LGL',  'Legal', 'fixed'),
(0400, 0499, 'FIN',  'Finance', 'fixed'),
(0500, 0599, 'OPS',  'Operations', 'fixed'),
(0600, 0699, 'SYS',  'Systems', 'fixed'),
(0700, 0799, 'HUM',  'Human', 'fixed'),
(0800, 0899, 'HLT',  'Health', 'fixed'),
(0900, 0999, 'MED',  'Media', 'fixed'),
(1000, 1099, 'CRM',  'CRM', 'fixed'),
(1100, 1199, 'TPL',  'Templates', 'fixed'),
(1200, 1299, 'REF',  'Reference', 'fixed'),
(5000, 7999, 'WSP',  'Workspaces', 'auto'),
(8000, 8999, 'LAB',  'Lab', 'manual'),
(9000, 9999, 'ARC',  'Archive', 'fixed')
ON CONFLICT (band_start) DO NOTHING;

-- Trigger for updated_at
CREATE TRIGGER update_namespace_bands_modtime BEFORE UPDATE ON registry.namespace_bands FOR EACH ROW EXECUTE FUNCTION qione.update_modified_column();
CREATE TRIGGER update_namespace_allocations_modtime BEFORE UPDATE ON registry.namespace_allocations FOR EACH ROW EXECUTE FUNCTION qione.update_modified_column();
