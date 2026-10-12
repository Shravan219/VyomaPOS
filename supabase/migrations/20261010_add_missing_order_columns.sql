-- ====================================================================
-- MIGRATION: missing columns on public.orders (captain + aggregator writes)
-- Run in Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run
-- Idempotent: safe to re-run
--
-- Why: the app inserts order_type, aggregator_platform, notes,
-- custom_instructions and placed_at_ist (see OrderBuilderSheet and the
-- server webhook intake), but projects created from the original
-- supabase_schema.sql only have the base columns. PostgREST rejects the
-- whole INSERT when any column is unknown, so orders never reach the DB.
-- These columns are load-bearing: getOrderPlatform() reads
-- aggregator_platform / order_type / notes / custom_instructions to route
-- Online tab filtering, so they must exist rather than be stripped client-side.
-- ====================================================================

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'dine_in';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS aggregator_platform TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS custom_instructions TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS placed_at_ist TEXT;

-- Helpful index for the Online tab's platform filtering
CREATE INDEX IF NOT EXISTS idx_orders_aggregator_platform
  ON public.orders (aggregator_platform)
  WHERE aggregator_platform IS NOT NULL;
