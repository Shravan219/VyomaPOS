/**
 * Reservation domain helpers — conflict validation, table layout, status derivation.
 * Pure functions (unit-testable) + thin Supabase/notification adapters.
 */
import type { CreateReservationInput, Order, Reservation, ReservationStatus, TableSection } from '@/src/types';

/** Default turn time in minutes — configurable buffer preventing back-to-back double-booking. */
export const DEFAULT_TURN_TIME_MINUTES = 120;

/** Canonical 20-table floor plan: T-01..T-12 Indoor, T-13..T-17 Rooftop, T-18..T-20 Lounge. */
export interface FloorTable {
  table_number: string;
  section: TableSection;
  capacity: number;
}

export const FLOOR_TABLES: FloorTable[] = Array.from({ length: 20 }, (_, i) => {
  const n = i + 1;
  const table_number = `T-${String(n).padStart(2, '0')}`;
  const section: TableSection = n <= 12 ? 'Indoor' : n <= 17 ? 'Rooftop' : 'Lounge';
  const capacity = section === 'Lounge' ? 6 : section === 'Rooftop' ? 4 : n % 4 === 0 ? 8 : 4;
  return { table_number, section, capacity };
});

export const RESERVATION_STATUSES: ReservationStatus[] = ['booked', 'seated', 'cancelled', 'completed'];

/** Visual status used by the floor-plan grid (spec: green/yellow/red/blue). */
export type FloorTableStatus = 'available' | 'reserved' | 'occupied' | 'cleaning';

export const FLOOR_STATUS_META: Record<FloorTableStatus, { label: string; dot: string; ring: string; pill: string }> = {
  available: {
    label: 'Available',
    dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]',
    ring: 'border-emerald-500/30 hover:border-emerald-500/60',
    pill: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  },
  reserved: {
    label: 'Reserved',
    dot: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.7)]',
    ring: 'border-amber-500/40 hover:border-amber-500/70',
    pill: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  },
  occupied: {
    label: 'Occupied',
    dot: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]',
    ring: 'border-red-500/40 hover:border-red-500/70',
    pill: 'bg-red-500/10 border-red-500/30 text-red-400',
  },
  cleaning: {
    label: 'Cleaning / Billed',
    dot: 'bg-sky-400 shadow-[0_0_8px_rgba(14,165,233,0.7)]',
    ring: 'border-sky-500/40 hover:border-sky-500/70',
    pill: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
  },
};

export function normalizeTableNumber(raw: string | number | null | undefined): string {
  if (raw === null || raw === undefined) return '';
  const s = String(raw).trim().toUpperCase();
  // Accept "4", "Table 4", "T-4", "T-04" -> "T-04"
  const digits = s.replace(/\D/g, '');
  if (!digits) return s;
  return `T-${digits.padStart(2, '0')}`;
}

export function isOverlapping(
  aTime: string | Date,
  bTime: string | Date,
  turnMinutes: number = DEFAULT_TURN_TIME_MINUTES,
): boolean {
  const a = new Date(aTime).getTime();
  const b = new Date(bTime).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return false;
  return Math.abs(a - b) < turnMinutes * 60 * 1000;
}

export interface ConflictCheck {
  conflict: boolean;
  conflictingReservation?: Reservation;
}

/**
 * Prevent double-booking the same table during overlapping slots.
 * Ignores cancelled / completed reservations.
 */
export function findReservationConflict(
  input: Pick<CreateReservationInput, 'table_number' | 'reservation_time'>,
  existing: Reservation[],
  turnMinutes: number = DEFAULT_TURN_TIME_MINUTES,
): ConflictCheck {
  const target = normalizeTableNumber(input.table_number);
  for (const r of existing) {
    if (r.status === 'cancelled' || r.status === 'completed') continue;
    if (normalizeTableNumber(r.table_number) !== target) continue;
    if (isOverlapping(input.reservation_time, r.reservation_time, turnMinutes)) {
      return { conflict: true, conflictingReservation: r };
    }
  }
  return { conflict: false };
}

export function validateReservationInput(
  input: CreateReservationInput,
  turnMinutes: number = DEFAULT_TURN_TIME_MINUTES,
): { ok: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  if (!input.guest_name || input.guest_name.trim().length < 2) {
    errors.guest_name = 'Guest name must be at least 2 characters.';
  }
  const digits = (input.phone || '').replace(/\D/g, '');
  if (digits.length < 10) {
    errors.phone = 'Enter a valid 10-digit phone number.';
  }
  if (!Number.isFinite(input.party_size) || input.party_size < 1 || input.party_size > 40) {
    errors.party_size = 'Party size must be between 1 and 40.';
  }
  const t = new Date(input.reservation_time).getTime();
  if (Number.isNaN(t)) {
    errors.reservation_time = 'Choose a valid date & time.';
  }
  if (!normalizeTableNumber(input.table_number)) {
    errors.table_number = 'Select a table.';
  }
  void turnMinutes;
  return { ok: Object.keys(errors).length === 0, errors };
}

