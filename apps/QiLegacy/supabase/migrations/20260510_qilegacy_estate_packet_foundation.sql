create extension if not exists pgcrypto;

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Estate Planning Packet',
  principal_full_legal_name text,
  principal_preferred_name text,
  date_of_birth date,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  jurisdiction_state text,
  family_notes text,
  dependent_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.estate_packets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  packet_label text not null default 'Draft packet',
  status text not null default 'draft' check (status in ('draft', 'in-review', 'ready-to-sign', 'completed', 'archived')),
  completion_percent integer not null default 0 check (completion_percent between 0 and 100),
  current_section text,
  last_exported_at timestamptz,
  source_reference jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.packet_people (
  id uuid primary key default gen_random_uuid(),
  packet_id uuid not null references public.estate_packets(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  full_legal_name text not null,
  relationship text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.packet_role_assignments (
  id uuid primary key default gen_random_uuid(),
  packet_id uuid not null references public.estate_packets(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  person_id uuid not null references public.packet_people(id) on delete cascade,
  role_type text not null check (
    role_type in (
      'executor',
      'alternate-executor',
      'primary-health-agent',
      'alternate-health-agent',
      'attorney-in-fact',
      'successor-trustee',
      'guardian',
      'hipaa-recipient',
      'witness',
      'notary-contact'
    )
  ),
  role_rank integer not null default 1,
  section_key text,
  created_at timestamptz not null default now(),
  unique (packet_id, role_type, role_rank)
);

create table if not exists public.packet_assets (
  id uuid primary key default gen_random_uuid(),
  packet_id uuid not null references public.estate_packets(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  asset_category text not null default 'uncategorized',
  description text not null,
  location_hint text,
  intended_recipient text,
  place_in_trust boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.packet_beneficiary_accounts (
  id uuid primary key default gen_random_uuid(),
  packet_id uuid not null references public.estate_packets(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  institution_name text not null,
  account_label text,
  account_type text,
  primary_beneficiary text,
  contingent_beneficiary text,
  percentage_notes text,
  reviewed_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.packet_document_answers (
  id uuid primary key default gen_random_uuid(),
  packet_id uuid not null references public.estate_packets(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  document_key text not null check (
    document_key in (
      'household',
      'will',
      'health-care',
      'financial-poa',
      'hipaa',
      'trust',
      'beneficiaries',
      'final-wishes',
      'signatures'
    )
  ),
  answers jsonb not null default '{}'::jsonb,
  completion_percent integer not null default 0 check (completion_percent between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (packet_id, document_key)
);

create table if not exists public.packet_exports (
  id uuid primary key default gen_random_uuid(),
  packet_id uuid not null references public.estate_packets(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  export_type text not null check (export_type in ('pdf-kit', 'json-backup', 'doc-review-bundle')),
  file_name text,
  storage_path text,
  export_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists households_set_updated_at on public.households;
create trigger households_set_updated_at
before update on public.households
for each row execute function public.set_updated_at();

drop trigger if exists estate_packets_set_updated_at on public.estate_packets;
create trigger estate_packets_set_updated_at
before update on public.estate_packets
for each row execute function public.set_updated_at();

drop trigger if exists packet_people_set_updated_at on public.packet_people;
create trigger packet_people_set_updated_at
before update on public.packet_people
for each row execute function public.set_updated_at();

drop trigger if exists packet_assets_set_updated_at on public.packet_assets;
create trigger packet_assets_set_updated_at
before update on public.packet_assets
for each row execute function public.set_updated_at();

drop trigger if exists packet_beneficiary_accounts_set_updated_at on public.packet_beneficiary_accounts;
create trigger packet_beneficiary_accounts_set_updated_at
before update on public.packet_beneficiary_accounts
for each row execute function public.set_updated_at();

drop trigger if exists packet_document_answers_set_updated_at on public.packet_document_answers;
create trigger packet_document_answers_set_updated_at
before update on public.packet_document_answers
for each row execute function public.set_updated_at();

create index if not exists idx_households_owner on public.households(owner_user_id);
create index if not exists idx_estate_packets_household on public.estate_packets(household_id);
create index if not exists idx_estate_packets_owner on public.estate_packets(owner_user_id);
create index if not exists idx_packet_people_packet on public.packet_people(packet_id);
create index if not exists idx_packet_role_assignments_packet on public.packet_role_assignments(packet_id);
create index if not exists idx_packet_assets_packet on public.packet_assets(packet_id);
create index if not exists idx_packet_beneficiary_accounts_packet on public.packet_beneficiary_accounts(packet_id);
create index if not exists idx_packet_document_answers_packet on public.packet_document_answers(packet_id);
create index if not exists idx_packet_exports_packet on public.packet_exports(packet_id);

alter table public.households enable row level security;
alter table public.estate_packets enable row level security;
alter table public.packet_people enable row level security;
alter table public.packet_role_assignments enable row level security;
alter table public.packet_assets enable row level security;
alter table public.packet_beneficiary_accounts enable row level security;
alter table public.packet_document_answers enable row level security;
alter table public.packet_exports enable row level security;

create policy "households owner access"
on public.households
for all
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

create policy "estate_packets owner access"
on public.estate_packets
for all
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

create policy "packet_people owner access"
on public.packet_people
for all
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

create policy "packet_role_assignments owner access"
on public.packet_role_assignments
for all
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

create policy "packet_assets owner access"
on public.packet_assets
for all
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

create policy "packet_beneficiary_accounts owner access"
on public.packet_beneficiary_accounts
for all
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

create policy "packet_document_answers owner access"
on public.packet_document_answers
for all
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

create policy "packet_exports owner access"
on public.packet_exports
for all
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.households to authenticated;
grant select, insert, update, delete on public.estate_packets to authenticated;
grant select, insert, update, delete on public.packet_people to authenticated;
grant select, insert, update, delete on public.packet_role_assignments to authenticated;
grant select, insert, update, delete on public.packet_assets to authenticated;
grant select, insert, update, delete on public.packet_beneficiary_accounts to authenticated;
grant select, insert, update, delete on public.packet_document_answers to authenticated;
grant select, insert, update, delete on public.packet_exports to authenticated;
