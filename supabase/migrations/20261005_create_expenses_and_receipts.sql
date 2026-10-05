-- ====================================================================
-- MIGRATION: public.expenses table & receipts storage bucket
-- Run in Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run
-- Idempotent: safe to re-run
-- ====================================================================

-- 1. Extensions (pgcrypto provides gen_random_uuid(); uuid-ossp kept for compat)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create public.expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    category TEXT NOT NULL,
    notes TEXT,
    receipt_url TEXT NOT NULL DEFAULT ''
);

-- 3. Helpful indexes (date sorting + category breakdowns for Sheets/POS reports)
CREATE INDEX IF NOT EXISTS idx_expenses_created_at_desc ON public.expenses (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses (category);

-- 4. Enable Row Level Security
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies (DROP IF EXISTS makes re-runs safe)
DROP POLICY IF EXISTS "Allow public read access to expenses" ON public.expenses;
CREATE POLICY "Allow public read access to expenses"
ON public.expenses FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow public insert to expenses" ON public.expenses;
CREATE POLICY "Allow public insert to expenses"
ON public.expenses FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access to expenses" ON public.expenses;
CREATE POLICY "Allow public update access to expenses"
ON public.expenses FOR UPDATE
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete access to expenses" ON public.expenses;
CREATE POLICY "Allow public delete access to expenses"
ON public.expenses FOR DELETE
USING (true);

-- 6. Create public 'receipts' storage bucket (so <img src> / =IMAGE() links load without auth)
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 7. Storage RLS policies for the receipts bucket
DROP POLICY IF EXISTS "Allow public read access to receipts objects" ON storage.objects;
CREATE POLICY "Allow public read access to receipts objects"
ON storage.objects FOR SELECT
USING (bucket_id = 'receipts');

DROP POLICY IF EXISTS "Allow public insert to receipts bucket" ON storage.objects;
CREATE POLICY "Allow public insert to receipts bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'receipts');

DROP POLICY IF EXISTS "Allow public update access to receipts bucket" ON storage.objects;
CREATE POLICY "Allow public update access to receipts bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'receipts')
WITH CHECK (bucket_id = 'receipts');

DROP POLICY IF EXISTS "Allow public delete access to receipts bucket" ON storage.objects;
CREATE POLICY "Allow public delete access to receipts bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'receipts');