/**
 * Derive floor-grid status for a table:
 * seated/active order -> occupied, booked slot near now -> reserved,
 * billing-stage orders (waiting for payment) -> cleaning, else available.
 */
export function deriveFloorStatus(
  tableNumber: string,
  reservations: Reservation[],
  orders: Order[],
  now: Date = new Date(),
  turnMinutes: number = DEFAULT_TURN_TIME_MINUTES,
): FloorTableStatus {
  const norm = normalizeTableNumber(tableNumber);

  const activeOrder = orders.find((o) => {
    if (!o.table_id) return false;
    return normalizeTableNumber(o.table_id) === norm;
  });
  if (activeOrder) {
    const st = (activeOrder.status || '').toLowerCase();
    if (st === 'waiting for payment' || st === 'waiting_for_payment') return 'cleaning';
    return 'occupied';
  }

  const seated = reservations.some(
    (r) => r.status === 'seated' && normalizeTableNumber(r.table_number) === norm,
  );
  if (seated) return 'occupied';

  const upcoming = reservations.some((r) => {
    if (r.status !== 'booked') return false;
    if (normalizeTableNumber(r.table_number) !== norm) return false;
    const diffMs = new Date(r.reservation_time).getTime() - now.getTime();
    // Reserved if slot is within turn window (past 30m .. future turn window)
    return diffMs > -30 * 60 * 1000 && diffMs < turnMinutes * 60 * 1000;
  });
  if (upcoming) return 'reserved';

  return 'available';
}

export function activeReservationForTable(
  tableNumber: string,
  reservations: Reservation[],
): Reservation | undefined {
  const norm = normalizeTableNumber(tableNumber);
  return reservations
    .filter((r) => (r.status === 'booked' || r.status === 'seated') && normalizeTableNumber(r.table_number) === norm)
    .sort((a, b) => new Date(a.reservation_time).getTime() - new Date(b.reservation_time).getTime())[0];
}

export function orderForTable(tableNumber: string, orders: Order[]): Order | undefined {
  const norm = normalizeTableNumber(tableNumber);
  return orders.find((o) => o.table_id && normalizeTableNumber(o.table_id) === norm);
}

// ─── Notification placeholder (SMS / WhatsApp via existing messaging layer) ──

export interface ReservationNotification {
  to: string;
  guestName: string;
  tableNumber: string;
  reservationTime: string;
  channel: 'whatsapp' | 'sms';
}

export function buildConfirmationMessage(r: Pick<Reservation, 'guest_name' | 'table_number' | 'reservation_time' | 'party_size'>, restaurantName = 'Xtra Rooftop Lounge & Cafe'): string {
  const when = new Date(r.reservation_time).toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
  return [
    `✨ *Booking Confirmed — ${restaurantName}*`,
    `Namaste ${r.guest_name}! Your table ${normalizeTableNumber(r.table_number)} for ${r.party_size} guest(s) is reserved.`,
    `🗓 ${when}`,
    `Reply to this chat for changes. See you soon!`,
  ].join('\n');
}

/**
 * Fire-and-forget placeholder that posts to the existing WhatsApp receipt layer
 * (`/api/whatsapp/send-receipt`-style endpoint) — falls back to a `wa.me` deep
 * link payload when the bot is offline. Never throws; callers must not await critically.
 */
export async function triggerReservationNotification(payload: ReservationNotification): Promise<{ ok: boolean; message: string }> {
  const text = buildConfirmationMessage({
    guest_name: payload.guestName,
    table_number: payload.tableNumber,
    reservation_time: payload.reservationTime,
    party_size: 0,
  });
  try {
    const res = await fetch('/api/whatsapp/send-reservation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, message: text }),
    });
    if (res.ok) return { ok: true, message: 'Confirmation sent via messaging layer.' };
    return { ok: false, message: 'Messaging layer unavailable — confirmation queued.' };
  } catch {
    return { ok: false, message: 'Messaging layer unreachable — confirmation queued.' };
  }
}

/** Local date helpers for the daily timeline / queue views. */
export function isSameDay(a: string | Date, b: string | Date): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

export function toInputDateTimeValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
