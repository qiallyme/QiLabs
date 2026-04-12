-- FULL SCHEMA INITIALIZATION (HARD RESET)
-- Run this in Supabase SQL Editor to create all necessary tables.
-- WARNING: This will DELETE existing data in these tables.

-- Drop existing tables to ensure schema match
DROP TABLE IF EXISTS document_events CASCADE;
DROP TABLE IF EXISTS document_issues CASCADE;
DROP TABLE IF EXISTS master_index CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS filings CASCADE;
DROP TABLE IF EXISTS deadlines CASCADE;
DROP TABLE IF EXISTS letters CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS issues CASCADE;
DROP TABLE IF EXISTS case_phases CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
-- DROP TABLE IF EXISTS users CASCADE; -- Optional: Keep users if auth is set up separately

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS (If not using Supabase Auth, or for custom profile data)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'attorney'
);

-- 2. CASES
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  court_case_number TEXT NOT NULL, -- e.g. 49D03-2501-MF-002559
  title TEXT NOT NULL,
  status TEXT DEFAULT 'Open',
  opposing_counsel TEXT,
  judge TEXT,
  court TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PHASES (Required for Issues/Events/Docs)
CREATE TABLE IF NOT EXISTS case_phases (
  phase_id TEXT PRIMARY KEY, -- C-01, C-02
  phase_name TEXT NOT NULL,
  status TEXT NOT NULL,
  purpose TEXT,
  notes TEXT,
  "order" INTEGER NOT NULL
);

-- 4. ISSUES
CREATE TABLE IF NOT EXISTS issues (
  issue_id TEXT PRIMARY KEY, -- V-FCFCU-YYYY-XXXX
  phase_id TEXT NOT NULL REFERENCES case_phases(phase_id),
  lane TEXT,
  issue_title TEXT NOT NULL,
  issue_statement TEXT,
  elements_to_prove TEXT[], -- Array of strings
  strength INTEGER DEFAULT 1,
  status TEXT DEFAULT 'Open'
);

-- 5. EVENTS
CREATE TABLE IF NOT EXISTS events (
  event_id TEXT PRIMARY KEY, -- E-XXXX
  phase_id TEXT REFERENCES case_phases(phase_id),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL
);

-- 6. DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
  doc_code TEXT PRIMARY KEY, -- D-XXXX
  phase_id TEXT NOT NULL REFERENCES case_phases(phase_id),
  lane TEXT,
  doc_id TEXT UNIQUE,
  doc_type TEXT NOT NULL,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  authored_at TIMESTAMP WITH TIME ZONE,
  original_filename TEXT NOT NULL,
  drive_path TEXT NOT NULL,
  ocr_text_path TEXT,
  proof_type TEXT DEFAULT 'Direct'
);

-- 7. LETTERS
CREATE TABLE IF NOT EXISTS letters (
  letter_code TEXT PRIMARY KEY, -- L-XXXX
  phase_id TEXT REFERENCES case_phases(phase_id),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  recipient TEXT NOT NULL,
  sender TEXT NOT NULL,
  subject TEXT NOT NULL,
  pdf_path TEXT,
  tracking_number TEXT
);

-- 8. DEADLINES
CREATE TABLE IF NOT EXISTS deadlines (
  deadline_id TEXT PRIMARY KEY,
  related_event_id TEXT REFERENCES events(event_id),
  title TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'Pending'
);

-- 9. FILINGS
CREATE TABLE IF NOT EXISTS filings (
  filing_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  filing_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'Pending',
  file_path TEXT
);

-- 10. TASKS
CREATE TABLE IF NOT EXISTS tasks (
  task_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'To Do',
  priority TEXT DEFAULT 'Medium',
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to TEXT
);

-- 11. MASTER INDEX
CREATE TABLE IF NOT EXISTS master_index (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qid TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  related_id TEXT,
  related_table TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. JUNCTION TABLES (Documents <-> Issues/Events)
CREATE TABLE IF NOT EXISTS document_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doc_code TEXT NOT NULL REFERENCES documents(doc_code) ON DELETE CASCADE,
  issue_id TEXT NOT NULL REFERENCES issues(issue_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT document_issues_unique UNIQUE (doc_code, issue_id)
);

CREATE TABLE IF NOT EXISTS document_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doc_code TEXT NOT NULL REFERENCES documents(doc_code) ON DELETE CASCADE,
  event_id TEXT NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT document_events_unique UNIQUE (doc_code, event_id)
);

-- POLICIES (Simple Defaults)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_events ENABLE ROW LEVEL SECURITY;

-- Allow authenticated access for now (Development Mode)
DROP POLICY IF EXISTS "Public Read" ON users;
DROP POLICY IF EXISTS "Public Write" ON users;
CREATE POLICY "Public Read" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public Write" ON users FOR ALL TO authenticated USING (true);

CREATE POLICY "Public Read" ON cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public Write" ON cases FOR ALL TO authenticated USING (true);

CREATE POLICY "Public Read" ON case_phases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public Write" ON case_phases FOR ALL TO authenticated USING (true);

CREATE POLICY "Public Read" ON issues FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public Write" ON issues FOR ALL TO authenticated USING (true);

CREATE POLICY "Public Read" ON events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public Write" ON events FOR ALL TO authenticated USING (true);

CREATE POLICY "Public Read" ON documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public Write" ON documents FOR ALL TO authenticated USING (true);

CREATE POLICY "Public Read" ON letters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public Write" ON letters FOR ALL TO authenticated USING (true);

CREATE POLICY "Public Read" ON deadlines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public Write" ON deadlines FOR ALL TO authenticated USING (true);

CREATE POLICY "Public Read" ON filings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public Write" ON filings FOR ALL TO authenticated USING (true);

CREATE POLICY "Public Read" ON tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public Write" ON tasks FOR ALL TO authenticated USING (true);

CREATE POLICY "Public Read" ON master_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public Write" ON master_index FOR ALL TO authenticated USING (true);

CREATE POLICY "Public Read" ON document_issues FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public Write" ON document_issues FOR ALL TO authenticated USING (true);

CREATE POLICY "Public Read" ON document_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public Write" ON document_events FOR ALL TO authenticated USING (true);
