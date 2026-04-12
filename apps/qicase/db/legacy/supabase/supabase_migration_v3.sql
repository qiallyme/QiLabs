-- 9. MASTER INDEX (qidcli)
-- Aligned with project UUID standard + QID support

CREATE TABLE IF NOT EXISTS master_index (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),    -- Internal System ID (Standard)
  qid TEXT NOT NULL UNIQUE,                       -- The "qidcli" ID (User Facing)
  
  category TEXT NOT NULL,                         -- Idea, File, Video, Event, etc.
  title TEXT NOT NULL,
  description TEXT,
  
  -- Polymorphic Relationship (Can link to Documents, Events, etc.)
  related_id UUID,                                -- ID of the related record
  related_table TEXT,                             -- Table name of the related record
  
  metadata JSONB,                                 -- Flexible JSON storage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT master_index_pkey PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE master_index ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated users
CREATE POLICY "Allow read access for authenticated users" ON master_index
  FOR SELECT TO authenticated USING (true);

-- Allow insert/update access for authenticated users
CREATE POLICY "Allow insert/update access for authenticated users" ON master_index
  FOR ALL TO authenticated USING (true);
