import * as React from 'react';
import { useMemo, useState } from 'react';
import { CalendarClock, Users, Phone, User, Armchair, StickyNote, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { CreateReservationInput, Reservation } from '@/src/types';
import {
  DEFAULT_TURN_TIME_MINUTES,
  FLOOR_TABLES,
  findReservationConflict,
  normalizeTableNumber,
  toInputDateTimeValue,
  validateReservationInput,
} from '@/src/lib/reservations';
import { cn } from '@/lib/utils';

interface ReservationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existing: Reservation[];
  initialTable?: string;
  onCreated: (reservation: Reservation) => void;
}

const QUICK_NOTES = ['Anniversary', 'Birthday', 'High chair', 'Rooftop preferred', 'Window seat', 'Quiet corner'];

export function ReservationModal({ open, onOpenChange, existing, initialTable, onCreated }: ReservationModalProps) {
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [dateTime, setDateTime] = useState(() => toInputDateTimeValue(new Date(Date.now() + 60 * 60 * 1000)));
  const [tableNumber, setTableNumber] = useState(initialTable || 'T-01');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (open) {
      setErrors({});
      setSaving(false);
      if (initialTable) setTableNumber(normalizeTableNumber(initialTable));
    }
  }, [open, initialTable]);

  const conflictPreview = useMemo(() => {
    if (!tableNumber || !dateTime) return null;
    const check = findReservationConflict(
      { table_number: tableNumber, reservation_time: new Date(dateTime).toISOString() },
      existing,
      DEFAULT_TURN_TIME_MINUTES,
    );
    return check.conflict ? check.conflictingReservation : null;
  }, [tableNumber, dateTime, existing]);

  const reset = () => {
    setGuestName('');
    setPhone('');
    setPartySize('2');
    setDateTime(toInputDateTimeValue(new Date(Date.now() + 60 * 60 * 1000)));
    setTableNumber('T-01');
    setNotes('');
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input: CreateReservationInput = {
      guest_name: guestName.trim(),
      phone: phone.trim(),
      party_size: Number(partySize),
      reservation_time: new Date(dateTime).toISOString(),
      table_number: normalizeTableNumber(tableNumber),
      notes: notes.trim() || undefined,
    };
    const validation = validateReservationInput(input);
    if (!validation.ok) {
      setErrors(validation.errors);
      toast.error('Please fix the highlighted fields');
      return;
    }
    const clash = findReservationConflict(input, existing, DEFAULT_TURN_TIME_MINUTES);
    if (clash.conflict) {
      setErrors({ table_number: `Table ${input.table_number} is already booked near this slot (2-hr turn time).` });
      toast.error('Double-booking blocked', {
        description: `${clash.conflictingReservation?.guest_name} • ${clash.conflictingReservation ? new Date(clash.conflictingReservation.reservation_time).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : ''}`,
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.message || `Booking failed (HTTP ${res.status})`);
      }
      toast.success(`Table ${input.table_number} reserved for ${input.guest_name}`, {
        description: 'Confirmation queued via WhatsApp/SMS.',
      });
      onCreated(json.reservation as Reservation);
      reset();
      onOpenChange(false);
    } catch (err: any) {
      // Offline / server-down fallback: still surface the booking locally so
      // cashier flow never blocks; it syncs when Supabase is reachable.
      console.warn('[Reservations] Server create failed, queuing locally:', err?.message);
      toast.warning('Server unreachable — booking queued locally', { description: String(err?.message || err) });
      onCreated({
        id: `local_${Date.now()}`,
        guest_name: input.guest_name,
        phone: input.phone,
        party_size: input.party_size,
        reservation_time: input.reservation_time,
        table_number: input.table_number,
        status: 'booked',
        notes: input.notes || null,
        created_at: new Date().toISOString(),
      });
      reset();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0A0A0A] border-white/10 text-white sm:max-w-[560px] rounded-[1.5rem] p-5 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] max-h-[92vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-3xl font-serif tracking-tight text-white">
            New <span className="italic text-primary opacity-80">Reservation</span>
          </DialogTitle>
          <DialogDescription className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold mt-2">
            2-hour turn time enforced per table
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="grid gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60 flex items-center gap-1.5">
                <User size={12} className="text-primary" /> Guest Name
              </span>
              <Input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="bg-black/60 border-white/10 rounded-xl h-11 text-sm text-white placeholder:text-white/30 focus-visible:border-primary/40"
              />
              {errors.guest_name && <span className="text-[11px] text-red-400">{errors.guest_name}</span>}
            </label>
            <label className="grid gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60 flex items-center gap-1.5">
                <Phone size={12} className="text-primary" /> Phone Number
              </span>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98765 43210"
                inputMode="tel"
                className="bg-black/60 border-white/10 rounded-xl h-11 text-sm font-mono text-white placeholder:text-white/30 focus-visible:border-primary/40"
              />
              {errors.phone && <span className="text-[11px] text-red-400">{errors.phone}</span>}
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="grid gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60 flex items-center gap-1.5">
                <Users size={12} className="text-primary" /> Party Size
              </span>
              <Input
                type="number"
                min={1}
                max={40}
                value={partySize}
                onChange={(e) => setPartySize(e.target.value)}
                className="bg-black/60 border-white/10 rounded-xl h-11 text-sm font-mono text-white focus-visible:border-primary/40"
              />
              {errors.party_size && <span className="text-[11px] text-red-400">{errors.party_size}</span>}
            </label>
            <label className="grid gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60 flex items-center gap-1.5">
                <CalendarClock size={12} className="text-primary" /> Date &amp; Time
              </span>
              <Input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="bg-black/60 border-white/10 rounded-xl h-11 text-sm text-white focus-visible:border-primary/40 [color-scheme:dark]"
              />
              {errors.reservation_time && <span className="text-[11px] text-red-400">{errors.reservation_time}</span>}
            </label>
          </div>

          <div className="grid gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60 flex items-center gap-1.5">
              <Armchair size={12} className="text-primary" /> Assigned Table
            </span>
            <div className="grid grid-cols-5 gap-2">
              {FLOOR_TABLES.map((t) => {
                const active = normalizeTableNumber(tableNumber) === t.table_number;
                return (
                  <button
                    key={t.table_number}
                    type="button"
                    onClick={() => setTableNumber(t.table_number)}
                    title={`${t.table_number} • ${t.section} • seats ${t.capacity}`}
                    className={cn(
                      'h-11 rounded-xl border text-[11px] font-mono font-bold transition-all cursor-pointer active:scale-95',
                      active
                        ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(197,160,89,0.35)]'
                        : 'bg-white/5 border-white/10 text-white/70 hover:border-primary/40 hover:text-white',
                    )}
                  >
                    {t.table_number.replace('T-', '')}
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-white/40 font-mono">
              {tableNumber} • {FLOOR_TABLES.find((t) => t.table_number === normalizeTableNumber(tableNumber))?.section || ''} •{' '}
              {conflictPreview ? (
                <span className="text-amber-400 font-bold">⚠ overlaps an existing booking</span>
              ) : (
                <span className="text-emerald-400">slot looks free</span>
              )}
            </span>
            {errors.table_number && <span className="text-[11px] text-red-400">{errors.table_number}</span>}
          </div>

          <label className="grid gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60 flex items-center gap-1.5">
              <StickyNote size={12} className="text-primary" /> Special Requests / Notes
            </span>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anniversary, high chair, rooftop preferred…"
              className="bg-black/60 border-white/10 rounded-xl h-11 text-sm text-white placeholder:text-white/30 focus-visible:border-primary/40"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {QUICK_NOTES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setNotes((prev) => (prev ? `${prev}, ${q}` : q))}
                className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-white/60 hover:text-primary hover:border-primary/40 transition-all cursor-pointer active:scale-95"
              >
                + {q}
              </button>
            ))}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-white/15 text-white hover:text-white min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-[0.2em] text-[11px] min-h-[44px] shadow-[0_0_20px_rgba(197,160,89,0.25)]"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : 'Confirm Booking'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
