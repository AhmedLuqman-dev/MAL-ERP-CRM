/*
# Create Initial ERP/CRM Schema
*/
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================
-- USERS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'sales', 'warehouse', 'accounts')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_authenticated" ON users;
CREATE POLICY "users_select_authenticated" ON users
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_authenticated" ON users;
CREATE POLICY "users_update_authenticated" ON users
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- =====================
-- CUSTOMERS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mobile text NOT NULL,
  email text,
  business_name text,
  gst_number text,
  customer_type text NOT NULL CHECK (customer_type IN ('retail', 'wholesale', 'distributor')),
  address text,
  status text NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'active', 'inactive')),
  follow_up_date date,
  notes text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customers_select_authenticated" ON customers;
CREATE POLICY "customers_select_authenticated" ON customers
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "customers_insert_authenticated" ON customers;
CREATE POLICY "customers_insert_authenticated" ON customers
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "customers_update_authenticated" ON customers;
CREATE POLICY "customers_update_authenticated" ON customers
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "customers_delete_authenticated" ON customers;
CREATE POLICY "customers_delete_authenticated" ON customers
  FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_customers_created_by ON customers(created_by);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(customer_type);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

-- =====================
-- FOLLOW UP NOTES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS follow_up_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  note text NOT NULL,
  follow_up_date date NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE follow_up_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "follow_up_notes_select_authenticated" ON follow_up_notes;
CREATE POLICY "follow_up_notes_select_authenticated" ON follow_up_notes
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "follow_up_notes_insert_authenticated" ON follow_up_notes;
CREATE POLICY "follow_up_notes_insert_authenticated" ON follow_up_notes
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "follow_up_notes_update_authenticated" ON follow_up_notes;
CREATE POLICY "follow_up_notes_update_authenticated" ON follow_up_notes
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "follow_up_notes_delete_authenticated" ON follow_up_notes;
CREATE POLICY "follow_up_notes_delete_authenticated" ON follow_up_notes
  FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_follow_up_notes_customer ON follow_up_notes(customer_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_notes_created ON follow_up_notes(created_at);

-- =====================
-- PRODUCTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sku text UNIQUE NOT NULL,
  category text,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  current_stock integer NOT NULL DEFAULT 0,
  minimum_stock integer NOT NULL DEFAULT 0,
  warehouse_location text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select_authenticated" ON products;
CREATE POLICY "products_select_authenticated" ON products
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "products_insert_authenticated" ON products;
CREATE POLICY "products_insert_authenticated" ON products
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "products_update_authenticated" ON products;
CREATE POLICY "products_update_authenticated" ON products
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "products_delete_authenticated" ON products;
CREATE POLICY "products_delete_authenticated" ON products
  FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- =====================
-- STOCK MOVEMENTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity_changed integer NOT NULL,
  movement_type text NOT NULL CHECK (movement_type IN ('IN', 'OUT')),
  reason text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stock_movements_select_authenticated" ON stock_movements;
CREATE POLICY "stock_movements_select_authenticated" ON stock_movements
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "stock_movements_insert_authenticated" ON stock_movements;
CREATE POLICY "stock_movements_insert_authenticated" ON stock_movements
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "stock_movements_update_authenticated" ON stock_movements;
CREATE POLICY "stock_movements_update_authenticated" ON stock_movements
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "stock_movements_delete_authenticated" ON stock_movements;
CREATE POLICY "stock_movements_delete_authenticated" ON stock_movements
  FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON stock_movements(created_at);

-- =====================
-- SALES CHALLANS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS sales_challans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challan_number text UNIQUE NOT NULL,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'cancelled')),
  total_quantity integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sales_challans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sales_challans_select_authenticated" ON sales_challans;
CREATE POLICY "sales_challans_select_authenticated" ON sales_challans
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "sales_challans_insert_authenticated" ON sales_challans;
CREATE POLICY "sales_challans_insert_authenticated" ON sales_challans
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "sales_challans_update_authenticated" ON sales_challans;
CREATE POLICY "sales_challans_update_authenticated" ON sales_challans
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "sales_challans_delete_authenticated" ON sales_challans;
CREATE POLICY "sales_challans_delete_authenticated" ON sales_challans
  FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_sales_challans_customer ON sales_challans(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_challans_status ON sales_challans(status);
CREATE INDEX IF NOT EXISTS idx_sales_challans_created ON sales_challans(created_at);

-- =====================
-- SALES CHALLAN ITEMS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS sales_challan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challan_id uuid NOT NULL REFERENCES sales_challans(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_snapshot jsonb NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric(12,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sales_challan_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sales_challan_items_select_authenticated" ON sales_challan_items;
CREATE POLICY "sales_challan_items_select_authenticated" ON sales_challan_items
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "sales_challan_items_insert_authenticated" ON sales_challan_items;
CREATE POLICY "sales_challan_items_insert_authenticated" ON sales_challan_items
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "sales_challan_items_update_authenticated" ON sales_challan_items;
CREATE POLICY "sales_challan_items_update_authenticated" ON sales_challan_items
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "sales_challan_items_delete_authenticated" ON sales_challan_items;
CREATE POLICY "sales_challan_items_delete_authenticated" ON sales_challan_items
  FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_challan_items_challan ON sales_challan_items(challan_id);
CREATE INDEX IF NOT EXISTS idx_challan_items_product ON sales_challan_items(product_id);

-- =====================
-- UPDATED_AT TRIGGER
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_customers_updated_at ON customers;
CREATE TRIGGER trigger_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_products_updated_at ON products;
CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
