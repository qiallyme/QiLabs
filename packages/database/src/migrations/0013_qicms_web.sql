-- ==========================================
-- 🌐 MIGRATION 0013: QICMS
-- Blogs, Articles, and Public Web Content
-- ==========================================

CREATE SCHEMA IF NOT EXISTS qicms;

CREATE TABLE IF NOT EXISTS qicms.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES qione.tenants(id) ON DELETE CASCADE,
    qid TEXT UNIQUE REFERENCES qigraph.master_index(qid) ON DELETE SET NULL,

    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),

    content_md TEXT NOT NULL,
    excerpt TEXT,
    featured_image_archive_id TEXT REFERENCES qiarchive.archive_files(archive_id) ON DELETE SET NULL,

    author_id UUID REFERENCES qione.users(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(tenant_id, slug)
);