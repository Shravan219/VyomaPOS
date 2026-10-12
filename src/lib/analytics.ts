/**
 * VyomaPOS Analytics engine — pure functions over order rows.
 *
 * Time model: the primary timestamp is `placed_at_ist` (a wall-clock string
 * like "2026-10-09 21:14:05" already in Asia/Kolkata). `created_at` (UTC ISO)
 * is only a fallback. All day boundaries and rush-hour buckets are computed
 * in IST so calendar math never drifts with the viewer's timezone.
 */

export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export interface AnalyticsItem {
  name?: string;
  quantity?: number | string;
  price?: number | string;
}

export interface AnalyticsOrder {
  id?: string | number;
  token?: string | number;
  status?: string;
  total?: number | string;
  items?: AnalyticsItem[] | unknown;
  customer_name?: string;
  customer_phone?: string;
  table_id?: string | number | null;
  created_at?: string;
  placed_at_ist?: string;
  order_type?: string;
  aggregator_platform?: string;
}

export type RangePreset =
  | 'today'
  | 'yesterday'
  | 'last7'
  | 'last30'
  | 'thisMonth'
  | 'last3months'
  | 'thisYear'
  | 'alltime'
  | 'custom';

export interface TimeRange {
  startMs: number;
  endMs: number;
}

export interface Kpis {
  revenue: number;
  volume: number;
  aov: number;
}

export interface ItemStat {
  name: string;
  qty: number;
  revenue: number;
}

export interface HourStat {
  hour: number;
  count: number;
  label: string;
}

export interface ChannelStat {
  channel: string;
  revenue: number;
  count: number;
}

const CANCELLED = new Set(['cancelled', 'canceled', 'void', 'refunded']);

export function isCancelled(order: AnalyticsOrder): boolean {
  return CANCELLED.has(String(order?.status ?? '').toLowerCase().trim());
}

export function toNumber(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** "2026-10-09 21:14:05" (IST wall time) -> epoch ms. Null when unparsable. */
export function parseIstWallClock(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const m = value.trim().match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/
  );
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m.map(Number);
  if (!y || !mo || !d || h > 23 || mi > 59 || (s ?? 0) > 59) return null;
  return Date.UTC(y, mo - 1, d, h, mi, s ?? 0) - IST_OFFSET_MS;
}

/** Epoch ms for an order, preferring placed_at_ist. Null when unknown. */
export function orderTimeMs(order: AnalyticsOrder): number | null {
  const ist = parseIstWallClock(order?.placed_at_ist);
  if (ist !== null) return ist;
  const raw = order?.created_at;
  if (typeof raw === 'string' && raw.trim()) {
    const t = Date.parse(raw.trim());
    if (Number.isFinite(t)) return t;
  }
  return null;
}

/** Midnight IST that starts the IST day containing `epochMs`. */
export function istDayStart(epochMs: number): number {
  const ist = new Date(epochMs + IST_OFFSET_MS);
  const dayStartUtc = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate());
  return dayStartUtc - IST_OFFSET_MS;
}

/** First ms of the IST month containing `epochMs`. */
export function istMonthStart(epochMs: number): number {
  const ist = new Date(epochMs + IST_OFFSET_MS);
  return Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), 1) - IST_OFFSET_MS;
}

/** First ms of the IST year containing `epochMs`. */
export function istYearStart(epochMs: number): number {
  const ist = new Date(epochMs + IST_OFFSET_MS);
  return Date.UTC(ist.getUTCFullYear(), 0, 1) - IST_OFFSET_MS;
}

export interface PresetInput {
  preset: RangePreset;
  nowMs?: number;
  customStartMs?: number;
  customEndMs?: number;
  /** Bounds of the available data (for alltime / fit-to-data). */
  dataStartMs?: number;
  dataEndMs?: number;
}

/** Resolve a preset to an [startMs, endMs) window. End is exclusive. */
export function resolvePreset(input: PresetInput): TimeRange {
  const now = input.nowMs ?? Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const todayStart = istDayStart(now);

  switch (input.preset) {
    case 'today':
      return { startMs: todayStart, endMs: todayStart + DAY };
    case 'yesterday':
      return { startMs: todayStart - DAY, endMs: todayStart };
    case 'last7':
      return { startMs: todayStart - 6 * DAY, endMs: todayStart + DAY };
    case 'last30':
      return { startMs: todayStart - 29 * DAY, endMs: todayStart + DAY };
    case 'thisMonth': {
      const m = istMonthStart(now);
      const ist = new Date(now + IST_OFFSET_MS);
      const next = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth() + 1, 1) - IST_OFFSET_MS;
      return { startMs: m, endMs: Math.min(next, now) };
    }
    case 'last3months': {
      const ist = new Date(now + IST_OFFSET_MS);
      const start = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth() - 2, 1) - IST_OFFSET_MS;
      return { startMs: start, endMs: now };
    }
    case 'thisYear':
      return { startMs: istYearStart(now), endMs: now };
    case 'alltime':
      return {
        startMs: input.dataStartMs ?? 0,
        endMs: input.dataEndMs ?? now,
      };
    case 'custom': {
      const s = input.customStartMs ?? todayStart;
      const e = input.customEndMs ?? todayStart + DAY;
      return { startMs: Math.min(s, e), endMs: Math.max(s, e) };
    }
  }
}

/** The immediately preceding window of equal length (for comparisons). */
export function precedingRange(range: TimeRange): TimeRange {
  const len = Math.max(0, range.endMs - range.startMs);
  return { startMs: range.startMs - len, endMs: range.startMs };
}

export function inRange(timeMs: number | null, range: TimeRange): boolean {
  return timeMs !== null && timeMs >= range.startMs && timeMs < range.endMs;
}

