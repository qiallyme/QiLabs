-- Enable Row Level Security
alter table kb_embeddings enable row level security;

-- READ: Allow anonymous (anon) role to read embeddings
-- This allows the Worker/API to query via match_kb RPC function
create policy "read-embeddings" on kb_embeddings for select to anon using (true);

-- WRITE: Allow anonymous (anon) role to insert/update for development
-- Note: In production, use service_role key which bypasses RLS (more secure)
-- This policy allows ingestion scripts using anon key to work
create policy "write-embeddings" on kb_embeddings for all to anon using (true) with check (true);

-- Function permissions: Allow anon to execute match_kb
grant execute on function match_kb to anon;
