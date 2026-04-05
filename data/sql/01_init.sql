create extension if not exists vector;
create table if not exists kb_embeddings (
  id bigserial primary key,
  doc_path text not null,
  chunk_index int not null,
  text text not null,
  chunk_hash text not null unique,  -- SHA-256 hash for deduplication
  embedding vector(1536),
  meta jsonb default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create index if not exists kb_embeddings_embedding_idx on kb_embeddings using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index if not exists kb_embeddings_gin on kb_embeddings using gin (to_tsvector('english', text));
create unique index if not exists kb_embeddings_chunk_hash_idx on kb_embeddings(chunk_hash);
create or replace function match_kb(query_embedding vector(1536), match_count int default 6)
returns table(id bigint, doc_path text, chunk_index int, text text, sim float)
language sql stable as $$
  select e.id, e.doc_path, e.chunk_index, e.text,
         1 - (e.embedding <=> query_embedding) as sim
  from kb_embeddings e
  order by e.embedding <=> query_embedding
  limit match_count;
$$;
