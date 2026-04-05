-- 0008_get_tenant_members_with_roles.sql
-- Helper RPC for admin portal to fetch members with their aggregated roles

CREATE OR REPLACE FUNCTION qione.get_tenant_members_with_roles(t_id UUID)
RETURNS TABLE (
    user_id UUID,
    display_name TEXT,
    status TEXT,
    roles TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tm.user_id,
        tm.display_name,
        tm.status,
        ARRAY_AGG(r.name) FILTER (WHERE r.name IS NOT NULL) as roles
    FROM qione.tenant_members tm
    LEFT JOIN qione.member_roles mr ON tm.tenant_id = mr.tenant_id AND tm.user_id = mr.user_id
    LEFT JOIN qione.roles r ON mr.role_id = r.id
    WHERE tm.tenant_id = t_id
    GROUP BY tm.user_id, tm.display_name, tm.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
