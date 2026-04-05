-- USERS (optional, light)
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text unique,
  display_name text,
  created_at timestamptz default now()
);

-- GLOBAL EVENTS LOG
create table if not exists events (
  id bigserial primary key,
  module text,
  type text,
  payload jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_events_created_at on events (created_at desc);

--------------------------------------------------
-- JOB HUNTER
--------------------------------------------------

create table if not exists jobhunter_jobs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  title text not null,
  company text not null,
  location text,
  url text,
  source text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists jobhunter_applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  job_id uuid not null references jobhunter_jobs(id) on delete cascade,
  status text not null check (
    status in ('interested','applied','interview','offer','rejected')
  ),
  applied_at timestamptz,
  notes text,
  ai_match_score numeric,
  next_action text,
  next_action_due timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_jobhunter_apps_job_id
  on jobhunter_applications(job_id);

--------------------------------------------------
-- ENERGY TRACKER
--------------------------------------------------

create table if not exists energy_devices (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  name text not null,
  room text,
  category text,
  wattage numeric,           -- average wattage
  owner text,                -- person using it
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists energy_logs (
  id bigserial primary key,
  user_id uuid references users(id),
  device_id uuid references energy_devices(id) on delete cascade,
  date date not null,
  hours numeric,             -- hours used for that day
  kwh numeric,               -- computed
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_energy_logs_date
  on energy_logs(date);

--------------------------------------------------
-- MEMORY ITEMS (QiCockpit's own memory - legacy format)
--------------------------------------------------

create table if not exists memory_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  type text not null check (type in ('note', 'conversation', 'task')),
  text text not null,
  app_context text,  -- e.g., 'jobhunter', 'energy', 'home'
  source text check (source in ('ai', 'user', 'system')) default 'user',
  tags text[] default '{}',
  created_at timestamptz default now()
);

create index if not exists idx_memory_items_created_at
  on memory_items(created_at desc);
create index if not exists idx_memory_items_app_context
  on memory_items(app_context);
create index if not exists idx_memory_items_tags
  on memory_items using gin(tags);

--------------------------------------------------
-- GINA CONVERSATION MEMORY (Gina's conversation history)
--------------------------------------------------

create table if not exists gina_memory (
  id uuid primary key default gen_random_uuid(),
  user_id text default 'cody', -- single user for now
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  app_context text,   -- e.g. 'jobhunter', 'energy', 'home'
  tab_context text,   -- optional tab or view id
  created_at timestamptz not null default now()
);

create index if not exists idx_gina_memory_created_at on gina_memory (created_at desc);
create index if not exists idx_gina_memory_app_context on gina_memory (app_context, created_at desc);

--------------------------------------------------
-- BASIC RLS STUBS (if you want row-level security)
--------------------------------------------------
-- You can enable RLS and scope by user_id later if needed.

