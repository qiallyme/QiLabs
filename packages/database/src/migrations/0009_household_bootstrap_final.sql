-- 0009_household_bootstrap_final.sql
-- Final Household Bootstrap: Admin, Mom, & Roommate
-- Integrates with the new 'registry' for namespace allocation

DO $$
DECLARE
  -- 1. UUID DEFINITIONS (REPLACE WITH YOUR ACTUAL AUTH UUIDS)
  v_admin_id  UUID := 'b2ba0069-a024-4b5b-893f-a16bd17e2815'; -- You
  v_mom_id    UUID := 'ad7845bb-b444-4976-9add-10b2bf666c30'; -- Placeholder (Change Me)
  v_roomie_id UUID := 'ad7845bb-b444-4976-9add-10b2bf666c30'; -- Placeholder (Change Me)

  v_tenant_id UUID;
  v_role_id   UUID;
  v_band_code TEXT := '5120TNT'; -- Allocated namespace for the household container
BEGIN
  -- A. ENSURE TENANT (CODY RICE-VELASQUEZ HOME)
  INSERT INTO qione.tenants (name, slug, type, created_by)
  VALUES ('VELASQUEZ-RICE HOUSEHOLD', 'velasquez-rice-home', 'home', v_admin_id)
  ON CONFLICT (slug) DO UPDATE SET type = 'home'
  RETURNING id INTO v_tenant_id;

  -- B. NAMESPACE REGISTRY ALLOCATION
  -- Note: We allocate ONE code for the entire tenant workspace container.
  INSERT INTO registry.namespace_allocations (
    namespace_code, namespace_class, owner_type, owner_id, band_start, band_label, status, display_name
  ) VALUES (
    v_band_code, 'tenant', 'tenant', v_tenant_id, 5000, 'WSP', 'active', 'Primary Household Workspace'
  ) ON CONFLICT (namespace_code) DO NOTHING;

  -- C. ROLES SETUP
  -- 1. Owner role
  INSERT INTO qione.roles (tenant_id, name, rank)
  VALUES (v_tenant_id, 'Owner', 1) ON CONFLICT DO NOTHING;

  -- 2. Family role
  INSERT INTO qione.roles (tenant_id, name, rank)
  VALUES (v_tenant_id, 'Family', 10) ON CONFLICT DO NOTHING;

  -- D. MEMBERSHIP ASSIGNMENT
  -- 1. Add Admin
  INSERT INTO qione.tenant_members (tenant_id, user_id, status, display_name)
  VALUES (v_tenant_id, v_admin_id, 'active', 'Cody') ON CONFLICT DO NOTHING;

  -- 2. Add Mom
  INSERT INTO qione.tenant_members (tenant_id, user_id, status, display_name)
  VALUES (v_tenant_id, v_mom_id, 'active', 'Mom') ON CONFLICT DO NOTHING;

  -- 3. Add Roommate
  INSERT INTO qione.tenant_members (tenant_id, user_id, status, display_name)
  VALUES (v_tenant_id, v_roomie_id, 'active', 'Roommate') ON CONFLICT DO NOTHING;

  -- E. ROLE LINKING
  -- Link Admin to Owner
  INSERT INTO qione.member_roles (tenant_id, user_id, role_id)
  SELECT v_tenant_id, v_admin_id, id FROM qione.roles
  WHERE tenant_id = v_tenant_id AND name = 'Owner'
  ON CONFLICT DO NOTHING;

  -- Link Mom & Roommate to Family
  INSERT INTO qione.member_roles (tenant_id, user_id, role_id)
  SELECT v_tenant_id, v_mom_id, id FROM qione.roles
  WHERE tenant_id = v_tenant_id AND name = 'Family'
  ON CONFLICT DO NOTHING;

  INSERT INTO qione.member_roles (tenant_id, user_id, role_id)
  SELECT v_tenant_id, v_roomie_id, id FROM qione.roles
  WHERE tenant_id = v_tenant_id AND name = 'Family'
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'SUCCESS: Household bootstrapped under namespace %', v_band_code;
END $$;
