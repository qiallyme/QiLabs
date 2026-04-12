-- Migration V3: External Resources & Legal Library

-- 1. QUICK LINKS TABLE
CREATE TABLE IF NOT EXISTS quick_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    icon TEXT,
    description TEXT,
    "order" INTEGER DEFAULT 0
);

-- 2. LIBRARY DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS library_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    source TEXT,
    document_type TEXT DEFAULT 'PDF',
    content TEXT,
    file_path TEXT,
    url TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS POLICIES (Public Read/Write for now, same as other tables)
ALTER TABLE quick_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read" ON quick_links;
DROP POLICY IF EXISTS "Public Write" ON quick_links;
CREATE POLICY "Public Read" ON quick_links FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Write" ON quick_links FOR ALL TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public Read" ON library_documents;
DROP POLICY IF EXISTS "Public Write" ON library_documents;
CREATE POLICY "Public Read" ON library_documents FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Write" ON library_documents FOR ALL TO anon, authenticated USING (true);

-- 4. SEED DATA (Optional, default common links)
INSERT INTO quick_links (title, url, category, description, "order")
VALUES 
('Indiana MyCase', 'https://public.courts.in.gov/mycase', 'Court', 'Search court records and case information.', 1),
('E-File Indiana', 'https://www.efile.com', 'E-File', 'Submit court filings electronically.', 2),
('Appellate Court', 'https://www.in.gov/courts/appellate/', 'Appellate', 'Indiana Court of Appeals and Supreme Court resources.', 3)
ON CONFLICT DO NOTHING;
