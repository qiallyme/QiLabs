-- ==========================================
-- 🤖 MIGRATION 0006: QIALLY & COMMS
-- AI Conversations, Vector Memory, and Messaging
-- ==========================================

CREATE SCHEMA IF NOT EXISTS qially;

-- 1. SESSIONS / CHANNELS (Containers for messages)
CREATE TABLE IF NOT EXISTS qially.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES qione.tenants(id) ON DELETE CASCADE,
    title TEXT,
    session_type TEXT NOT NULL DEFAULT 'ai_chat' CHECK (session_type IN ('ai_chat', 'direct_message', 'group_channel')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. MESSAGES (Instant Messaging & AI Chat History)
CREATE TABLE IF NOT EXISTS qially.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES qially.sessions(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'assistant', 'system')),
    sender_id UUID REFERENCES qione.users(id) ON DELETE SET NULL, -- Null if AI/System
    content TEXT NOT NULL,
    tokens_consumed INTEGER DEFAULT 0,
    meta JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CONVERSATION EMBEDDINGS (AI Vector Memory)
CREATE TABLE IF NOT EXISTS qially.memory_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES qially.messages(id) ON DELETE CASCADE,
    embedding VECTOR(1536),
    chunk_text TEXT NOT NULL,
    chunk_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_session ON qially.messages(session_id);
CREATE INDEX idx_memory_embeddings ON qially.memory_embeddings USING ivfflat (embedding vector_cosine_ops);