-- SUPABASE MIGRATION V2 (Refined based on Content CSVs)
-- Generated for CASE-FCFCU-2024

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. REFERENCE TABLES
CREATE TABLE IF NOT EXISTS exhibit_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS case_phases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phase_id TEXT NOT NULL UNIQUE, -- e.g., C-01, C-01.A
    phase_name TEXT NOT NULL,
    phase_type TEXT, -- Phase / Sub-Phase
    forum TEXT,
    core_theory TEXT,
    primary_objective TEXT,
    status TEXT,
    packet_output TEXT,
    notes TEXT,
    parent_phase_id UUID REFERENCES case_phases(id), -- For hierarchy (C-01 -> C-01.A)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lanes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lane_id TEXT NOT NULL UNIQUE, -- e.g., L-CRA
    lane_name TEXT NOT NULL,
    phase_id UUID REFERENCES case_phases(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS case_parties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    party_code TEXT UNIQUE, -- ACT-01
    party_name TEXT NOT NULL,
    party_role TEXT, -- Plaintiff, Defendant, etc.
    organization TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CORE MATTERS
CREATE TABLE IF NOT EXISTS violations_or_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_code TEXT UNIQUE, -- V-0001
    issue_title TEXT NOT NULL,
    issue_statement TEXT,
    violation_type TEXT, -- Statutory, Tort, Procedural
    damages_type TEXT,
    description TEXT, -- Notes from CSV
    severity TEXT, -- Low, Medium, High
    strength_1_5 INTEGER CHECK (strength_1_5 BETWEEN 1 AND 5),
    elements_to_prove TEXT,
    phase_id UUID REFERENCES case_phases(id),
    lane_id UUID REFERENCES lanes(id),
    status TEXT DEFAULT 'Open', -- Alleged, Proven, Dismissed
    violation_date DATE,
    resolution_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_and_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doc_code TEXT UNIQUE, -- DC-001 / EV-001
    title TEXT,
    file_name TEXT,
    file_path TEXT, -- Storage_Path
    document_type TEXT, -- Exhibit, Docket, etc.
    document_date DATE, -- Doc_Created
    source_or_custodian TEXT,
    description TEXT, -- Notes
    hash_sha256 TEXT,
    is_exhibit BOOLEAN DEFAULT FALSE,
    is_docket BOOLEAN DEFAULT FALSE,
    exhibit_type_id UUID REFERENCES exhibit_types(id),
    phase_id UUID REFERENCES case_phases(id),
    lane_id UUID REFERENCES lanes(id),
    tags TEXT[],
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS case_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_code TEXT UNIQUE, -- E-001
    event_title TEXT NOT NULL,
    event_type TEXT,
    event_source_confidence TEXT, -- High, Medium, Low
    event_narrative TEXT,
    event_location TEXT,
    event_date_time TIMESTAMP WITH TIME ZONE,
    phase_id UUID REFERENCES case_phases(id), -- Inferred from related items
    lane_id UUID REFERENCES lanes(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS case_filings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filing_code TEXT UNIQUE, -- P-0001
    filing_title TEXT NOT NULL,
    filing_type TEXT, -- Motion, Complaint, Notice
    forum TEXT, -- State Trial Court, Administrative
    date_filed DATE,
    status TEXT DEFAULT 'Draft', -- Open, Filed, Denied
    case_number TEXT,
    regulatory_filing BOOLEAN DEFAULT FALSE,
    court_filing BOOLEAN DEFAULT FALSE,
    event_id UUID REFERENCES case_events(id),
    document_id UUID REFERENCES document_and_evidence(id),
    phase_id UUID REFERENCES case_phases(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. LEGAL CRM & AUTOMATION
CREATE TABLE IF NOT EXISTS letters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    letter_code TEXT UNIQUE, -- L-0001
    letter_title TEXT,
    letter_type TEXT, -- Dispute, Demand, etc.
    direction TEXT CHECK (direction IN ('Inbound', 'Outbound')),
    sender TEXT,
    recipient TEXT,
    method TEXT,
    date_sent DATE,
    proof_of_service TEXT,
    status TEXT DEFAULT 'Draft',
    file_path TEXT,
    phase_id UUID REFERENCES case_phases(id),
    lane_id UUID REFERENCES lanes(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deadlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deadline_code TEXT UNIQUE, -- D-0001
    deadline_title TEXT,
    due_date DATE,
    start_date DATE,
    jurisdiction TEXT,
    clock_type TEXT, -- Hard Statutory, Procedural, etc.
    status TEXT DEFAULT 'Pending',
    consequence TEXT,
    trigger_event_id UUID REFERENCES case_events(id),
    trigger_letter_id UUID REFERENCES letters(id),
    related_filing_id UUID REFERENCES case_filings(id),
    phase_id UUID REFERENCES case_phases(id),
    lane_id UUID REFERENCES lanes(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_code TEXT UNIQUE, -- T-0001
    task_title TEXT NOT NULL,
    task_type TEXT, -- Packet Build, Analysis
    priority TEXT, -- High, Medium, Low
    status TEXT DEFAULT 'Pending',
    owner TEXT,
    due_date DATE,
    output_artifact TEXT,
    produces_letter_id UUID REFERENCES letters(id),
    produces_filing_id UUID REFERENCES case_filings(id),
    serves_deadline_id UUID REFERENCES deadlines(id),
    phase_id UUID REFERENCES case_phases(id),
    lane_id UUID REFERENCES lanes(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. JOIN TABLES (MANY-TO-MANY)
CREATE TABLE IF NOT EXISTS issue_events (
    issue_id UUID REFERENCES violations_or_issues(id) ON DELETE CASCADE,
    event_id UUID REFERENCES case_events(id) ON DELETE CASCADE,
    PRIMARY KEY (issue_id, event_id)
);

CREATE TABLE IF NOT EXISTS issue_documents (
    issue_id UUID REFERENCES violations_or_issues(id) ON DELETE CASCADE,
    document_id UUID REFERENCES document_and_evidence(id) ON DELETE CASCADE,
    PRIMARY KEY (issue_id, document_id)
);

CREATE TABLE IF NOT EXISTS event_documents (
    event_id UUID REFERENCES case_events(id) ON DELETE CASCADE,
    document_id UUID REFERENCES document_and_evidence(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, document_id)
);

-- NEW JOINS from CSV Analysis
CREATE TABLE IF NOT EXISTS event_parties ( -- Actor_Events
    event_id UUID REFERENCES case_events(id) ON DELETE CASCADE,
    party_id UUID REFERENCES case_parties(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, party_id)
);

CREATE TABLE IF NOT EXISTS party_documents ( -- Actor_Docs
    party_id UUID REFERENCES case_parties(id) ON DELETE CASCADE,
    document_id UUID REFERENCES document_and_evidence(id) ON DELETE CASCADE,
    PRIMARY KEY (party_id, document_id)
);

CREATE TABLE IF NOT EXISTS filing_issues ( -- Related_Issues (Filings)
    filing_id UUID REFERENCES case_filings(id) ON DELETE CASCADE,
    issue_id UUID REFERENCES violations_or_issues(id) ON DELETE CASCADE,
    PRIMARY KEY (filing_id, issue_id)
);

CREATE TABLE IF NOT EXISTS task_issues ( -- Related_Issue_ID (Tasks)
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    issue_id UUID REFERENCES violations_or_issues(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, issue_id)
);

CREATE TABLE IF NOT EXISTS letter_issues ( -- Related_Issue_ID (Letters)
    letter_id UUID REFERENCES letters(id) ON DELETE CASCADE,
    issue_id UUID REFERENCES violations_or_issues(id) ON DELETE CASCADE,
    PRIMARY KEY (letter_id, issue_id)
);

-- 5. FUNCTION & TRIGGERS (Optional but recommended)
-- Auto-update updated_at timestamp if added later
