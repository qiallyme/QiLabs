-- ==========================================
-- ⚖️ MIGRATION 0010: QICASE
-- Legal Matters, Issues, and Court Deadlines
-- ==========================================

CREATE SCHEMA IF NOT EXISTS qicase;

-- 1. CASES (The Matter)
CREATE TABLE IF NOT EXISTS qicase.cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES qione.tenants(id) ON DELETE CASCADE,
    qid TEXT UNIQUE REFERENCES qigraph.master_index(qid) ON DELETE CASCADE,
    case_name TEXT NOT NULL,
    case_number TEXT,
    court TEXT,
    judge TEXT,
    opposing_counsel TEXT,
    status TEXT DEFAULT 'Active',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CASE PHASES (Discovery, Trial, etc.)
CREATE TABLE IF NOT EXISTS qicase.phases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES qicase.cases(id) ON DELETE CASCADE,
    phase_name TEXT NOT NULL,
    status TEXT NOT NULL,
    purpose TEXT NOT NULL,
    phase_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ISSUES (Elements to prove)
CREATE TABLE IF NOT EXISTS qicase.issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phase_id UUID NOT NULL REFERENCES qicase.phases(id) ON DELETE CASCADE,
    issue_title TEXT NOT NULL,
    issue_statement TEXT NOT NULL,
    elements_to_prove TEXT[],
    strength INTEGER,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CASE DOCUMENTS (Links evidence to the Archive)
CREATE TABLE IF NOT EXISTS qicase.case_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phase_id UUID NOT NULL REFERENCES qicase.phases(id) ON DELETE CASCADE,
    archive_id TEXT NOT NULL REFERENCES qiarchive.archive_files(archive_id) ON DELETE CASCADE,
    doc_type TEXT NOT NULL,
    proof_type TEXT NOT NULL,
    lane TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(phase_id, archive_id)
);

-- 5. DOCUMENT TO ISSUE MAPPING (Proving the case)
CREATE TABLE IF NOT EXISTS qicase.document_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_document_id UUID NOT NULL REFERENCES qicase.case_documents(id) ON DELETE CASCADE,
    issue_id UUID NOT NULL REFERENCES qicase.issues(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(case_document_id, issue_id)
);

-- 6. FILINGS & DEADLINES
CREATE TABLE IF NOT EXISTS qicase.deadlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phase_id UUID NOT NULL REFERENCES qicase.phases(id) ON DELETE CASCADE,
    chronicle_event_id UUID REFERENCES qichronicle.events(id) ON DELETE CASCADE, -- Links to global timeline
    trigger TEXT NOT NULL,
    clock_type TEXT NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    consequence TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_qicase_cases_modtime BEFORE UPDATE ON qicase.cases FOR EACH ROW EXECUTE FUNCTION qione.update_modified_column();