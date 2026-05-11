-- SUPABASE INITIAL MIGRATION (Hardened Legal Schema)
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
    phase_id TEXT NOT NULL UNIQUE, -- e.g., P-01
    phase_name TEXT NOT NULL,
    phase_type TEXT,
    core_theory TEXT,
    primary_objective TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lanes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lane_id TEXT NOT NULL UNIQUE, -- e.g., C-03.C1
    lane_name TEXT NOT NULL,
    phase_id UUID REFERENCES case_phases(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS case_parties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    party_name TEXT NOT NULL,
    party_role TEXT, -- Plaintiff, Defendant, etc.
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CORE MATTERS
CREATE TABLE IF NOT EXISTS violations_or_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_code TEXT UNIQUE, -- V-0001
    issue_title TEXT NOT NULL,
    issue_statement TEXT,
    violation_type TEXT, -- Minor, Major, Critical
    description TEXT,
    severity TEXT, -- Low, Medium, High
    strength_1_5 INTEGER CHECK (strength_1_5 BETWEEN 1 AND 5),
    elements_to_prove TEXT,
    phase_id UUID REFERENCES case_phases(id),
    lane_id UUID REFERENCES lanes(id),
    status TEXT DEFAULT 'Open',
    date_reported DATE,
    resolution_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_and_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doc_code TEXT UNIQUE, -- D-0001
    title TEXT,
    file_name TEXT,
    file_path TEXT, -- URL to storage
    document_type TEXT, -- Exhibit, Docket, etc.
    document_date DATE,
    source_or_custodian TEXT,
    description TEXT,
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
    event_code TEXT UNIQUE, -- E-0001
    event_title TEXT NOT NULL,
    event_type TEXT,
    event_narrative TEXT,
    event_location TEXT,
    event_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    phase_id UUID REFERENCES case_phases(id),
    lane_id UUID REFERENCES lanes(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS case_filings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filing_code TEXT UNIQUE, -- P-0001
    filing_title TEXT NOT NULL,
    filing_status TEXT DEFAULT 'Open',
    case_number TEXT,
    regulatory_filing BOOLEAN DEFAULT FALSE,
    court_filing BOOLEAN DEFAULT FALSE,
    event_id UUID REFERENCES case_events(id),
    document_id UUID REFERENCES document_and_evidence(id),
    phase_id UUID REFERENCES case_phases(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. LEGAL CRM & AUTOMATION
CREATE TABLE IF NOT EXISTS letters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    letter_code TEXT UNIQUE, -- L-0001
    letter_type TEXT, -- Dispute, Demand, etc.
    direction TEXT CHECK (direction IN ('Inbound', 'Outbound')),
    recipient TEXT,
    method TEXT,
    date_sent DATE,
    proof_of_service TEXT,
    status TEXT DEFAULT 'Draft',
    phase_id UUID REFERENCES case_phases(id),
    lane_id UUID REFERENCES lanes(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deadlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deadline_code TEXT UNIQUE, -- DL-0001
    due_date DATE NOT NULL,
    clock_type TEXT, -- Hard Statutory, Procedural, etc.
    status TEXT DEFAULT 'Pending',
    consequence TEXT,
    trigger_event_id UUID REFERENCES case_events(id),
    trigger_letter_id UUID REFERENCES letters(id),
    phase_id UUID REFERENCES case_phases(id),
    lane_id UUID REFERENCES lanes(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_code TEXT UNIQUE, -- T-0001
    task_title TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    produces_letter_id UUID REFERENCES letters(id),
    produces_filing_id UUID REFERENCES case_filings(id),
    serves_deadline_id UUID REFERENCES deadlines(id),
    phase_id UUID REFERENCES case_phases(id),
    lane_id UUID REFERENCES lanes(id),
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

-- Seed Initial Phases (FCRA/Legal standard)
INSERT INTO case_phases (phase_id, phase_name, phase_type) VALUES 
('P-01', 'Record Defects & Jurisdictional Failures', 'Pre-Litigation'),
('P-02', 'Strategic Disputing & Administrative Exhaustion', 'Pre-Litigation'),
('P-03', 'Pleadings & Strategy Development', 'Litigation'),
('P-04', 'Discovery & Evidence Locking', 'Litigation');

-- Seed Initial Lanes (FCRA standard)
INSERT INTO lanes (lane_id, lane_name, phase_id) 
SELECT 'L-CRA', 'CRA (TransUnion, Equifax, Experian)', id FROM case_phases WHERE phase_id = 'P-02'
UNION ALL
SELECT 'L-FURN', 'Furnisher (FCFCU)', id FROM case_phases WHERE phase_id = 'P-02'
UNION ALL
SELECT 'L-COURT', 'Court/Litigation Surface', id FROM case_phases WHERE phase_id = 'P-03';
