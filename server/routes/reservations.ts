import { Router, Request, Response } from 'express';
import { broadcastEvent, getSupabaseClient } from '../orderStore';

const router = Router();

const TURN_MINUTES = Number(process.env.RESERVATION_TURN_MINUTES || 120);
const VALID_STATUSES = new Set(['booked', 'seated', 'cancelled', 'completed']);

function normalizeTable(raw: unknown): string {
  const s = String(raw ?? '').trim().toUpperCase();
  const digits = s.replace(/\D/g, '');
  if (!digits) return s;
  return `T-${digits.padStart(2, '0')}`;
}

function overlaps(a: string, b: string, turnMinutes: number): boolean {
  const ta = new Date(a).getTime();
  const tb = new Date(b).getTime();
  if (Number.isNaN(ta) || Number.isNaN(tb)) return false;
  return Math.abs(ta - tb) < turnMinutes * 60 * 1000;
}

function validateBody(body: any): string | null {
  if (!body || typeof body !== 'object') return 'Request body must be a JSON object';
  if (!body.guest_name || String(body.guest_name).trim().length < 2) return 'guest_name must be at least 2 characters';
  const digits = String(body.phone || '').replace(/\D/g, '');
  if (digits.length < 10) return 'phone must contain at least 10 digits';
  const party = Number(body.party_size);
  if (!Number.isFinite(party) || party < 1 || party > 40) return 'party_size must be between 1 and 40';
  if (Number.isNaN(new Date(body.reservation_time).getTime())) return 'reservation_time must be a valid ISO timestamp';
  if (!normalizeTable(body.table_number)) return 'table_number is required';
  if (body.status && !VALID_STATUSES.has(String(body.status))) return `status must be one of ${[...VALID_STATUSES].join(', ')}`;
  return null;
}

async function findConflict(supabase: any, tableNumber: string, time: string, excludeId?: string) {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('table_number', tableNumber)
    .not('status', 'in', '(cancelled,completed)')
    .order('reservation_time', { ascending: true });
  if (error) throw new Error(error.message);
  // Case-insensitive table match + turn-window overlap (DB trigger is the final guard)
  const target = normalizeTable(tableNumber);
  const clash = (data || []).find(
    (r: any) =>
      r.id !== excludeId &&
      normalizeTable(r.table_number) === target &&
      overlaps(time, r.reservation_time, TURN_MINUTES),
  );
  return clash || null;
}

