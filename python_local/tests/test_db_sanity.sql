-- Quick SQL sanity checks for Supabase
-- Run these in Supabase SQL Editor to verify migration

-- 1. Check embedding column type
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'semantic_profile'
  AND column_name = 'embedding';

-- Expected: udt_name should be 'vector' and data_type should show dimensions

-- 2. Check if embeddings exist
SELECT 
    id,
    file_path,
    embedding IS NOT NULL as has_embedding,
    embedding_status
FROM semantic_profile
WHERE embedding IS NOT NULL
LIMIT 5;

-- 3. Test RPC function exists
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'match_semantic_profile';

-- 4. Test RPC with dummy embedding
SELECT *
FROM match_semantic_profile(
    query_embedding := array_fill(0.01::float4, array[768])::vector(768),
    match_count := 3
);

-- Expected: Should return 0-3 rows (depending on data) without error

-- 5. Check embedding dimensions (if you have data)
SELECT 
    id,
    file_path,
    array_length(embedding::float4[], 1) as embedding_dim
FROM semantic_profile
WHERE embedding IS NOT NULL
LIMIT 5;

-- Expected: embedding_dim should be 768 for all rows

