-- ==========================================
-- 🏠 MIGRATION 0008: QIHOME
-- Ledger, Expenses, Settlements, and Chores
-- ==========================================

CREATE SCHEMA IF NOT EXISTS qihome;

-- 1. CATEGORIES
CREATE TABLE IF NOT EXISTS qihome.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES qione.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    UNIQUE (tenant_id, name)
);

-- 2. EXPENSES (The Ledger)
CREATE TABLE IF NOT EXISTS qihome.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES qione.tenants(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    category_id UUID REFERENCES qihome.categories(id) ON DELETE SET NULL,
    paid_by_user_id UUID NOT NULL REFERENCES qione.users(id),
    memo TEXT,
    archive_id TEXT REFERENCES qiarchive.archive_files(archive_id) ON DELETE SET NULL, -- Links receipt PDF
    created_by UUID NOT NULL REFERENCES qione.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. EXPENSE SHARES (Who owes what)
CREATE TABLE IF NOT EXISTS qihome.expense_shares (
    expense_id UUID NOT NULL REFERENCES qihome.expenses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES qione.users(id) ON DELETE CASCADE,
    share_cents INTEGER NOT NULL CHECK (share_cents >= 0),
    PRIMARY KEY (expense_id, user_id)
);

-- 4. SETTLEMENTS (Paying each other back)
CREATE TABLE IF NOT EXISTS qihome.settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES qione.tenants(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    from_user_id UUID NOT NULL REFERENCES qione.users(id),
    to_user_id UUID NOT NULL REFERENCES qione.users(id),
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    memo TEXT,
    created_by UUID NOT NULL REFERENCES qione.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CHORES & ASSIGNMENTS
CREATE TABLE IF NOT EXISTS qihome.chores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES qione.tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    frequency TEXT NOT NULL DEFAULT 'weekly',
    points INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS qihome.chore_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES qione.tenants(id) ON DELETE CASCADE,
    chore_id UUID NOT NULL REFERENCES qihome.chores(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES qione.users(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done', 'skipped')),
    done_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_qihome_expenses_modtime BEFORE UPDATE ON qihome.expenses FOR EACH ROW EXECUTE FUNCTION qione.update_modified_column();