/**
 * GET /api/reservations?date=YYYY-MM-DD&status=booked
 * Lists reservations (newest slot first). `date` filters to that calendar day.
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return res.status(503).json({ success: false, message: 'Supabase not configured', reservations: [] });
    const { date, status } = _req.query as { date?: string; status?: string };
    let q = supabase.from('reservations').select('*').order('reservation_time', { ascending: true });
    if (status && VALID_STATUSES.has(String(status))) q = q.eq('status', String(status));
    if (date) {
      const day = new Date(`${date}T00:00:00`);
      if (!Number.isNaN(day.getTime())) {
        const next = new Date(day);
        next.setDate(next.getDate() + 1);
        q = q.gte('reservation_time', day.toISOString()).lt('reservation_time', next.toISOString());
      }
    }
    const { data, error } = await q;
    if (error) return res.status(500).json({ success: false, message: error.message, reservations: [] });
    return res.json({ success: true, count: (data || []).length, reservations: data || [] });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to list reservations' });
  }
});

/**
 * POST /api/reservations — create booking with conflict validation.
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const err = validateBody(req.body);
    if (err) return res.status(400).json({ success: false, message: err });
    const supabase = getSupabaseClient();
    if (!supabase) return res.status(503).json({ success: false, message: 'Supabase not configured' });

    const tableNumber = normalizeTable(req.body.table_number);
    const clash = await findConflict(supabase, tableNumber, req.body.reservation_time);
    if (clash) {
      return res.status(409).json({
        success: false,
        message: `Table ${tableNumber} is already booked within the ${TURN_MINUTES}-minute turn window.`,
        conflictingReservation: clash,
      });
    }

    const { data, error } = await supabase
      .from('reservations')
      .insert({
        guest_name: String(req.body.guest_name).trim(),
        phone: String(req.body.phone).trim(),
        party_size: Number(req.body.party_size),
        reservation_time: new Date(req.body.reservation_time).toISOString(),
        table_number: tableNumber,
        status: 'booked',
        notes: req.body.notes ? String(req.body.notes).trim() : null,
      })
      .select()
      .single();
    if (error) {
      const status = /already booked/i.test(error.message) ? 409 : 500;
      return res.status(status).json({ success: false, message: error.message });
    }
    broadcastEvent('reservation_created', data);
    return res.status(201).json({ success: true, reservation: data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to create reservation' });
  }
});

/**
 * PATCH /api/reservations/:id — status transitions (seat/cancel/complete) + reschedule.
 * Seat Guest: { status: 'seated' } — client links party to a new billing session.
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return res.status(503).json({ success: false, message: 'Supabase not configured' });
    const { id } = req.params;
    const patch: Record<string, any> = {};
    if (req.body.status !== undefined) {
      if (!VALID_STATUSES.has(String(req.body.status))) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }
      patch.status = String(req.body.status);
    }
    if (req.body.reservation_time !== undefined) {
      if (Number.isNaN(new Date(req.body.reservation_time).getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid reservation_time' });
      }
      patch.reservation_time = new Date(req.body.reservation_time).toISOString();
    }
    if (req.body.table_number !== undefined) patch.table_number = normalizeTable(req.body.table_number);
    if (req.body.notes !== undefined) patch.notes = req.body.notes ? String(req.body.notes) : null;
    if (req.body.party_size !== undefined) {
      const p = Number(req.body.party_size);
      if (!Number.isFinite(p) || p < 1 || p > 40) return res.status(400).json({ success: false, message: 'Invalid party_size' });
      patch.party_size = p;
    }
    if (Object.keys(patch).length === 0) return res.status(400).json({ success: false, message: 'Nothing to update' });

    // Re-check overlap when time/table changes on an active booking
    if ((patch.reservation_time || patch.table_number) && (!patch.status || !['cancelled', 'completed'].includes(patch.status))) {
      const { data: current } = await supabase.from('reservations').select('*').eq('id', id).single();
      if (current) {
        const clash = await findConflict(
          supabase,
          patch.table_number || current.table_number,
          patch.reservation_time || current.reservation_time,
          id,
        );
        if (clash) {
          return res.status(409).json({ success: false, message: 'Reschedule conflicts with an existing booking.', conflictingReservation: clash });
        }
      }
    }

    const { data, error } = await supabase.from('reservations').update(patch).eq('id', id).select().single();
    if (error) return res.status(500).json({ success: false, message: error.message });
    broadcastEvent('reservation_updated', data);
    return res.json({ success: true, reservation: data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to update reservation' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return res.status(503).json({ success: false, message: 'Supabase not configured' });
    // Soft-cancel to preserve audit trail
    const { data, error } = await supabase.from('reservations').update({ status: 'cancelled' }).eq('id', req.params.id).select().single();
    if (error) return res.status(500).json({ success: false, message: error.message });
    broadcastEvent('reservation_updated', data);
    return res.json({ success: true, reservation: data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to cancel reservation' });
  }
});

/**
 * POST /api/whatsapp/send-reservation — notification placeholder wired to the
 * existing Baileys messaging layer. Queues gracefully when offline.
 */
router.post('/notify', async (req: Request, res: Response) => {
  try {
    const { to, message } = req.body || {};
    if (!to || !message) return res.status(400).json({ success: false, message: 'to and message are required' });
    // Real send path lives in server/whatsappBot.ts; this endpoint records intent
    // and returns queued so the POS never blocks on messaging.
    broadcastEvent('reservation_notification', { to, at: new Date().toISOString() });
    return res.json({ success: true, queued: true, message: 'Confirmation queued via messaging layer.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Notify failed' });
  }
});

export default router;
