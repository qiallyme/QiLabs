-- =================================================
-- QiOS Domain: CARE
-- Target Schema: care
-- Description: Core schema for Mom Care PWA
-- Compliance: QiOS Master Blueprint v0.4
-- =================================================

-- 1. SETUP SCHEMA
CREATE SCHEMA IF NOT EXISTS care;
CREATE SCHEMA IF NOT EXISTS inventory;

-- 2. ENABLE RLS
-- (Global RLS activation for the schemas)

-- 3. CORE TABLES

-- 3.1 Profiles (Extended from Auth)
-- This table is in 'public' per QiOS Placement Rule 51
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
    tenant_id uuid NOT NULL,
    display_name TEXT,
    role TEXT CHECK (role IN ('primary', 'secondary', 'viewer', 'provider')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3.2 Household / Tenants
-- This facilitates the 'shared family' access
CREATE TABLE IF NOT EXISTS public.tenants (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 3.3 Medications (care.medications)
CREATE TABLE IF NOT EXISTS care.medications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid NOT NULL,
    medication TEXT NOT NULL,
    strength TEXT,
    form TEXT,
    rx_number TEXT,
    prescriber TEXT,
    dosage_instructions TEXT,
    frequency TEXT,
    category TEXT CHECK (category IN ('rx', 'otc', 'emergency')),
    is_active BOOLEAN DEFAULT true,
    quantity_prescribed TEXT,
    quantity_remaining TEXT,
    expiration_date DATE,
    refills_allowed TEXT,
    last_filled_at timestamptz,
    notes TEXT,
    owner_user_id uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE care.medications ENABLE ROW LEVEL SECURITY;

-- 3.4 Care Events / Activity Log
CREATE TABLE IF NOT EXISTS care.activity_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid NOT NULL,
    patient_id TEXT, -- For now, string ID if singleton
    type TEXT NOT NULL,
    category TEXT,
    label TEXT NOT NULL,
    details jsonb DEFAULT '{}'::jsonb,
    note TEXT,
    input_method TEXT DEFAULT 'manual',
    is_voided BOOLEAN DEFAULT false,
    owner_user_id uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now()
);

ALTER TABLE care.activity_log ENABLE ROW LEVEL SECURITY;

-- 3.5 Vitals
CREATE TABLE IF NOT EXISTS care.vitals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid NOT NULL,
    performed_at timestamptz DEFAULT now(),
    systolic_bp INTEGER,
    diastolic_bp INTEGER,
    pulse INTEGER,
    o2_sat_percent INTEGER,
    weight_lbs NUMERIC,
    notes TEXT,
    owner_user_id uuid REFERENCES auth.users(id)
);

ALTER TABLE care.vitals ENABLE ROW LEVEL SECURITY;

-- 3.6 Inventory (inventory.items)
CREATE TABLE IF NOT EXISTS inventory.items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid NOT NULL,
    item_name TEXT NOT NULL,
    category TEXT,
    status TEXT,
    quantity_full INTEGER DEFAULT 0,
    quantity_empty INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 1,
    location TEXT,
    notes TEXT,
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE inventory.items ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES (TENANT ISOLATION)

-- Policy Template: Users can only see data belonging to their tenant_id
-- We assume the tenant_id is injected into the JWT via app_metadata

CREATE POLICY "Tenant Isolation: SELECT" ON care.medications
    FOR SELECT USING (tenant_id = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)::uuid);
CREATE POLICY "Tenant Isolation: INSERT" ON care.medications
    FOR INSERT WITH CHECK (tenant_id = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)::uuid);
CREATE POLICY "Tenant Isolation: UPDATE" ON care.medications
    FOR UPDATE USING (tenant_id = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)::uuid);
CREATE POLICY "Tenant Isolation: DELETE" ON care.medications
    FOR DELETE USING (tenant_id = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)::uuid);

-- Repeated for other tables...
CREATE POLICY "Tenant Isolation: SELECT" ON care.activity_log FOR SELECT USING (tenant_id = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)::uuid);
CREATE POLICY "Tenant Isolation: INSERT" ON care.activity_log FOR INSERT WITH CHECK (tenant_id = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)::uuid);
CREATE POLICY "Tenant Isolation: UPDATE" ON care.activity_log FOR UPDATE USING (tenant_id = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)::uuid);

CREATE POLICY "Tenant Isolation: SELECT" ON care.vitals FOR SELECT USING (tenant_id = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)::uuid);
CREATE POLICY "Tenant Isolation: INSERT" ON care.vitals FOR INSERT WITH CHECK (tenant_id = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)::uuid);

CREATE POLICY "Tenant Isolation: SELECT" ON inventory.items FOR SELECT USING (tenant_id = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)::uuid);
CREATE POLICY "Tenant Isolation: INSERT" ON inventory.items FOR INSERT WITH CHECK (tenant_id = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)::uuid);
CREATE POLICY "Tenant Isolation: UPDATE" ON inventory.items FOR UPDATE USING (tenant_id = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)::uuid);
