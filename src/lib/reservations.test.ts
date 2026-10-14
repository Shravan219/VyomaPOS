import { describe, it, expect } from 'vitest';
import type { Reservation } from '@/src/types';
import {
  DEFAULT_TURN_TIME_MINUTES,
  deriveFloorStatus,
  findReservationConflict,
  FLOOR_TABLES,
  isOverlapping,
  normalizeTableNumber,
  validateReservationInput,
} from './reservations';

const base: Reservation = {
  id: 'r1',
  guest_name: 'Aarav Sharma',
  phone: '9876543210',
  party_size: 4,
  reservation_time: new Date('2026-10-15T19:00:00+05:30').toISOString(),
  table_number: 'T-04',
  status: 'booked',
  notes: null,
  created_at: new Date().toISOString(),
};

describe('normalizeTableNumber', () => {
  it('canonicalizes variants to T-NN', () => {
    expect(normalizeTableNumber('4')).toBe('T-04');
    expect(normalizeTableNumber('Table 4')).toBe('T-04');
    expect(normalizeTableNumber('t-4')).toBe('T-04');
    expect(normalizeTableNumber('T-04')).toBe('T-04');
  });
});

describe('floor plan', () => {
  it('defines 20 tables across Indoor / Rooftop / Lounge', () => {
    expect(FLOOR_TABLES).toHaveLength(20);
    expect(new Set(FLOOR_TABLES.map((t) => t.section))).toEqual(new Set(['Indoor', 'Rooftop', 'Lounge']));
  });
});

describe('conflict validation', () => {
  it('flags overlapping bookings on the same table', () => {
    const check = findReservationConflict(
      { table_number: 'Table 4', reservation_time: new Date('2026-10-15T20:00:00+05:30').toISOString() },
      [base],
      DEFAULT_TURN_TIME_MINUTES,
    );
    expect(check.conflict).toBe(true);
    expect(check.conflictingReservation?.id).toBe('r1');
  });

  it('allows slots outside the turn window', () => {
    const check = findReservationConflict(
      { table_number: 'T-04', reservation_time: new Date('2026-10-15T22:30:00+05:30').toISOString() },
      [base],
      DEFAULT_TURN_TIME_MINUTES,
    );
    expect(check.conflict).toBe(false);
  });

  it('ignores cancelled and completed bookings', () => {
    const dead = { ...base, status: 'cancelled' as const };
    const check = findReservationConflict(
      { table_number: 'T-04', reservation_time: base.reservation_time },
      [dead],
      DEFAULT_TURN_TIME_MINUTES,
    );
    expect(check.conflict).toBe(false);
  });

  it('does not clash across different tables', () => {
    const check = findReservationConflict(
      { table_number: 'T-05', reservation_time: base.reservation_time },
      [base],
      DEFAULT_TURN_TIME_MINUTES,
    );
    expect(check.conflict).toBe(false);
  });
});

describe('isOverlapping', () => {
  it('uses strict less-than on the turn boundary', () => {
    const a = '2026-10-15T19:00:00+05:30';
    const edge = '2026-10-15T21:00:00+05:30'; // exactly 120m later
    expect(isOverlapping(a, edge, 120)).toBe(false);
  });
});

describe('validateReservationInput', () => {
  it('rejects short names, bad phones, and invalid party sizes', () => {
    const { ok, errors } = validateReservationInput({
      guest_name: 'A',
      phone: '123',
      party_size: 0,
      reservation_time: new Date().toISOString(),
      table_number: 'T-01',
    });
    expect(ok).toBe(false);
    expect(errors.guest_name).toBeTruthy();
    expect(errors.phone).toBeTruthy();
    expect(errors.party_size).toBeTruthy();
  });
});

describe('deriveFloorStatus', () => {
  it('marks tables with live orders as occupied', () => {
    const status = deriveFloorStatus('T-04', [], [
      { id: 'o1', created_at: new Date().toISOString(), token: '#1', status: 'preparing', total: 500, items: [], table_id: 'Table 4' } as any,
    ]);
    expect(status).toBe('occupied');
  });

  it('marks billing-stage tables as cleaning', () => {
    const status = deriveFloorStatus('T-04', [], [
      { id: 'o1', created_at: new Date().toISOString(), token: '#1', status: 'waiting for payment', total: 500, items: [], table_id: 'T-04' } as any,
    ]);
    expect(status).toBe('cleaning');
  });

  it('marks near-term bookings as reserved and distant tables as available', () => {
    const now = new Date('2026-10-15T18:30:00+05:30');
    expect(deriveFloorStatus('T-04', [base], [], now)).toBe('reserved');
    expect(deriveFloorStatus('T-09', [base], [], now)).toBe('available');
  });
});
