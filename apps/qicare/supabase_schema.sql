-- QiHealth Schema (User-Centric Isolation with Admin override)
create schema if not exists qihealth;

-- Note: The auth.users table natively exists in Supabase. We just reference it.
-- 1. PROFILES (Extends Auth in public schema)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  display_name text,
  role text check (role in ('admin', 'primary', 'secondary', 'viewer', 'provider')),
  created_at timestamptz default now()
);

-- Safely ensure 'role' column exists if this table was pre-existing from another module
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text check (role in ('admin', 'primary', 'secondary', 'viewer', 'provider'));

-- Admin Check Function (Used in RLS)
create or replace function public.is_admin() returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- 2. CARE EVENTS (Syncs with CareEvent Type)
create table if not exists qihealth.care_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) not null default auth.uid(),
  patient_id text,
  household_id text,
  type text,
  category text,
  label text,
  details jsonb,
  dose text,
  route text,
  note text,
  input_method text,
  created_by text,
  created_at timestamptz default now(),
  synced boolean default true
);

-- 3. PATIENTS (Syncs with Patient Type)
create table if not exists qihealth.patients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) not null default auth.uid(),
  household_id text,
  name text,
  age int,
  photo_url text,
  conditions jsonb default '[]'::jsonb,
  allergies jsonb default '[]'::jsonb,
  baseline_medications jsonb default '[]'::jsonb,
  prn_medications jsonb default '[]'::jsonb,
  emergency_contacts jsonb default '[]'::jsonb,
  doctor_contacts jsonb default '[]'::jsonb,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- SECURITY POLICIES --
alter table public.profiles enable row level security;
alter table qihealth.care_events enable row level security;
alter table qihealth.patients enable row level security;

-- Drop existing if re-running
drop policy if exists "Users and Admins Manage Profiles" on public.profiles;
drop policy if exists "Users and Admins Manage Events" on qihealth.care_events;
drop policy if exists "Users and Admins Manage Patients" on qihealth.patients;

-- Owners can access their own data. Admins can access everything.
create policy "Users and Admins Manage Profiles" on public.profiles
  for all using (id = auth.uid() or public.is_admin());

create policy "Users and Admins Manage Events" on qihealth.care_events
  for all using (owner_id = auth.uid() or public.is_admin());

create policy "Users and Admins Manage Patients" on qihealth.patients
  for all using (owner_id = auth.uid() or public.is_admin());

-- Realtime Setup
alter publication supabase_realtime add table qihealth.care_events;
alter publication supabase_realtime add table qihealth.patients;
