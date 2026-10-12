-- ====================================================================
-- MASTER RLS SCRIPT: one-shot Row Level Security for every VyomaPOS table
-- Run in Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run
-- Idempotent: safe to re-run as many times as needed
--
-- Why this exists: with RLS ENABLED but no (or contradictory) policies,
-- every anon-key request is denied and the app silently fails — orders,
-- tables, menu, customers, expenses and receipt uploads all stop working.
-- This script wipes the slate clean and installs exactly one clear policy
-- set for the POS terminal model: the anon key used by Captain / KDS /
-- Counter tablets gets full operational access; the service_role key
-- bypasses RLS entirely (e.g. server routes, password checks).
--
-- NOTE on app_passwords: staff terminals verify passcodes with the anon
-- key, so anon SELECT must stay open (any deny-policy here breaks login).
-- Compensate by using long, unique staff/admin passcodes and rotating them.
-- ====================================================================

-- --------------------------------------------------------------------
-- 0. Make sure every table exists (no-op if it already does)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    items JSONB DEFAULT '[]'::jsonb NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    table_id TEXT,
    gstin TEXT DEFAULT NULL,
    order_type TEXT DEFAULT 'dine_in',
    aggregator_platform TEXT,
    notes TEXT,
    custom_instructions TEXT,
    placed_at_ist TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.tables (
    id TEXT PRIMARY KEY,
    table_number TEXT NOT NULL,
    capacity INTEGER DEFAULT 4 NOT NULL,
    status TEXT DEFAULT 'available' NOT NULL,
    section TEXT DEFAULT 'Main Hall',
    customer_name TEXT,
    active_order_id TEXT,
    total_amount NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    category TEXT NOT NULL,
    image TEXT,
    is_sold_out BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    discount_price NUMERIC
);

CREATE TABLE IF NOT EXISTS public.customers (
    phone TEXT PRIMARY KEY,
    name TEXT,
    order_count INTEGER DEFAULT 0,
    loyal_vip BOOLEAN DEFAULT false,
    discount NUMERIC,
    gstin TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    category TEXT NOT NULL,
    notes TEXT,
    receipt_url TEXT DEFAULT '' NOT NULL
);

CREATE TABLE IF NOT EXISTS public.app_passwords (
    key TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Receipt photo bucket (receipt uploads from the Expenses tab)
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------------------
-- 1. Enable RLS everywhere
-- --------------------------------------------------------------------
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_passwords ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- 2. Drop every legacy / contradictory policy so exactly one set remains
--    (includes the "Deny public access on app_passwords" policy shipped
--    in some schema mirrors, which breaks staff-terminal login)
-- --------------------------------------------------------------------
DO $$
DECLARE
  t TEXT;
  p RECORD;
BEGIN
  FOREACH t IN ARRAY ARRAY['orders', 'tables', 'menu_items', 'customers', 'expenses', 'app_passwords']
  LOOP
    FOR p IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = t
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, t);
    END LOOP;
  END LOOP;
END
$$;

-- Storage policies for the receipts bucket
DROP POLICY IF EXISTS "Allow public read access to receipts objects" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert to receipts bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update access to receipts bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete access to receipts bucket" ON storage.objects;

-- --------------------------------------------------------------------
-- 3. One clear policy set (anon + authenticated terminals)
-- --------------------------------------------------------------------

-- ORDERS: full terminal access (create, read, update, settle)
CREATE POLICY "Terminal full access to orders"
ON public.orders FOR ALL
USING (true)
WITH CHECK (true);

-- TABLES: full terminal access (floor status flips on every order)
CREATE POLICY "Terminal full access to tables"
ON public.tables FOR ALL
USING (true)
WITH CHECK (true);

-- MENU ITEMS: full terminal access (catalog reads, importer inserts, 86 toggles)
CREATE POLICY "Terminal full access to menu items"
ON public.menu_items FOR ALL
USING (true)
WITH CHECK (true);

-- CUSTOMERS: full terminal access (CRM upserts, VIP flags, GSTIN)
CREATE POLICY "Terminal full access to customers"
ON public.customers FOR ALL
USING (true)
WITH CHECK (true);

-- EXPENSES: full terminal access (log, edit, delete ledger rows)
CREATE POLICY "Terminal full access to expenses"
ON public.expenses FOR ALL
USING (true)
WITH CHECK (true);

-- APP PASSWORDS: terminals must READ passcodes to verify staff/admin login.
-- Writes stay possible for rotation flows; prefer rotating via SQL.
CREATE POLICY "Terminal read access to app_passwords"
ON public.app_passwords FOR SELECT
USING (true);

CREATE POLICY "Terminal write access to app_passwords"
ON public.app_passwords FOR INSERT
WITH CHECK (true);

CREATE POLICY "Terminal update access to app_passwords"
ON public.app_passwords FOR UPDATE
USING (true)
WITH CHECK (true);

-- RECEIPTS BUCKET: terminals upload / view / replace / remove receipt photos
CREATE POLICY "Terminal read access to receipts objects"
ON storage.objects FOR SELECT
USING (bucket_id = 'receipts');

CREATE POLICY "Terminal insert to receipts bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Terminal update access to receipts bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'receipts')
WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Terminal delete access to receipts bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'receipts');

-- --------------------------------------------------------------------
-- 4. Seed default passcodes if the table is empty (rotate after login!)
-- --------------------------------------------------------------------
INSERT INTO public.app_passwords (key, password)
VALUES
    ('staff_password', '1234'),
    ('admin_password', 'admin123')
ON CONFLICT (key) DO NOTHING;
