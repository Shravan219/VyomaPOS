import { describe, it, expect } from 'vitest';
import {
  IST_OFFSET_MS,
  parseIstWallClock,
  orderTimeMs,
  istDayStart,
  resolvePreset,
  precedingRange,
  ordersInRange,
  computeKpis,
  percentChange,
  aggregateItems,
  channelSplit,
  topTable,
  rushHours,
  dataBounds,
  formatINR,
  type AnalyticsOrder,
} from '../lib/analytics';

// Fixed "now": 2026-10-10 12:00:00 UTC == 17:30 IST (Saturday).
const NOW = Date.UTC(2026, 9, 10, 12, 0, 0);
const DAY = 24 * 60 * 60 * 1000;

const mk = (over: Partial<AnalyticsOrder> = {}): AnalyticsOrder => ({
  status: 'completed',
  total: 100,
  placed_at_ist: '2026-10-10 10:00:00',
  ...over,
});

describe('IST timestamp parsing', () => {
  it('parses placed_at_ist wall clock as IST', () => {
    // 10:00 IST == 04:30 UTC
    expect(parseIstWallClock('2026-10-10 10:00:00')).toBe(Date.UTC(2026, 9, 10, 4, 30, 0));
  });

  it('rejects garbage without throwing', () => {
    expect(parseIstWallClock('')).toBeNull();
    expect(parseIstWallClock('not a date')).toBeNull();
    expect(parseIstWallClock(null)).toBeNull();
    expect(parseIstWallClock(undefined)).toBeNull();
    expect(parseIstWallClock('2026-13-40 99:99:99')).toBeNull();
  });

  it('prefers placed_at_ist over created_at', () => {
    const t = orderTimeMs(mk({ placed_at_ist: '2026-10-10 10:00:00', created_at: '2020-01-01T00:00:00Z' }));
    expect(t).toBe(Date.UTC(2026, 9, 10, 4, 30, 0));
  });

  it('falls back to created_at UTC when IST is missing', () => {
    const t = orderTimeMs(mk({ placed_at_ist: undefined, created_at: '2026-10-10T04:30:00Z' }));
    expect(t).toBe(Date.UTC(2026, 9, 10, 4, 30, 0));
  });

  it('returns null when no timestamp exists', () => {
    expect(orderTimeMs(mk({ placed_at_ist: undefined, created_at: undefined }))).toBeNull();
  });
});

describe('IST day boundaries', () => {
  it('starts today at IST midnight (18:30 UTC previous day)', () => {
    // 2026-10-10 IST midnight == 2026-10-09 18:30 UTC
    expect(istDayStart(NOW)).toBe(Date.UTC(2026, 9, 9, 18, 30, 0));
  });

  it('resolves today / yesterday / last7 presets', () => {
    const today = resolvePreset({ preset: 'today', nowMs: NOW });
    expect(today.endMs - today.startMs).toBe(DAY);
    expect(today.startMs).toBe(Date.UTC(2026, 9, 9, 18, 30, 0));

    const yest = resolvePreset({ preset: 'yesterday', nowMs: NOW });
    expect(yest.endMs).toBe(today.startMs);
    expect(yest.endMs - yest.startMs).toBe(DAY);

    const last7 = resolvePreset({ preset: 'last7', nowMs: NOW });
    expect(last7.endMs - last7.startMs).toBe(7 * DAY);
    expect(last7.endMs).toBe(today.startMs + DAY);
  });

  it('computes the preceding equivalent window', () => {
    const today = resolvePreset({ preset: 'today', nowMs: NOW });
    const prev = precedingRange(today);
    expect(prev.endMs).toBe(today.startMs);
    expect(prev.endMs - prev.startMs).toBe(DAY);
  });
});

