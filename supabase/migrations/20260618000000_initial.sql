-- ============================================================
-- Papillon – initial migration
-- Run this in the Supabase SQL editor or via supabase db push
-- ============================================================

-- ── helpers ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ── tables ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id               SERIAL PRIMARY KEY,
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id               SERIAL PRIMARY KEY,
  handle           TEXT NOT NULL UNIQUE,
  title            TEXT NOT NULL,
  body             TEXT NOT NULL DEFAULT '',
  type             TEXT NOT NULL DEFAULT '',
  category         TEXT NOT NULL DEFAULT '',
  tags             TEXT NOT NULL DEFAULT '',
  images           JSONB NOT NULL DEFAULT '[]',
  status           TEXT NOT NULL DEFAULT 'active',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_variants (
  id                   SERIAL PRIMARY KEY,
  product_id           INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size                 TEXT NOT NULL DEFAULT '',
  color                TEXT,
  price                NUMERIC(10,2) NOT NULL,
  compare_price        NUMERIC(10,2),
  sku                  TEXT NOT NULL DEFAULT '',
  inventory_qty        INTEGER NOT NULL DEFAULT 0,
  inventory_reserved   INTEGER NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_logs (
  id           SERIAL PRIMARY KEY,
  product_id   INTEGER NOT NULL,
  variant_id   INTEGER NOT NULL,
  delta        INTEGER NOT NULL,
  reason       TEXT NOT NULL,
  order_id     INTEGER,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id               SERIAL PRIMARY KEY,
  name             TEXT NOT NULL,
  customer_email   TEXT NOT NULL UNIQUE,
  phone            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id               SERIAL PRIMARY KEY,
  order_number     TEXT NOT NULL UNIQUE,
  customer_id      INTEGER REFERENCES customers(id),
  customer_name    TEXT NOT NULL,
  customer_email   TEXT NOT NULL,
  customer_phone   TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  items            JSONB NOT NULL,
  subtotal         NUMERIC(10,2) NOT NULL,
  shipping         NUMERIC(10,2) NOT NULL DEFAULT 0,
  total            NUMERIC(10,2) NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending',
  payment_status   TEXT NOT NULL DEFAULT 'pending',
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_logs (
  id                        SERIAL PRIMARY KEY,
  order_id                  INTEGER NOT NULL REFERENCES orders(id),
  merchant_transaction_id   TEXT NOT NULL UNIQUE,
  phonepe_transaction_id    TEXT,
  amount                    INTEGER NOT NULL,
  status                    TEXT NOT NULL DEFAULT 'INITIATED',
  provider                  TEXT NOT NULL DEFAULT 'phonepe',
  request_payload           JSONB,
  response_payload          JSONB,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS homepage_settings (
  id                    SERIAL PRIMARY KEY,
  banners               JSONB NOT NULL DEFAULT '[]',
  announcement_text     TEXT NOT NULL DEFAULT 'Free Shipping On Any 2 Purchases!',
  announcement_enabled  BOOLEAN NOT NULL DEFAULT true,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id          SERIAL PRIMARY KEY,
  token       TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL
);

-- ── updated_at triggers ──────────────────────────────────────

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_payment_logs_updated_at
  BEFORE UPDATE ON payment_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_homepage_settings_updated_at
  BEFORE UPDATE ON homepage_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── atomic inventory helpers ─────────────────────────────────

CREATE OR REPLACE FUNCTION reserve_inventory(p_variant_id INTEGER, p_qty INTEGER)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE product_variants
  SET inventory_reserved = inventory_reserved + p_qty
  WHERE id = p_variant_id;
END;
$$;

CREATE OR REPLACE FUNCTION release_reservation(p_variant_id INTEGER, p_qty INTEGER)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE product_variants
  SET inventory_reserved = GREATEST(0, inventory_reserved - p_qty)
  WHERE id = p_variant_id;
END;
$$;

CREATE OR REPLACE FUNCTION deduct_on_sale(p_variant_id INTEGER, p_qty INTEGER)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE product_variants
  SET inventory_reserved = GREATEST(0, inventory_reserved - p_qty),
      inventory_qty      = GREATEST(0, inventory_qty - p_qty)
  WHERE id = p_variant_id;
END;
$$;

-- ── indexes ──────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_products_status       ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_handle       ON products(handle);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status         ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_logs_merchant ON payment_logs(merchant_transaction_id);

-- ── disable RLS (server uses service_role key – RLS not needed) ──

ALTER TABLE categories           DISABLE ROW LEVEL SECURITY;
ALTER TABLE products             DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants     DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs       DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers            DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders               DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs         DISABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_settings    DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions       DISABLE ROW LEVEL SECURITY;
