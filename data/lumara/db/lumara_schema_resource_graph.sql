-- Lumara Resource & Opportunity Graph schema (Supabase/Postgres)

create table entities (
  id uuid primary key default gen_random_uuid(),
  type text check (type in ('member','partner','volunteer','professional','staff')) not null,
  display_name text,
  email text,
  phone text,
  languages text[] default '{}',
  trust_level text check (trust_level in ('unverified','member','partner','verified_partner','staff')) default 'member',
  location_zip text,
  location_lat double precision,
  location_long double precision,
  skills text[] default '{}',
  availability jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table offers (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid references entities(id) on delete set null,
  type text check (type in ('food','clothing','device','furniture','giftcard','ticket','skill','service','transport','shelter','recoverable_funds','other')) not null,
  title text not null,
  description text,
  tags text[] default '{}',
  location_zip text,
  location_lat double precision,
  location_long double precision,
  availability_window tstzrange,
  constraints text[] default '{}',
  estimated_value numeric,
  trust_level text check (trust_level in ('member','partner','verified_partner','staff')) default 'member',
  status text check (status in ('active','matched','expired','withdrawn')) default 'active',
  created_at timestamptz default now(),
  expires_at timestamptz
);

create table needs (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid references entities(id) on delete set null,
  category text check (category in ('food','housing','clothes','device','transport','legal','tax','benefits','safety','other')) not null,
  description text,
  severity int check (severity between 0 and 100) default 0,
  tags text[] default '{}',
  location_zip text,
  location_lat double precision,
  location_long double precision,
  urgency text check (urgency in ('low','medium','high','critical')) default 'low',
  eligibility text[] default '{}',
  status text check (status in ('open','matched','resolved','escalated')) default 'open',
  created_at timestamptz default now()
);

create table matches (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid references offers(id) on delete cascade,
  need_id uuid references needs(id) on delete cascade,
  navigator_id uuid references entities(id) on delete set null,
  score numeric,
  status text check (status in ('suggested','approved','declined','completed','cancelled')) default 'suggested',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index on offers using gin (tags);
create index on needs using gin (tags);
create index on offers (status);
create index on needs (status);
create index on matches (status);
