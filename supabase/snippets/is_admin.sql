-- 1. Create the helper function in the public schema
create or replace function public.is_admin()
returns boolean as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false);
$$ language sql security definer;

-- 2. Enable RLS on the table (if not already done)
alter table public.documents enable row level security;

-- 3. Policy: Clients see only their documents. Admins see EVERYTHING.
create policy "Tenant isolation with Admin bypass"
on public.documents
for all
using (
  owner_id = auth.uid() OR public.is_admin()
);