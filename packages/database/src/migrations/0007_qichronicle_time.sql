-- ==========================================
-- 📅 MIGRATION 0007: QICHRONICLE
-- Events, Timelines, and Schedules
-- ==========================================

CREATE SCHEMA IF NOT EXISTS qichronicle;

-- 1. EVENTS (The Timeline)
CREATE TABLE IF NOT EXISTS qichronicle.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES qione.tenants(id) ON DELETE CASCADE,
    qid TEXT UNIQUE REFERENCES qigraph.master_index(qid) ON DELETE SET NULL, -- Optional mapping to Master Index
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL DEFAULT 'event' CHECK (event_type IN ('event', 'meeting', 'milestone', 'deadline', 'task_due')),
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ,
    is_all_day BOOLEAN NOT NULL DEFAULT false,
    location TEXT,
    owner_id UUID REFERENCES qione.users(id) ON DELETE SET NULL,
    meta JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CALENDAR FEEDS / SCHEDULES
CREATE TABLE IF NOT EXISTS qichronicle.calendar_feeds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES qione.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    secret_key UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    filters JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_start ON qichronicle.events(start_at);
CREATE INDEX idx_events_tenant ON qichronicle.events(tenant_id);