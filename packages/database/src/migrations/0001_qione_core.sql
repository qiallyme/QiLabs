-- ==========================================
-- 🧬 MIGRATION 0001: QIONE PLATFORM CORE
-- Multi-tenant foundation, Users, and RBAC
-- ==========================================

CREATE SCHEMA IF NOT EXISTS qione;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. GLOBAL USERS
CREATE TABLE IF NOT EXISTS qione.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_super_admin BOOLEAN DEFAULT false, -- ★ THE "GOD MODE" FLAG ★
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TENANTS (Workspaces / Contexts)
CREATE TABLE IF NOT EXISTS qione.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('home', 'business', 'client', 'system')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES qione.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TENANT MEMBERSHIP
CREATE TABLE IF NOT EXISTS qione.tenant_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES qione.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES qione.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'disabled')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, user_id)
);

-- 4. GLOBAL MODULE CATALOG
CREATE TABLE IF NOT EXISTS qione.modules (
    key TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    route TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 5. TENANT MODULE ENTITLEMENTS
CREATE TABLE IF NOT EXISTS qione.tenant_modules (
    tenant_id UUID NOT NULL REFERENCES qione.tenants(id) ON DELETE CASCADE,
    module_key TEXT NOT NULL REFERENCES qione.modules(key) ON DELETE CASCADE,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    PRIMARY KEY (tenant_id, module_key)
);

-- 6. CUSTOM ROLES PER TENANT
CREATE TABLE IF NOT EXISTS qione.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES qione.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    rank INT NOT NULL DEFAULT 100,
    UNIQUE (tenant_id, name)
);

-- 7. ROLE ASSIGNMENTS
CREATE TABLE IF NOT EXISTS qione.member_roles (
    tenant_id UUID NOT NULL REFERENCES qione.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES qione.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES qione.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (tenant_id, user_id, role_id)
);

-- 8. MODULE PERMISSIONS BY ROLE
CREATE TABLE IF NOT EXISTS qione.module_role_access (
    tenant_id UUID NOT NULL REFERENCES qione.tenants(id) ON DELETE CASCADE,
    module_key TEXT NOT NULL REFERENCES qione.modules(key) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES qione.roles(id) ON DELETE CASCADE,
    access_level TEXT NOT NULL CHECK (access_level IN ('none', 'read', 'write', 'admin')),
    PRIMARY KEY (tenant_id, module_key, role_id)
);

-- Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION qione.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_qione_users_modtime BEFORE UPDATE ON qione.users FOR EACH ROW EXECUTE FUNCTION qione.update_modified_column();
CREATE TRIGGER update_qione_tenants_modtime BEFORE UPDATE ON qione.tenants FOR EACH ROW EXECUTE FUNCTION qione.update_modified_column();

-- Seed Core Modules
INSERT INTO qione.modules (key, name, description, route) VALUES
  ('qione_admin', 'QiOne Admin', 'Tenant settings, members, and roles', '/settings'),
  ('qihome', 'QiHome', 'Household Ledger & Chores', '/m/qihome'),
  ('qitax', 'QiTax', 'Tax return tracking and storage', '/m/qitax'),
  ('qichronicle', 'QiChronicle', 'Timeline & Calendar management', '/m/qichronicle'),
  ('qicase', 'QiCase', 'Legal matter and issue tracking', '/m/qicase')
ON CONFLICT (key) DO NOTHING;