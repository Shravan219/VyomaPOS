-- ====================================================================
-- Vyoma POS — Table Reservation Manager (Supabase / PostgreSQL)
-- Run in Supabase SQL Editor (handles PL/pgSQL blocks natively).
-- Creates: public.reservations + indexes + RLS + realtime-ready policies.
-- ====================================================================

-- 1. RESERVATIONS TABLE
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    guest_name TEXT NOT NULL CHECK (char_length(trim(guest_name)) >= 2),
    phone TEXT NOT NULL CHECK (char_length(regexp_replace(phone, '\D', '', 'g')) >= 10),
    party_size INTEGER NOT NULL CHECK (party_size >= 1 AND party_size <= 40),
    reservation_time TIMESTAMPTZ NOT NULL,
    table_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'booked'
        CHECK (status IN ('booked', 'seated', 'cancelled', 'completed')),
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. INDEXES (conflict lookup + daily timeline + realtime ordering)
CREATE INDEX IF NOT EXISTS idx_reservations_table_time
    ON public.reservations (table_number, reservation_time);
CREATE INDEX IF NOT EXISTS idx_reservations_status
    ON public.reservations (status);
CREATE INDEX IF NOT EXISTS idx_reservations_time_desc
    ON public.reservations (reservation_time DESC);
CREATE INDEX IF NOT EXISTS idx_reservations_phone
    ON public.reservations (phone);

-- 3. DOUBLE-BOOKING GUARD (2-hour turn time, configurable)
-- Prevents overlapping active bookings on the same table within the buffer.
CREATE OR REPLACE FUNCTION public.prevent_reservation_overlap()
RETURNS TRIGGER AS $$
DECLARE
    turn_minutes INTEGER := 120;
    clash_count INTEGER;
BEGIN
    IF NEW.status IN ('cancelled', 'completed') THEN
        RETURN NEW;
    END IF;

    SELECT COUNT(*)::INTEGER INTO clash_count
    FROM public.reservations r
    WHERE r.id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND upper(trim(r.table_number)) = upper(trim(NEW.table_number))
      AND r.status NOT IN ('cancelled', 'completed')
      AND abs(extract(epoch from (r.reservation_time - NEW.reservation_time))) < turn_minutes * 60;

    IF clash_count > 0 THEN
        RAISE EXCEPTION 'Table % is already booked within the % minute turn window of %',
            NEW.table_number, turn_minutes, NEW.reservation_time
            USING ERRCODE = '23P01';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_reservation_overlap ON public.reservations;
CREATE TRIGGER trg_prevent_reservation_overlap
BEFORE INSERT OR UPDATE OF table_number, reservation_time, status ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.prevent_reservation_overlap();

-- 4. ROW LEVEL SECURITY (mirror orders-table posture: open POS client CRUD)
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to reservations" ON public.reservations;
CREATE POLICY "Allow public read access to reservations"
ON public.reservations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert to reservations" ON public.reservations;
CREATE POLICY "Allow public insert to reservations"
ON public.reservations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow staff update access to reservations" ON public.reservations;
CREATE POLICY "Allow staff update access to reservations"
ON public.reservations FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow staff delete access to reservations" ON public.reservations;
CREATE POLICY "Allow staff delete access to reservations"
ON public.reservations FOR DELETE USING (true);

-- 5. REALTIME: enable Supabase Realtime publication for instant
-- cashier/captain sync (no-op if already a member).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'reservations'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Realtime publication step skipped: %', SQLERRM;
END;
$$;