describe('range filtering + KPIs', () => {
  const inRange = mk({ placed_at_ist: '2026-10-10 10:00:00', total: 200 });
  const old = mk({ placed_at_ist: '2026-09-01 10:00:00', total: 999 });
  const cancelled = mk({ placed_at_ist: '2026-10-10 11:00:00', total: 500, status: 'cancelled' });

  it('keeps in-range orders and drops cancelled + out-of-range', () => {
    const range = resolvePreset({ preset: 'today', nowMs: NOW });
    expect(ordersInRange([inRange, old, cancelled], range)).toEqual([inRange]);
  });

  it('computes revenue, volume and AOV excluding cancelled', () => {
    const kpis = computeKpis([inRange, old, cancelled]);
    expect(kpis).toEqual({ revenue: 1199, volume: 2, aov: 599.5 });
  });

  it('returns zeroed KPIs for empty input', () => {
    expect(computeKpis([])).toEqual({ revenue: 0, volume: 0, aov: 0 });
  });

  it('computes deltas and guards divide-by-zero', () => {
    expect(percentChange(150, 100)).toBeCloseTo(50);
    expect(percentChange(80, 100)).toBeCloseTo(-20);
    expect(percentChange(100, 0)).toBeNull();
  });
});

describe('menu + channel insights', () => {
  const orders: AnalyticsOrder[] = [
    mk({ items: [{ name: 'Paneer Tikka', quantity: 2, price: 250 }], total: 500, placed_at_ist: '2026-10-10 12:00:00' }),
    mk({ items: [{ name: 'Paneer Tikka', quantity: 1, price: 250 }, { name: 'Naan', quantity: 4, price: 50 }], total: 450, placed_at_ist: '2026-10-10 19:00:00' }),
    mk({ items: [{ name: 'Naan', quantity: 1, price: 50 }], total: 50, status: 'cancelled', placed_at_ist: '2026-10-10 20:00:00' }),
  ];

  it('aggregates items by qty and revenue, ignoring cancelled', () => {
    const stats = aggregateItems(orders);
    expect(stats[0]).toEqual({ name: 'Naan', qty: 4, revenue: 200 });
    expect(stats[1]).toEqual({ name: 'Paneer Tikka', qty: 3, revenue: 750 });
    expect(stats).toHaveLength(2);
  });

  it('splits channels and finds the top table', () => {
    const mixed: AnalyticsOrder[] = [
      mk({ total: 500, table_id: 'T-04', order_type: 'dine_in', placed_at_ist: '2026-10-10 12:00:00' }),
      mk({ total: 300, table_id: 'Takeaway', order_type: 'takeaway', placed_at_ist: '2026-10-10 13:00:00' }),
      mk({ total: 700, table_id: 'Online', aggregator_platform: 'swiggy', placed_at_ist: '2026-10-10 14:00:00' }),
    ];
    const split = channelSplit(mixed);
    expect(split.map((s) => s.channel)).toEqual(['Swiggy', 'Dine-In', 'Takeaway']);
    expect(topTable(mixed)).toEqual({ table: 'T-04', revenue: 500, count: 1 });
  });

  it('returns null top table when no dine-in rows exist', () => {
    expect(topTable([mk({ table_id: 'Takeaway', placed_at_ist: '2026-10-10 12:00:00' })])).toBeNull();
  });
});

describe('rush hours + bounds + formatting', () => {
  const orders: AnalyticsOrder[] = [
    ...Array.from({ length: 5 }, () => mk({ placed_at_ist: '2026-10-10 20:15:00' })),
    ...Array.from({ length: 3 }, () => mk({ placed_at_ist: '2026-10-10 13:05:00' })),
    mk({ placed_at_ist: '2026-10-10 09:00:00' }),
  ];

  it('detects top peak windows in order', () => {
    const rush = rushHours(orders);
    expect(rush).toHaveLength(3);
    expect(rush[0]).toMatchObject({ hour: 20, count: 5 });
    expect(rush[0].label).toContain('8 PM');
    expect(rush[1]).toMatchObject({ hour: 13, count: 3 });
  });

  it('computes data bounds for fit-to-data', () => {
    const b = dataBounds(orders);
    expect(b?.startMs).toBe(parseIstWallClock('2026-10-10 09:00:00'));
    expect(b?.endMs).toBeGreaterThan(parseIstWallClock('2026-10-10 20:15:00')!);
    expect(dataBounds([])).toBeNull();
  });

  it('formats currency and deltas', () => {
    expect(formatINR(125000)).toBe('₹1,25,000');
    expect(formatINR(NaN)).toBe('₹0');
  });
});

describe('IST constant', () => {
  it('is UTC+5:30', () => {
    expect(IST_OFFSET_MS).toBe(19800000);
  });
});
