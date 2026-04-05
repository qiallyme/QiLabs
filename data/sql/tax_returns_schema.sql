-- Tax Returns Registry Schema
-- This is the canonical source of truth for all tax return tracking
-- Supabase = source of truth, Cockpit = interaction layer

-- Main tax_returns table
create table if not exists public.tax_returns (
  id                bigserial primary key,
  
  -- identity
  return_label      text not null,        -- "2024 - LUIS E MUNOZ ALTAMIRANO TAX RETURN"
  tax_year          integer not null,
  entity_type       text not null default 'Individual', -- Individual / Corporate / Partnership / ITIN Only
  return_category   text,                 -- 1040, 1040X, 1120S, ITIN, etc.
  original_or_amended text default 'Original',
  
  -- client info (denormalized for now)
  client_first_name   text,
  client_last_name    text,
  client_display_name text,
  company_name        text,
  primary_phone       text,
  alternate_phone     text,
  email               text,
  
  -- identifiers (keep full TIN somewhere more locked if you must)
  tin_last4         text,
  tin_type          text,                 -- SSN / ITIN / EIN / Pending
  
  -- timing
  tax_due_date          date,
  engagement_date       date,
  last_activity_at      timestamptz,
  
  -- filing statuses
  federal_filing_status text,             -- Not Started / Filed / Accepted / Rejected / Mailed / Pending ITIN / etc.
  federal_efile         boolean,
  federal_ack_number    text,
  state_filing_status   text,
  state_efile           boolean,
  state_ack_number      text,
  primary_state         text,             -- IN, OH, GA...
  other_states          text[],
  
  -- money
  prep_fee_amount       numeric(12,2),
  paid_amount           numeric(12,2),
  balance_due           numeric(12,2),
  federal_refund_or_due numeric(12,2),
  state_refund_or_due   numeric(12,2),
  commission_amount     numeric(12,2),
  invoice_reference     text,
  
  -- internal ops
  assigned_preparer     text,
  assigned_firm         text,
  pipeline_stage        text,             -- Intake, In Prep, Review, Filed, Post-Filing, Closed
  substage_flags        text[],           -- Payment Requested, Hot, etc.
  package_type          text,
  
  -- docs & notes
  doc_folder_link       text,
  main_tax_file_name    text,
  missing_docs_flag     boolean,
  missing_docs_summary  text,
  internal_notes        text,
  
  -- meta
  source_system         text,             -- "Notion", "Zoho", etc.
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- Indexes for common queries
create index if not exists idx_tax_returns_year on public.tax_returns (tax_year);
create index if not exists idx_tax_returns_client on public.tax_returns (client_display_name);
create index if not exists idx_tax_returns_stage on public.tax_returns (pipeline_stage);
create index if not exists idx_tax_returns_federal_status on public.tax_returns (federal_filing_status);
create index if not exists idx_tax_returns_preparer on public.tax_returns (assigned_preparer);

-- Auto-update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_tax_returns_updated_at
  before update on public.tax_returns
  for each row
  execute function update_updated_at_column();

-- Optional: Archive table for raw Notion import (keep as backup)
create table if not exists public.tax_returns_raw_notion (
  id bigserial primary key,
  raw jsonb,
  imported_at timestamptz default now()
);

-- Row Level Security (RLS) - adjust policies as needed
alter table public.tax_returns enable row level security;

-- Example policy: allow authenticated users to read/write (adjust based on your auth setup)
-- For now, we'll use service role key from Worker, so this may be permissive
-- You can tighten this later with proper user authentication
create policy "Allow service role full access" on public.tax_returns
  for all
  using (true)
  with check (true);

