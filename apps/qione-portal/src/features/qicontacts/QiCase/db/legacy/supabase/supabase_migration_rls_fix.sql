-- RLS FIX: Allow Public (Anon) Access
-- This is necessary if your application is fetching data without an authenticated user session (e.g. public dashboard).

-- 1. Drop existing 'authenticated' policies to avoid conflicts or confusion (optional, but cleaner)
-- Or just add 'anon' policies. I will drop and recreate as 'public' for simplicity.

-- USERS
DROP POLICY IF EXISTS "Public Read" ON users;
DROP POLICY IF EXISTS "Public Write" ON users;
CREATE POLICY "Public Read" ON users FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Write" ON users FOR ALL TO anon, authenticated USING (true);

-- CASES
DROP POLICY IF EXISTS "Public Read" ON cases;
DROP POLICY IF EXISTS "Public Write" ON cases;
CREATE POLICY "Public Read" ON cases FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Write" ON cases FOR ALL TO anon, authenticated USING (true);

-- PHASES
DROP POLICY IF EXISTS "Public Read" ON case_phases;
DROP POLICY IF EXISTS "Public Write" ON case_phases;
CREATE POLICY "Public Read" ON case_phases FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Write" ON case_phases FOR ALL TO anon, authenticated USING (true);

-- ISSUES
DROP POLICY IF EXISTS "Public Read" ON issues;
DROP POLICY IF EXISTS "Public Write" ON issues;
CREATE POLICY "Public Read" ON issues FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Write" ON issues FOR ALL TO anon, authenticated USING (true);

-- EVENTS
DROP POLICY IF EXISTS "Public Read" ON events;
DROP POLICY IF EXISTS "Public Write" ON events;
CREATE POLICY "Public Read" ON events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Write" ON events FOR ALL TO anon, authenticated USING (true);

-- DOCUMENTS
DROP POLICY IF EXISTS "Public Read" ON documents;
DROP POLICY IF EXISTS "Public Write" ON documents;
CREATE POLICY "Public Read" ON documents FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Write" ON documents FOR ALL TO anon, authenticated USING (true);

-- LETTERS
DROP POLICY IF EXISTS "Public Read" ON letters;
DROP POLICY IF EXISTS "Public Write" ON letters;
CREATE POLICY "Public Read" ON letters FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Write" ON letters FOR ALL TO anon, authenticated USING (true);

-- DEADLINES
DROP POLICY IF EXISTS "Public Read" ON deadlines;
DROP POLICY IF EXISTS "Public Write" ON deadlines;
CREATE POLICY "Public Read" ON deadlines FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Write" ON deadlines FOR ALL TO anon, authenticated USING (true);

-- FILINGS
DROP POLICY IF EXISTS "Public Read" ON filings;
DROP POLICY IF EXISTS "Public Write" ON filings;
CREATE POLICY "Public Read" ON filings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Write" ON filings FOR ALL TO anon, authenticated USING (true);

-- TASKS
DROP POLICY IF EXISTS "Public Read" ON tasks;
DROP POLICY IF EXISTS "Public Write" ON tasks;
CREATE POLICY "Public Read" ON tasks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Write" ON tasks FOR ALL TO anon, authenticated USING (true);

-- MASTER INDEX
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON master_index;
DROP POLICY IF EXISTS "Allow insert/update access for authenticated users" ON master_index;
-- Check previous naming. My consolidated script used "Allow read..." and "Public Read" in full init.
-- I'll drop both potential names just in case.
DROP POLICY IF EXISTS "Public Read" ON master_index;
DROP POLICY IF EXISTS "Public Write" ON master_index;
CREATE POLICY "Public Read" ON master_index FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Write" ON master_index FOR ALL TO anon, authenticated USING (true);

-- DOCUMENT ISSUES
DROP POLICY IF EXISTS "Public Read" ON document_issues;
DROP POLICY IF EXISTS "Public Write" ON document_issues;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON document_issues;
CREATE POLICY "Public Read" ON document_issues FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Write" ON document_issues FOR ALL TO anon, authenticated USING (true);

-- DOCUMENT EVENTS
DROP POLICY IF EXISTS "Public Read" ON document_events;
DROP POLICY IF EXISTS "Public Write" ON document_events;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON document_events;
CREATE POLICY "Public Read" ON document_events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Write" ON document_events FOR ALL TO anon, authenticated USING (true);
