-- QiAccess Bookmarks Table
CREATE TABLE IF NOT EXISTS bookmarks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    category TEXT,
    tags TEXT, -- JSON string
    scope TEXT NOT NULL DEFAULT 'cloud',
    pinned INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_scope ON bookmarks(scope);
CREATE INDEX IF NOT EXISTS idx_bookmarks_pinned ON bookmarks(pinned);
