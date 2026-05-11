-- 10. JUNCTION TABLES (Documents <-> Issues/Events)
-- Supports M:N relationships from CSV trackers

CREATE TABLE IF NOT EXISTS document_issues (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  doc_code TEXT NOT NULL REFERENCES documents(doc_code) ON DELETE CASCADE,
  issue_id TEXT NOT NULL REFERENCES issues(issue_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT document_issues_pkey PRIMARY KEY (id),
  CONSTRAINT document_issues_unique UNIQUE (doc_code, issue_id)
);

CREATE TABLE IF NOT EXISTS document_events (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  doc_code TEXT NOT NULL REFERENCES documents(doc_code) ON DELETE CASCADE,
  event_id TEXT NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT document_events_pkey PRIMARY KEY (id),
  CONSTRAINT document_events_unique UNIQUE (doc_code, event_id)
);

-- Enable RLS
ALTER TABLE document_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_events ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow read access for authenticated users" ON document_issues FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert/update access for authenticated users" ON document_issues FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow read access for authenticated users" ON document_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert/update access for authenticated users" ON document_events FOR ALL TO authenticated USING (true);
