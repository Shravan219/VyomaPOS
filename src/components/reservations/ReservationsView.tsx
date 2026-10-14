import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Armchair,
  BellRing,
  CalendarClock,
  CheckCircle2,
  Loader2,
  Phone,
  Plus,
  Search,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { supabase } from '@/src/lib/supabase';
import type { Order, Reservation, TableSection } from '@/src/types';
import {
  FLOOR_STATUS_META,
  activeReservationForTable,
  buildConfirmationMessage,
  deriveFloorStatus,
  isSameDay,
  normalizeTableNumber,
  orderForTable,
  triggerReservationNotification,
} from '@/src/lib/reservations';
import { FloorPlanGrid } from './FloorPlanGrid';
import { ReservationModal } from './ReservationModal';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ReservationsViewProps {
  orders: Order[];
  /** Called after Seat Guest so the parent can link the party to a billing session. */
  onSeatGuest?: (reservation: Reservation) => void;
}

const HOURS = Array.from({ length: 12 }, (_, i) => 12 + i); // 12:00 → 23:00

export function ReservationsView({ orders, onSeatGuest }: ReservationsViewProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState<TableSection | 'All'>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [prefillTable, setPrefillTable] = useState<string | undefined>(undefined);
  const [detailTable, setDetailTable] = useState<string | null>(null);
  const [acting, setActing] = useState(false);

  const fetchReservations = useCallback(async () => {
    try {
      const res = await fetch('/api/reservations');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.reservations)) {
          setReservations(json.reservations);
          setLoading(false);
          return;
        }
      }
      throw new Error('API unavailable');
    } catch {
      try {
        const { data, error } = await supabase
          .from('reservations')
          .select('*')
          .order('reservation_time', { ascending: true });
        if (!error && data) setReservations(data as Reservation[]);
      } catch (e) {
        console.warn('[Reservations] fetch fallback notice:', e);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchReservations();

    // Layer 1 — Supabase realtime (instant cashier ↔ captain sync)
    const channel = supabase
      .channel('reservations-realtime')
      .on('postgres_changes', { event: '*', table: 'reservations', schema: 'public' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const row = payload.new as Reservation;
          setReservations((prev) => (prev.some((r) => r.id === row.id) ? prev : [...prev, row]));
          toast.success(`New booking: ${row.guest_name} • ${normalizeTableNumber(row.table_number)}`);
        } else if (payload.eventType === 'UPDATE') {
          const row = payload.new as Reservation;
          setReservations((prev) => prev.map((r) => (r.id === row.id ? row : r)));
        } else if (payload.eventType === 'DELETE') {
          setReservations((prev) => prev.filter((r) => r.id !== (payload.old as any).id));
        }
      })
      .subscribe();

    // Layer 2 — polling safety net (5s, skipped when backgrounded)
    const poll = setInterval(async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      try {
        const res = await fetch('/api/reservations');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.reservations)) setReservations(json.reservations);
        }
      } catch {
        /* silent */
      }
    }, 5000);

    // Layer 3 — instant refetch when tab regains focus
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchReservations();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(poll);
      document.removeEventListener('visibilitychange', onVisible);
      supabase.removeChannel(channel);
    };
  }, [fetchReservations]);

  const dayReservations = useMemo(() => {
    return reservations
      .filter((r) => isSameDay(r.reservation_time, selectedDate))
      .sort((a, b) => new Date(a.reservation_time).getTime() - new Date(b.reservation_time).getTime());
  }, [reservations, selectedDate]);

  const queue = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = dayReservations.filter((r) => r.status === 'booked' || r.status === 'seated');
    if (!q) return base;
    return base.filter(
      (r) =>
        r.guest_name.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        normalizeTableNumber(r.table_number).toLowerCase().includes(q),
    );
  }, [dayReservations, search]);

  const stats = useMemo(() => {
    const active = dayReservations.filter((r) => r.status === 'booked' || r.status === 'seated');
    return {
      total: dayReservations.length,
      booked: dayReservations.filter((r) => r.status === 'booked').length,
      seated: dayReservations.filter((r) => r.status === 'seated').length,
      pax: active.reduce((acc, r) => acc + (Number(r.party_size) || 0), 0),
    };
  }, [dayReservations]);

  const patchStatus = async (id: string, status: Reservation['status'], extra?: Record<string, unknown>) => {
    setActing(true);
    // Optimistic update
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status, ...extra } : r)));
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...extra }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.message || 'Update failed');
      setReservations((prev) => prev.map((r) => (r.id === id ? (json.reservation as Reservation) : r)));
      return json.reservation as Reservation;
    } catch (err: any) {
      console.warn('[Reservations] status update notice:', err?.message);
      toast.warning('Server unreachable — change kept locally', { description: String(err?.message || err) });
      return reservations.find((r) => r.id === id);
    } finally {
      setActing(false);
    }
  };

  const handleSeatGuest = async (r: Reservation) => {
    const updated = await patchStatus(r.id, 'seated');
    if (!updated) return;
    toast.success(`${r.guest_name} seated at ${normalizeTableNumber(r.table_number)}`, {
      description: 'Table is now Occupied. Link the party to a billing session.',
    });
    onSeatGuest?.(updated);
  };

  const handleNotify = async (r: Reservation) => {
    const result = await triggerReservationNotification({
      to: r.phone,
      guestName: r.guest_name,
      tableNumber: r.table_number,
      reservationTime: r.reservation_time,
      channel: 'whatsapp',
    });
    if (result.ok) toast.success('Booking confirmation sent');
    else toast.info(result.message);
  };

  const detailReservation = detailTable ? activeReservationForTable(detailTable, reservations) : undefined;
  const detailOrder = detailTable ? orderForTable(detailTable, orders) : undefined;
  const detailStatus = detailTable ? deriveFloorStatus(detailTable, reservations, orders) : 'available';

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 md:p-8 h-full overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 border border-primary/25 text-primary shadow-[0_0_20px_rgba(197,160,89,0.15)] shrink-0">
            <Armchair size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">Reservations</h2>
              <span className="flex items-center gap-1 rounded-full bg-primary/10 border border-primary/30 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-primary font-mono">
                {stats.total} today • {stats.pax} pax
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 mt-0.5 font-bold">
              Floor plan • Daily timeline • Booking queue
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Input
            type="date"
            value={selectedDate.toISOString().slice(0, 10)}
            onChange={(e) => setSelectedDate(new Date(`${e.target.value}T00:00:00`))}
            className="bg-[#0D0E15] border-white/10 rounded-xl h-11 w-auto text-xs font-mono text-white focus-visible:border-primary/40 [color-scheme:dark]"
            aria-label="Select day"
          />
          <Button
            onClick={() => {
              setPrefillTable(undefined);
              setModalOpen(true);
            }}
            className="rounded-xl bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-[0.2em] text-[11px] min-h-[44px] shadow-[0_0_20px_rgba(197,160,89,0.25)]"
          >
            <Plus size={15} /> New Booking
          </Button>
        </div>
      </div>

      {/* Section filter + search */}
      <div className="flex flex-wrap items-center gap-2">
        {(['All', 'Indoor', 'Rooftop', 'Lounge'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSectionFilter(s)}
            className={cn(
              'rounded-xl px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 min-h-[36px]',
              sectionFilter === s
                ? 'bg-primary text-black shadow-[0_0_15px_rgba(197,160,89,0.25)]'
                : 'bg-[#0E0F16] border border-white/10 text-white/70 hover:text-white',
            )}
          >
            {s}
          </button>
        ))}
        <div className="relative ml-auto w-full sm:w-64">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/70 pointer-events-none" />
          <Input
            placeholder="Search guest, phone, table…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#0D0E15] border-white/10 rounded-xl h-10 text-xs text-white placeholder:text-white/35 focus-visible:border-primary/40"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-white/50">
          <Loader2 size={28} className="animate-spin text-primary/60" />
          <p className="text-xs uppercase tracking-[0.2em] font-bold">Loading floor plan…</p>
        </div>
      ) : (
        <div className="grid xl:grid-cols-[1fr_360px] gap-5 items-start">
          {/* Floor plan */}
          <div className="rounded-2xl border border-white/10 bg-[#0D0E15] p-4 sm:p-5 shadow-2xl">
            <FloorPlanGrid
              reservations={reservations}
              orders={orders}
              sectionFilter={sectionFilter}
              onTableClick={(t) => setDetailTable(t)}
            />
          </div>

          {/* Booking queue */}
          <div className="rounded-2xl border border-white/10 bg-[#0D0E15] p-4 sm:p-5 shadow-2xl flex flex-col gap-3 xl:sticky xl:top-0 max-h-[80vh]">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70 flex items-center gap-2">
                <BellRing size={13} className="text-primary" /> Incoming Queue
              </h3>
              <Badge className="bg-primary/10 border border-primary/30 text-primary font-mono">{queue.length}</Badge>
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-0.5 min-h-[120px]">
              <AnimatePresence mode="popLayout">
                {queue.map((r) => (
                  <motion.div
                    key={r.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-xl border border-white/10 bg-black/40 p-3 flex items-center gap-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary font-mono font-bold text-xs shrink-0">
                      {normalizeTableNumber(r.table_number).replace('T-', '')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{r.guest_name}</p>
                      <p className="text-[11px] font-mono text-white/50 truncate">
                        {new Date(r.reservation_time).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })} •{' '}
                        {r.party_size}pax • {r.phone}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSeatGuest(r)}
                      disabled={acting || r.status === 'seated'}
                      className="rounded-lg bg-primary text-black hover:bg-primary/90 text-[10px] font-extrabold uppercase tracking-wider min-h-[36px] shrink-0"
                    >
                      {r.status === 'seated' ? 'Seated' : 'Seat Guest'}
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {queue.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                  <CalendarClock size={28} className="text-primary/40" />
                  <p className="text-sm font-serif font-bold text-white">No bookings in queue</p>
                  <p className="text-[11px] text-white/45">New reservations for this day will land here instantly.</p>
                </div>
              )}
            </div>

            {/* Daily timeline */}
            <div className="border-t border-white/10 pt-3">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70 mb-2">Daily Timeline</h3>
              <div className="flex flex-col gap-1 max-h-56 overflow-y-auto custom-scrollbar pr-0.5">
                {HOURS.map((h) => {
                  const slot = dayReservations.filter((r) => new Date(r.reservation_time).getHours() === h);
                  const label = h === 12 ? '12 PM' : h < 12 ? `${h} AM` : `${h - 12} PM`;
                  return (
                    <div key={h} className="flex items-start gap-2.5 min-h-[28px]">
                      <span className="w-14 shrink-0 text-[10px] font-mono text-white/40 pt-1">{label}</span>
                      <div className="flex-1 flex flex-wrap gap-1.5 pb-1">
                        {slot.length === 0 ? (
                          <span className="h-px flex-1 bg-white/5 mt-3" />
                        ) : (
                          slot.map((r) => (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => setDetailTable(normalizeTableNumber(r.table_number))}
                              title={`${r.guest_name} • ${r.party_size}pax • ${r.notes || 'no notes'}`}
                              className={cn(
                                'px-2 py-1 rounded-lg border text-[10px] font-bold font-mono transition-all cursor-pointer active:scale-95',
                                r.status === 'booked' && 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20',
                                r.status === 'seated' && 'bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20',
                                r.status === 'completed' && 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
                                r.status === 'cancelled' && 'bg-white/5 border-white/10 text-white/35 line-through',
                              )}
                            >
                              {normalizeTableNumber(r.table_number)} • {r.guest_name.split(' ')[0]}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New booking modal */}
      <ReservationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        existing={reservations}
        initialTable={prefillTable}
        onCreated={(r) => {
          setReservations((prev) => (prev.some((x) => x.id === r.id) ? prev : [...prev, r]));
          handleNotify(r);
        }}
      />

      {/* Table detail sheet */}
      <Dialog open={!!detailTable} onOpenChange={(o) => !o && setDetailTable(null)}>
        <DialogContent className="bg-[#0A0A0A] border-white/10 text-white sm:max-w-[440px] rounded-[1.5rem] p-5 sm:p-7">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif tracking-tight">
              Table <span className="italic text-primary">{detailTable?.replace('T-', '')}</span>
            </DialogTitle>
            <DialogDescription className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold mt-1">
              Guest • Reservation • Order status
            </DialogDescription>
          </DialogHeader>
          {detailTable && (
            <div className="flex flex-col gap-4 py-3">
              <span
                className={cn(
                  'self-start px-3 py-1 rounded-full border text-[10px] font-extrabold uppercase tracking-widest',
                  FLOOR_STATUS_META[detailStatus].pill,
                )}
              >
                {FLOOR_STATUS_META[detailStatus].label}
              </span>

              {detailReservation ? (
                <div className="rounded-xl border border-white/10 bg-black/40 p-4 flex flex-col gap-2">
                  <p className="text-lg font-serif font-bold text-white">{detailReservation.guest_name}</p>
                  <p className="text-xs font-mono text-white/60 flex items-center gap-1.5">
                    <Phone size={12} className="text-primary" /> {detailReservation.phone}
                  </p>
                  <p className="text-xs text-white/70 flex items-center gap-1.5">
                    <Users size={12} className="text-primary" /> {detailReservation.party_size} guests •{' '}
                    {new Date(detailReservation.reservation_time).toLocaleString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                  {detailReservation.notes && (
                    <p className="text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                      “{detailReservation.notes}”
                    </p>
                  )}
                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                    Booking {detailReservation.status} • created{' '}
                    {new Date(detailReservation.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-white/50">No active reservation on this table — tap below to book it.</p>
              )}

              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-1.5">Current order status</p>
                {detailOrder ? (
                  <p className="text-sm text-white">
                    <span className="font-mono font-bold text-primary">#{detailOrder.token}</span> • {detailOrder.status} • ₹
                    {Number(detailOrder.total || 0).toFixed(2)} • {detailOrder.items?.length || 0} items
                  </p>
                ) : (
                  <p className="text-xs text-white/45">No live order linked to this table.</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {detailReservation && (detailReservation.status === 'booked' || detailReservation.status === 'seated') ? (
                  <>
                    {detailReservation.status === 'booked' && (
                      <Button
                        onClick={() => {
                          handleSeatGuest(detailReservation);
                        }}
                        disabled={acting}
                        className="flex-1 rounded-xl bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-[0.15em] text-[11px] min-h-[44px]"
                      >
                        <CheckCircle2 size={15} /> Seat Guest
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => patchStatus(detailReservation.id, 'completed')}
                      disabled={acting}
                      className="rounded-xl border-white/15 text-white min-h-[44px]"
                    >
                      Complete
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => patchStatus(detailReservation.id, 'cancelled')}
                      disabled={acting}
                      className="rounded-xl border-red-500/30 text-red-300 hover:bg-red-500/10 min-h-[44px]"
                    >
                      <XCircle size={15} /> Cancel
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleNotify(detailReservation)}
                      className="rounded-xl border-white/15 text-white min-h-[44px]"
                      title="Resend booking confirmation"
                    >
                      <BellRing size={15} />
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => {
                      setPrefillTable(detailTable);
                      setDetailTable(null);
                      setModalOpen(true);
                    }}
                    className="flex-1 rounded-xl bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-[0.15em] text-[11px] min-h-[44px]"
                  >
                    <Plus size={15} /> Book this table
                  </Button>
                )}
              </div>

              {detailReservation && (
                <p className="text-[10px] font-mono text-white/30 break-all">
                  {buildConfirmationMessage(detailReservation).split('\n')[0]}
                </p>
              )}
              <button
                type="button"
                onClick={() => setDetailTable(null)}
                className="self-center flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <X size={12} /> Close
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
