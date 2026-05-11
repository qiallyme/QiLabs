-- QiOS QID Counter Seed
-- Minimal canon design for atomic QID generation
-- Run once in `qios-core`:

-- QID Counter Table
-- Single-row table with boolean primary key (always true)
-- Stores the next QID to be claimed in a global monotonic sequence
create table if not exists public.qid_counter (
  id boolean primary key default true,
  next_qid bigint not null,
  updated_at timestamptz default now()
);

-- Initialize counter to 1 (first QID will be 1)
insert into public.qid_counter (id, next_qid)
values (true, 1)
on conflict (id) do nothing;

-- Atomic QID Claim Function
-- Atomically increments counter and returns the claimed QID
-- Thread-safe: uses UPDATE with RETURNING to prevent race conditions
create or replace function public.claim_qid()
returns bigint
language plpgsql
as $$
declare
  claimed bigint;
begin
  update public.qid_counter
  set next_qid = next_qid + 1,
      updated_at = now()
  where id = true
  returning next_qid - 1 into claimed;

  return claimed;
end;
$$;

