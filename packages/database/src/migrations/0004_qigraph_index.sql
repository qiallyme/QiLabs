-- ==========================================
-- 🕸️ MIGRATION 0004: QIGRAPH & MASTER INDEX
-- Global QIDs, Nodes, and Graph Edges
-- ==========================================

CREATE SCHEMA IF NOT EXISTS qigraph;

-- 1. MASTER INDEX (The Global General Ledger)
-- Maps a universal QID to a specific table/UUID for universal search and routing.
CREATE TABLE IF NOT EXISTS qigraph.master_index (
    qid TEXT PRIMARY KEY, -- e.g., 'QA3F91C', 'NOTE-9X2P'
    tenant_id UUID NOT NULL REFERENCES qione.tenants(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL, -- 'document', 'note', 'task', 'person'
    object_id UUID NOT NULL, -- The UUID in the actual destination table
    table_reference TEXT NOT NULL, -- e.g., 'qiarchive.archive_files', 'qiknowledge.notes'
    title TEXT NOT NULL,
    route_url TEXT, -- Where to view this in the app UI
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. GRAPH EDGES (Typed Links)
-- Connects any QID to any other QID.
CREATE TABLE IF NOT EXISTS qigraph.edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES qione.tenants(id) ON DELETE CASCADE,
    from_qid TEXT NOT NULL REFERENCES qigraph.master_index(qid) ON DELETE CASCADE,
    to_qid TEXT NOT NULL REFERENCES qigraph.master_index(qid) ON DELETE CASCADE,
    link_type TEXT NOT NULL, -- e.g., 'references', 'blocks', 'owns', 'mentions'
    meta JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (from_qid, to_qid, link_type) -- Prevent duplicate identical edges
);

CREATE INDEX idx_master_index_tenant ON qigraph.master_index(tenant_id);
CREATE INDEX idx_master_index_type ON qigraph.master_index(entity_type);
CREATE INDEX idx_edges_from ON qigraph.edges(from_qid);
CREATE INDEX idx_edges_to ON qigraph.edges(to_qid);