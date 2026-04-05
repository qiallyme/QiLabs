-- ==========================================
-- ⚙️ MIGRATION 0003: QISYS (SYSTEM OPS)
-- Jobs, Workers, Logging, and Integrations
-- ==========================================

CREATE SCHEMA IF NOT EXISTS qisys;

-- 1. SYSTEM EVENTS (Logging & Observability)
CREATE TABLE IF NOT EXISTS qisys.system_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES qione.tenants(id) ON DELETE CASCADE, -- Nullable for global system events
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
    message TEXT NOT NULL,
    actor TEXT, -- e.g., 'system', 'ingest_worker', or a user UUID
    meta JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. JOBS & QUEUES (Async Orchestration)
CREATE TABLE IF NOT EXISTS qisys.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES qione.tenants(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL, -- e.g., 'sync_google_drive', 'generate_report'
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'complete', 'failed', 'cancelled')),
    params JSONB NOT NULL DEFAULT '{}'::jsonb,
    result JSONB,
    worker_id TEXT,
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. WORKER STATUS (Health Tracking)
CREATE TABLE IF NOT EXISTS qisys.worker_status (
    worker_id TEXT PRIMARY KEY,
    worker_name TEXT NOT NULL,
    worker_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'busy', 'error', 'offline')),
    last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_job_id UUID REFERENCES qisys.jobs(id) ON DELETE SET NULL,
    meta JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 4. INTEGRATIONS (API Tokens & OAuth)
CREATE TABLE IF NOT EXISTS qisys.integration_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES qione.tenants(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- 'zoho', 'google', 'openai', 'twilio'
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    meta JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, provider)
);

CREATE INDEX idx_system_events_type ON qisys.system_events(event_type);
CREATE INDEX idx_jobs_status ON qisys.jobs(status);