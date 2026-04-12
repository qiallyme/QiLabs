-- DATA MIGRATION PREP: CLEAN SCHEMA RESET
-- WARNING: This will drop these specific tables to ensure the schema matches the import script perfectly.
-- Since you are preparing for a fresh import, this is the safest way to avoid conflicts.

DROP TABLE IF EXISTS document_issues CASCADE;
DROP TABLE IF EXISTS document_events CASCADE;
DROP TABLE IF EXISTS master_index CASCADE;

-- 1. MASTER INDEX (qidcli)
CREATE TABLE master_index (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),    -- Internal System ID (Standard)
  qid TEXT NOT NULL UNIQUE,                       -- The "qidcli" ID (User Facing)
  
  category TEXT NOT NULL,                         -- Idea, File, Video, Event, etc.
  title TEXT NOT NULL,
  description TEXT,
  
  -- Polymorphic Relationship (Can link to Documents, Events, etc.)
  related_id TEXT,                                -- ID of the related record (UUID or User ID)
  related_table TEXT,                             -- Table name of the related record
  
  metadata JSONB,                                 -- Flexible JSON storage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT master_index_pkey PRIMARY KEY (id)
);

-- Enable RLS for master_index
ALTER TABLE master_index ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access for authenticated users" ON master_index
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert/update access for authenticated users" ON master_index
  FOR ALL TO authenticated USING (true);


-- 2. JUNCTION TABLES (Documents <-> Issues/Events)

-- Document <-> Issues
CREATE TABLE document_issues (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  doc_code TEXT NOT NULL, -- Logical ID from Tracker (e.g. D-001)
  issue_id TEXT NOT NULL, -- Logical ID from Tracker (e.g. V-001)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT document_issues_pkey PRIMARY KEY (id),
  CONSTRAINT document_issues_unique UNIQUE (doc_code, issue_id)
);

-- Document <-> Events
CREATE TABLE document_events (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  doc_code TEXT NOT NULL,
  event_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT document_events_pkey PRIMARY KEY (id),
  CONSTRAINT document_events_unique UNIQUE (doc_code, event_id)
);

-- Enable RLS for Junctions
ALTER TABLE document_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access for authenticated users" ON document_issues FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert/update access for authenticated users" ON document_issues FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow read access for authenticated users" ON document_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert/update access for authenticated users" ON document_events FOR ALL TO authenticated USING (true);
