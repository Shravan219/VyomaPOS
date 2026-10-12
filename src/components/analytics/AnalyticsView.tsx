import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import {
  aggregateItems,
  channelOf,
  channelSplit,
  computeKpis,
  dataBounds,
  formatDelta,
  formatINR,
  ordersInRange,
  orderTimeMs,
  percentChange,
  precedingRange,
  resolvePreset,
  rushHours,
  topTable,
  type AnalyticsOrder,
  type RangePreset,
} from '@/src/lib/analytics';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Star,
  Receipt,
  Users,
  IndianRupee,
  Utensils,
  Wifi,
  WifiOff,
  CalendarDays,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PRESETS: { key: RangePreset; label: string }[] = [
  { key: 'alltime', label: 'All Time' },
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last7', label: 'Last 7 Days' },
  { key: 'last30', label: 'Last 30 Days' },
  { key: 'thisMonth', label: 'This Month' },
  { key: 'last3months', label: '3 Months' },
  { key: 'thisYear', label: 'This Year' },
];

const CHANNEL_COLORS: Record<string, string> = {
  'Dine-In': '#C5A059',
  Takeaway: '#38bdf8',
  Swiggy: '#FC8019',
  Zomato: '#E23744',
  Online: '#a78bfa',
};

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  ready: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  preparing: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  pending: 'bg-white/5 text-white/50 border-white/15',
  cancelled: 'bg-red-500/15 text-red-300 border-red-500/30',
  'waiting for payment': 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  waiting_for_payment: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
};

function statusBadge(status: unknown): string {
  const key = String(status ?? 'pending').toLowerCase().trim();
  return STATUS_STYLES[key] ?? STATUS_STYLES.pending;
}

function formatDayLong(ms: number): string {
  return new Date(ms).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

function formatShortDate(ms: number): string {
  return new Date(ms).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}

function formatHourLabel(hour: number): string {
  const d = Date.UTC(2026, 0, 1, hour, 0, 0);
  return new Date(d).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });
}

function orderEpoch(o: AnalyticsOrder): number | null {
  return orderTimeMs(o);
}

