-- ============================================================
-- Papillon – Add missing columns to pre-existing tables
-- + create remaining indexes + apply grants
-- Safe to run multiple times (all statements are idempotent)
-- ============================================================

-- ── Add missing columns to products ──────────────────────────

ALTER TABLE products ADD COLUMN IF NOT EXISTS handle       TEXT NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS title        TEXT NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS body         TEXT NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS type         TEXT NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS category     TEXT NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags         TEXT NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS images       JSONB NOT NULL DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS status       TEXT NOT NULL DEFAULT 'active';
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ── Add missing columns to product_variants ──────────────────

ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS product_id          INTEGER;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS size                 TEXT NOT NULL DEFAULT '';
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS color                TEXT;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS price                NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS compare_price        NUMERIC(10,2);
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS sku                  TEXT NOT NULL DEFAULT '';
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS inventory_qty        INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS inventory_reserved   INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ── Add missing columns to orders ────────────────────────────

ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number     TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id      INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name    TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email   TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone   TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB NOT NULL DEFAULT '{}';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items            JSONB NOT NULL DEFAULT '[]';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal         NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping         NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total            NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status           TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status   TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes            TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ── Add missing columns to customers ─────────────────────────

ALTER TABLE customers ADD COLUMN IF NOT EXISTS name             TEXT NOT NULL DEFAULT '';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_email   TEXT NOT NULL DEFAULT '';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone            TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ── Add missing columns to categories ────────────────────────

ALTER TABLE categories ADD COLUMN IF NOT EXISTS name       TEXT NOT NULL DEFAULT '';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug       TEXT NOT NULL DEFAULT '';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ── indexes (safe – columns now guaranteed to exist) ─────────

CREATE INDEX IF NOT EXISTS idx_products_handle        ON products(handle);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email  ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status          ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status  ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_logs_merchant  ON payment_logs(merchant_transaction_id);

-- ── disable RLS on ALL tables ─────────────────────────────────

ALTER TABLE categories           DISABLE ROW LEVEL SECURITY;
ALTER TABLE products             DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants     DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs       DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers            DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders               DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs         DISABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_settings    DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions       DISABLE ROW LEVEL SECURITY;

-- ── grant privileges to PostgREST roles ──────────────────────

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON ALL TABLES    IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES  IN SCHEMA public TO anon, authenticated, service_role;