/** Orders in range, excluding cancelled ones. */
export function ordersInRange(orders: AnalyticsOrder[], range: TimeRange): AnalyticsOrder[] {
  return (orders ?? []).filter((o) => !isCancelled(o) && inRange(orderTimeMs(o), range));
}

export function computeKpis(orders: AnalyticsOrder[]): Kpis {
  const valid = (orders ?? []).filter((o) => !isCancelled(o));
  const revenue = valid.reduce((sum, o) => sum + toNumber(o?.total), 0);
  const volume = valid.length;
  return { revenue, volume, aov: volume > 0 ? revenue / volume : 0 };
}

/** Percentage change vs previous; null when previous is zero/empty. */
export function percentChange(current: number, previous: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function orderItems(order: AnalyticsOrder): AnalyticsItem[] {
  const items = order?.items;
  return Array.isArray(items) ? (items as AnalyticsItem[]) : [];
}

/** Per-item qty + revenue across orders (cancelled excluded). */
export function aggregateItems(orders: AnalyticsOrder[]): ItemStat[] {
  const map = new Map<string, ItemStat>();
  for (const o of orders ?? []) {
    if (isCancelled(o)) continue;
    for (const it of orderItems(o)) {
      const name = String(it?.name ?? '').trim() || 'Unnamed item';
      const qty = Math.max(0, Math.floor(toNumber(it?.quantity) || 0));
      if (qty <= 0) continue;
      const revenue = toNumber(it?.price) * qty;
      const prev = map.get(name) ?? { name, qty: 0, revenue: 0 };
      prev.qty += qty;
      prev.revenue += revenue;
      map.set(name, prev);
    }
  }
  return [...map.values()].sort((a, b) => b.qty - a.qty || b.revenue - a.revenue);
}

export function channelOf(order: AnalyticsOrder): string {
  const platform = String(order?.aggregator_platform ?? '').trim().toLowerCase();
  if (platform === 'swiggy') return 'Swiggy';
  if (platform === 'zomato') return 'Zomato';
  if (platform) return 'Online';
  const type = String(order?.order_type ?? '').trim().toLowerCase();
  if (type === 'takeaway' || type === 'take-away' || type === 'delivery') return 'Takeaway';
  const table = String(order?.table_id ?? '').trim().toLowerCase();
  if (!table || table === 'takeaway' || table === 'take-away' || table === 'online' || table === 'delivery') {
    return 'Takeaway';
  }
  return 'Dine-In';
}

/** Gross spend + counts per channel (cancelled excluded). */
export function channelSplit(orders: AnalyticsOrder[]): ChannelStat[] {
  const map = new Map<string, ChannelStat>();
  for (const o of orders ?? []) {
    if (isCancelled(o)) continue;
    const channel = channelOf(o);
    const prev = map.get(channel) ?? { channel, revenue: 0, count: 0 };
    prev.revenue += toNumber(o?.total);
    prev.count += 1;
    map.set(channel, prev);
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue);
}

/** Top dine-in table by revenue (cancelled excluded). Null when none. */
export function topTable(orders: AnalyticsOrder[]): { table: string; revenue: number; count: number } | null {
  const map = new Map<string, { revenue: number; count: number }>();
  for (const o of orders ?? []) {
    if (isCancelled(o)) continue;
    const table = String(o?.table_id ?? '').trim();
    if (!table) continue;
    const lower = table.toLowerCase();
    if (lower === 'takeaway' || lower === 'take-away' || lower === 'online' || lower === 'delivery') continue;
    const prev = map.get(table) ?? { revenue: 0, count: 0 };
    prev.revenue += toNumber(o?.total);
    prev.count += 1;
    map.set(table, prev);
  }
  let best: { table: string; revenue: number; count: number } | null = null;
  for (const [table, v] of map) {
    if (!best || v.revenue > best.revenue) best = { table, ...v };
  }
  return best;
}

/** 24 IST-hour buckets by order count (cancelled excluded). */
export function hourlyBuckets(orders: AnalyticsOrder[]): number[] {
  const buckets = new Array<number>(24).fill(0);
  for (const o of orders ?? []) {
    if (isCancelled(o)) continue;
    const t = orderTimeMs(o);
    if (t === null) continue;
    const hour = new Date(t + IST_OFFSET_MS).getUTCHours();
    buckets[hour] += 1;
  }
  return buckets;
}

function hourLabel(hour: number): string {
  const fmt = (h: number) => {
    const hh = h % 24;
    const suffix = hh < 12 ? 'AM' : 'PM';
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${h12} ${suffix}`;
  };
  return `${fmt(hour)} – ${fmt(hour + 1)}`;
}

/** Top 3 peak ordering windows (cancelled excluded). */
export function rushHours(orders: AnalyticsOrder[], top = 3): HourStat[] {
  return hourlyBuckets(orders)
    .map((count, hour) => ({ hour, count, label: hourLabel(hour) }))
    .filter((h) => h.count > 0)
    .sort((a, b) => b.count - a.count || a.hour - b.hour)
    .slice(0, Math.max(0, top));
}

/** Min/max epoch of orders that carry a timestamp. Null when empty. */
export function dataBounds(orders: AnalyticsOrder[]): { startMs: number; endMs: number } | null {
  let min: number | null = null;
  let max: number | null = null;
  for (const o of orders ?? []) {
    const t = orderTimeMs(o);
    if (t === null) continue;
    if (min === null || t < min) min = t;
    if (max === null || t > max) max = t;
  }
  if (min === null || max === null) return null;
  return { startMs: min, endMs: max + 1 };
}

export function formatINR(n: number): string {
  const v = Number.isFinite(n) ? n : 0;
  return `₹${v.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export function formatDelta(pct: number | null): string {
  if (pct === null || !Number.isFinite(pct)) return '—';
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}
