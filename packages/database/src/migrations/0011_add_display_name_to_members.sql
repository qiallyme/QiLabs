-- 0011_add_display_name_to_members.sql
-- Adding tenant-specific display name to members

ALTER TABLE qione.tenant_members 
ADD COLUMN IF NOT EXISTS display_name TEXT;
