-- Migration: Add chunk_hash column for deduplication
-- Run this if you already have kb_embeddings table without chunk_hash

-- Add chunk_hash column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'kb_embeddings' AND column_name = 'chunk_hash'
    ) THEN
        ALTER TABLE kb_embeddings 
        ADD COLUMN chunk_hash text;
        
        -- Create unique index on chunk_hash
        CREATE UNIQUE INDEX IF NOT EXISTS kb_embeddings_chunk_hash_idx ON kb_embeddings(chunk_hash);
        
        -- Update existing rows with hash (optional, but good for existing data)
        UPDATE kb_embeddings 
        SET chunk_hash = encode(digest(text, 'sha256'), 'hex')
        WHERE chunk_hash IS NULL;
        
        -- Make it NOT NULL after populating
        ALTER TABLE kb_embeddings 
        ALTER COLUMN chunk_hash SET NOT NULL;
    END IF;
END $$;

