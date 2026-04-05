-- 0010_upsert_tenant_member.sql
-- Atomic RPC to invite or add a user to a tenant context

CREATE OR REPLACE FUNCTION qione.upsert_tenant_member(
    t_id UUID,
    p_email TEXT,
    p_display_name TEXT
) RETURNS VOID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- 1. Check if user already exists in auth.users (if using email)
    -- Note: In this simulation we assume they exist or we create a placeholder in qione.users.
    -- In a real Supabase Auth setup, you would use auth.invite_user_by_email().
    
    SELECT id INTO v_user_id FROM qione.users WHERE email = p_email;
    
    IF v_user_id IS NULL THEN
        -- Create a placeholder user record
        INSERT INTO qione.users (email, is_active)
        VALUES (p_email, true)
        RETURNING id INTO v_user_id;
    END IF;

    -- 2. Add to tenant_members
    INSERT INTO qione.tenant_members (tenant_id, user_id, display_name, status)
    VALUES (t_id, v_user_id, p_display_name, 'active')
    ON CONFLICT (tenant_id, user_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        status = 'active';

    -- 3. Assign base 'Family' role by default if it exists and no role assigned
    IF NOT EXISTS (SELECT 1 FROM qione.member_roles WHERE tenant_id = t_id AND user_id = v_user_id) THEN
        INSERT INTO qione.member_roles (tenant_id, user_id, role_id)
        SELECT t_id, v_user_id, id FROM qione.roles 
        WHERE tenant_id = t_id AND name = 'Family'
        LIMIT 1;
    END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