export function AnalyticsView() {
  const [orders, setOrders] = useState<AnalyticsOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [live, setLive] = useState(false);
  const [preset, setPreset] = useState<RangePreset>('alltime');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const fetchOrders = useCallback(async (quiet = false) => {
    if (!isSupabaseConfigured) {
      if (mounted.current) setLoading(false);
      return;
    }
    if (!quiet && mounted.current) setSyncing(true);
    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Analytics fetch timed out')), 8000)
      );
      const query = supabase
        .from('orders')
        .select('id,token,status,total,items,customer_name,customer_phone,table_id,created_at,placed_at_ist,order_type,aggregator_platform')
        .order('created_at', { ascending: false })
        .limit(2000);
      const res = (await Promise.race([query, timeout])) as unknown as {
        data: AnalyticsOrder[] | null;
        error: { message?: string } | null;
      };
      if (res.error) throw new Error(res.error.message || 'Failed to load orders');
      if (mounted.current) {
        setOrders(Array.isArray(res.data) ? res.data : []);
        setLastSync(Date.now());
      }
    } catch (e: any) {
      if (!quiet) toast.error(e?.message || 'Could not sync analytics');
    } finally {
      if (mounted.current) {
        setLoading(false);
        setSyncing(false);
      }
    }
  }, []);

  // Initial load + Supabase realtime + 8s auto-sync fallback.
  useEffect(() => {
    fetchOrders();
    if (!isSupabaseConfigured) return;
    let channel: { unsubscribe: () => void } | null = null;
    try {
      channel = supabase
        .channel('analytics-orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
          fetchOrders(true);
        })
        .subscribe((status: string) => {
          if (mounted.current) setLive(status === 'SUBSCRIBED');
        }) as unknown as { unsubscribe: () => void };
    } catch {
      // Realtime unavailable — polling below keeps data fresh.
    }
    const poll = setInterval(() => fetchOrders(true), 8000);
    return () => {
      clearInterval(poll);
      try {
        channel?.unsubscribe();
      } catch {
        // ignore
      }
    };
  }, [fetchOrders]);

  const bounds = useMemo(() => dataBounds(orders), [orders]);

  const range = useMemo(() => {
    if (preset === 'custom') {
      const from = customFrom ? new Date(`${customFrom}T00:00:00`).getTime() : undefined;
      const to = customTo ? new Date(`${customTo}T23:59:59`).getTime() + 1 : undefined;
      return resolvePreset({ preset: 'custom', customStartMs: from, customEndMs: to });
    }
    return resolvePreset({
      preset,
      dataStartMs: bounds?.startMs,
      dataEndMs: bounds ? bounds.endMs : Date.now(),
    });
  }, [preset, customFrom, customTo, bounds]);

  const current = useMemo(() => ordersInRange(orders, range), [orders, range]);
  const ledger = useMemo(() => [...current].slice(0, 50), [current]);
  const previous = useMemo(() => ordersInRange(orders, precedingRange(range)), [orders, range]);
  const kpis = useMemo(() => computeKpis(current), [current]);
  const prevKpis = useMemo(() => computeKpis(previous), [previous]);

  const deltas = useMemo(
    () => ({
      revenue: percentChange(kpis.revenue, prevKpis.revenue),
      volume: percentChange(kpis.volume, prevKpis.volume),
      aov: percentChange(kpis.aov, prevKpis.aov),
    }),
    [kpis, prevKpis]
  );

  const items = useMemo(() => aggregateItems(current), [current]);
  const chartItems = useMemo(() => items.slice(0, 8), [items]);
  const maxQty = useMemo(() => chartItems.reduce((m, it) => Math.max(m, it.qty), 0), [chartItems]);
  const topByRevenue = useMemo(
    () => [...items].sort((a, b) => b.revenue - a.revenue)[0] ?? null,
    [items]
  );
  const channels = useMemo(() => channelSplit(current), [current]);
  const topChannel = useMemo(() => channels[0] ?? null, [channels]);
  const bestTable = useMemo(() => topTable(current), [current]);
  const rush = useMemo(() => rushHours(current, 3), [current]);

  const channelTotal = useMemo(() => channels.reduce((s, c) => s + c.revenue, 0), [channels]);

  const donutSegments = useMemo(() => {
    const R = 64;
    const C = 2 * Math.PI * R;
    if (channelTotal <= 0) return [];
    let acc = 0;
    return channels.map((c) => {
      const frac = c.revenue / channelTotal;
      const seg = { ...c, dash: frac * C, offset: acc, circumference: C };
      acc += frac * C;
      return seg;
    });
  }, [channels, channelTotal]);

  const yTicks = useMemo(() => {
    if (maxQty <= 0) return [0];
    const steps = Math.min(4, maxQty);
    return Array.from({ length: steps + 1 }, (_, i) => Math.round((maxQty * i) / steps));
  }, [maxQty]);

  if (!isSupabaseConfigured) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div className="max-w-sm">
          <WifiOff size={28} className="mx-auto mb-4 text-white/30" />
          <p className="font-serif text-xl text-white">Analytics unavailable</p>
          <p className="mt-2 text-sm text-white/50">
            Connect Supabase (URL + anon key) to power revenue, menu and service insights.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <RefreshCw size={28} className="animate-spin text-primary/60" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar h-full bg-black">
      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">
            Vyoma · Analytics Dashboard
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            {formatDayLong(Date.now())}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-white/40">
            {lastSync ? `Synced ${new Date(lastSync).toLocaleTimeString('en-GB')}` : 'Not synced yet'}
          </span>
          <Button
            variant="outline"
            onClick={() => fetchOrders()}
            disabled={syncing}
            className="rounded-lg h-9 px-4 text-[10px] font-bold uppercase tracking-widest border-white/15 hover:border-primary/50"
          >
            <RefreshCw size={13} className={`mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing…' : 'Sync Data'}
          </Button>
        </div>
      </div>

      {/* Time range panel */}
      <div className="rounded-xl border border-white/10 bg-[#0B0B0D] px-4 py-3">
        <div className="flex flex-col xl:flex-row xl:items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <CalendarDays size={13} className="text-primary" />
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/50">
              Time Range:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 flex-1">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPreset(p.key)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 border',
                  preset === p.key
                    ? 'border-primary/60 text-primary bg-primary/10'
                    : 'border-white/10 text-white/50 hover:text-white hover:border-white/25 bg-black/40'
                )}
              >
                {p.label}
              </button>
            ))}
            <div className="flex items-center gap-1.5">
              <Input
                type="date"
                aria-label="Custom range start"
                value={customFrom}
                onChange={(e) => {
                  setCustomFrom(e.target.value);
                  setPreset('custom');
                }}
                className="h-7 w-auto bg-black border-white/10 rounded-md text-[10px] text-white/70 px-2"
              />
              <span className="text-white/30 text-[10px]">→</span>
              <Input
                type="date"
                aria-label="Custom range end"
                value={customTo}
                onChange={(e) => {
                  setCustomTo(e.target.value);
                  setPreset('custom');
                }}
                className="h-7 w-auto bg-black border-white/10 rounded-md text-[10px] text-white/70 px-2"
              />
              <button
                onClick={() => {
                  setPreset('alltime');
                  setCustomFrom('');
                  setCustomTo('');
                }}
                className="px-3 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider border border-primary/40 text-primary hover:bg-primary/10 transition-all active:scale-95"
                title="Fit to available data span"
              >
                Fit Data
              </button>
            </div>
          </div>
          <span className="text-[10px] font-mono text-primary/80 border border-primary/30 bg-primary/5 rounded-md px-2.5 py-1.5 whitespace-nowrap shrink-0">
            ● {current.length} of {orders.filter((o) => String(o.status ?? '').toLowerCase().trim() !== 'cancelled').length} Orders
          </span>
        </div>
        <p className="mt-2 text-[10px] font-mono text-white/30">
          Data Span: {bounds ? `${formatShortDate(bounds.startMs)} to ${formatShortDate(bounds.endMs)}` : '—'}
          {live ? ' · ● realtime' : ''}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        <KpiCard icon={<IndianRupee size={13} />} label="Total Revenue" value={`Rs. ${kpis.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} delta={deltas.revenue} />
        <KpiCard icon={<Receipt size={13} />} label="Total Orders" value={String(kpis.volume)} delta={deltas.volume} />
        <KpiCard icon={<TrendingUp size={13} />} label="Avg. Order Value" value={`Rs. ${kpis.aov.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} delta={deltas.aov} />
        <KpiCard
          icon={<Star size={13} />}
          label="Most Popular Item"
          value={items[0]?.name ?? '—'}
          sub={items[0] ? `${items[0].qty} units sold` : undefined}
        />
        <KpiCard
          icon={<Utensils size={13} />}
          label="Top Table"
          value={bestTable ? `Table ${bestTable.table}` : topChannel ? topChannel.channel : '—'}
          sub={bestTable ? `${formatINR(bestTable.revenue)} spent` : topChannel ? `${formatINR(topChannel.revenue)} revenue` : undefined}
        />
      </div>

      {/* Rush hours */}
      <div className="rounded-xl border border-white/10 bg-[#0B0B0D] p-4 sm:p-5">
        <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/50">Rush Hour Peak Periods</p>
        <p className="text-[9px] font-mono uppercase tracking-wider text-white/25 mt-0.5">
          Hourly distribution · {preset === 'alltime' ? 'all time' : PRESETS.find((p) => p.key === preset)?.label ?? 'custom'} (IST)
        </p>
        {rush.length === 0 ? (
          <p className="mt-4 text-sm text-white/40">No orders in range yet.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {rush.map((h, i) => (
              <div key={h.hour} className="rounded-lg border border-white/10 bg-black/40 px-4 py-3.5">
                <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/35">
                  Peak Window {i + 1}
                </p>
                <div className="mt-2 flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 border border-primary/30 text-primary shrink-0">
                    <Clock size={14} />
                  </span>
                  <div>
                    <p className="font-mono font-bold text-primary text-base leading-none">
                      {formatHourLabel(h.hour)}
                    </p>
                    <p className="text-[10px] text-white/40 mt-1">{h.count} orders placed</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Item distribution + revenue donut */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 rounded-xl border border-white/10 bg-[#0B0B0D] p-4 sm:p-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/50">Item Sales Distribution</p>
          <p className="text-[9px] font-mono uppercase tracking-wider text-white/25 mt-0.5">
            Volume by product category · all time (IST)
          </p>
          {chartItems.length === 0 || maxQty <= 0 ? (
            <p className="mt-4 text-sm text-white/40">No item sales in range.</p>
          ) : (
            <div className="mt-3 flex gap-2">
              {/* Y axis */}
              <div className="flex flex-col justify-between text-[9px] font-mono text-white/30 text-right h-56 py-0.5 shrink-0 w-6">
                {[...yTicks].reverse().map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              {/* Bars */}
              <div className="flex-1 flex items-end justify-around gap-2 h-56 border-l border-b border-white/10 pl-2 pb-0.5">
                {chartItems.map((it) => (
                  <div key={it.name} className="flex flex-col items-center justify-end h-full flex-1 min-w-0 group">
                    <span className="text-[9px] font-mono text-primary/90 mb-1">{it.qty}</span>
                    <div
                      className="w-full max-w-12 rounded-t-sm bg-gradient-to-t from-[#8a6a2f] to-primary transition-all group-hover:brightness-110"
                      style={{ height: `${(it.qty / maxQty) * 100}%`, minHeight: it.qty > 0 ? 6 : 0 }}
                      title={`${it.name}: ${it.qty} sold · ${formatINR(it.revenue)}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          {chartItems.length > 0 && (
            <div className="mt-1 flex justify-around gap-2 ml-8">
              {chartItems.map((it) => (
                <div key={it.name} className="flex-1 min-w-0 text-center">
                  <p className="text-[8px] text-white/40 truncate -rotate-0" title={it.name}>
                    {it.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-[#0B0B0D] p-4 sm:p-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/50">Revenue by Table / Channel</p>
          <p className="text-[9px] font-mono uppercase tracking-wider text-white/25 mt-0.5">
            Gross spend distribution · all time (IST)
          </p>
          {channels.length === 0 || channelTotal <= 0 ? (
            <p className="mt-4 text-sm text-white/40">No revenue in range.</p>
          ) : (
            <div className="mt-4 flex flex-col items-center">
              <svg width="168" height="168" viewBox="0 0 168 168" role="img" aria-label="Revenue share by channel">
                <circle cx="84" cy="84" r="64" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="20" />
                {donutSegments.map((s) => (
                  <circle
                    key={s.channel}
                    cx="84"
                    cy="84"
                    r="64"
                    fill="none"
                    stroke={CHANNEL_COLORS[s.channel] ?? '#888'}
                    strokeWidth="20"
                    strokeDasharray={`${s.dash} ${s.circumference - s.dash}`}
                    strokeDashoffset={-s.offset}
                    transform="rotate(-90 84 84)"
                  />
                ))}
                <text x="84" y="80" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="bold" fontFamily="monospace">
                  {formatINR(channelTotal)}
                </text>
                <text x="84" y="98" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">
                  gross revenue
                </text>
              </svg>
              <div className="mt-4 w-full flex flex-col gap-1.5">
                {channels.map((c) => (
                  <div key={c.channel} className="flex items-center gap-2 text-[11px]">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ background: CHANNEL_COLORS[c.channel] ?? '#888' }}
                    />
                    <span className="text-white/55 uppercase tracking-wide flex-1">
                      {c.channel === 'Dine-In' ? `Table ${bestTable?.table ?? ''}`.trim() || 'Dine-In' : c.channel}
                    </span>
                    <span className="font-mono text-white/40">{c.count}</span>
                    <span className="font-mono font-bold text-primary w-20 text-right">
                      {formatINR(c.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order ledger */}
      <div className="rounded-xl border border-white/10 bg-[#0B0B0D] p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/50">Order Ledger</p>
            <p className="text-[9px] font-mono uppercase tracking-wider text-white/25 mt-0.5">
              Complete transaction history
            </p>
          </div>
          <span className="text-[10px] font-mono text-white/40 border border-white/10 rounded-md px-2.5 py-1">
            Showing {Math.min(ledger.length, 50)} of {current.length} Orders
          </span>
        </div>
        {ledger.length === 0 ? (
          <p className="mt-4 text-sm text-white/40">No orders in this range.</p>
        ) : (
          <div className="mt-3 overflow-x-auto -mx-1 px-1">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead>
                <tr className="text-[8px] uppercase tracking-[0.2em] text-white/35 border-b border-white/10">
                  <th className="py-2 pr-3">Token / ID</th>
                  <th className="py-2 pr-3">Date & Time</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Table / Type</th>
                  <th className="py-2 pr-3">Customer</th>
                  <th className="py-2 pr-3">Ordered Items</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ledger.map((o, i) => {
                  const itemsArr = Array.isArray(o.items) ? (o.items as any[]) : [];
                  const label = String(o.status ?? 'pending');
                  const t = orderEpoch(o);
                  return (
                    <tr key={String(o.id ?? o.token ?? i)} className="hover:bg-white/[0.02] align-top">
                      <td className="py-2.5 pr-3">
                        <p className="font-mono font-bold text-white">#{String(o.token ?? '—')}</p>
                        <p className="font-mono text-[9px] text-white/30 truncate max-w-24">
                          {String(o.id ?? '').slice(0, 8)}
                        </p>
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">
                        <p className="text-white/80">{t !== null ? formatShortDate(t) : '—'}</p>
                        <p className="font-mono text-[10px] text-white/40">{t !== null ? formatTime(t) : ''}</p>
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className={cn('px-2 py-0.5 rounded border text-[8px] font-bold uppercase tracking-wider whitespace-nowrap', statusBadge(o.status))}>
                          {label}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 font-mono text-primary/90 whitespace-nowrap">
                        {o.table_id ? `Table ${String(o.table_id)}` : channelOf(o)}
                      </td>
                      <td className="py-2.5 pr-3">
                        <p className="text-white/85">{o.customer_name || 'Guest'}</p>
                        {o.customer_phone && (
                          <p className="font-mono text-[10px] text-white/35">{String(o.customer_phone)}</p>
                        )}
                      </td>
                      <td className="py-2.5 pr-3">
                        <div className="flex flex-wrap gap-1 max-w-56">
                          {itemsArr.slice(0, 2).map((it: any, j: number) => (
                            <span key={j} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-white/60 whitespace-nowrap">
                              {Number(it?.quantity) || 0}× {String(it?.name ?? 'Item')}
                            </span>
                          ))}
                          {itemsArr.length > 2 && (
                            <span className="text-[10px] text-white/35">+{itemsArr.length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-primary whitespace-nowrap">
                        Rs. {(Number(o.total) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  delta,
  sub,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  delta?: number | null;
  sub?: string;
}) {
  const positive = delta !== null && delta !== undefined && delta > 0;
  const negative = delta !== null && delta !== undefined && delta < 0;
  const DeltaIcon = positive ? TrendingUp : negative ? TrendingDown : Minus;
  return (
    <div className="rounded-xl border border-primary/20 bg-[#0B0B0D] p-4">
      <div className="flex items-center gap-1.5 text-white/40">{icon}</div>
      <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.25em] text-white/40">{label}</p>
      <p className="mt-1.5 font-mono font-bold text-primary text-lg leading-tight truncate" title={value}>
        {value}
      </p>
      <p className="mt-1 text-[10px] font-mono text-white/35">
        {sub ?? (
          <>
            <DeltaIcon size={10} className="inline mr-1 -mt-0.5" />
            {formatDelta(delta ?? null)} vs prev
          </>
        )}
      </p>
    </div>
  );
}
