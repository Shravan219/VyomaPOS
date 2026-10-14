import { useMemo } from 'react';
import { Users } from 'lucide-react';
import type { Order, Reservation, TableSection } from '@/src/types';
import {
  FLOOR_STATUS_META,
  FLOOR_TABLES,
  activeReservationForTable,
  deriveFloorStatus,
  normalizeTableNumber,
  orderForTable,
  type FloorTableStatus,
} from '@/src/lib/reservations';
import { cn } from '@/lib/utils';

interface FloorPlanGridProps {
  reservations: Reservation[];
  orders: Order[];
  sectionFilter: TableSection | 'All';
  onTableClick: (tableNumber: string) => void;
}

const SECTIONS: TableSection[] = ['Indoor', 'Rooftop', 'Lounge'];

export function FloorPlanGrid({ reservations, orders, sectionFilter, onTableClick }: FloorPlanGridProps) {
  const tables = useMemo(() => {
    return FLOOR_TABLES.filter((t) => sectionFilter === 'All' || t.section === sectionFilter).map((t) => {
      const status: FloorTableStatus = deriveFloorStatus(t.table_number, reservations, orders);
      return {
        ...t,
        status,
        reservation: activeReservationForTable(t.table_number, reservations),
        order: orderForTable(t.table_number, orders),
      };
    });
  }, [reservations, orders, sectionFilter]);

  return (
    <div className="flex flex-col gap-5">
      {(sectionFilter === 'All' ? SECTIONS : [sectionFilter]).map((section) => {
        const sectionTables = tables.filter((t) => t.section === section);
        if (sectionTables.length === 0) return null;
        return (
          <section key={section} aria-label={`${section} tables`}>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(197,160,89,0.6)]" />
              <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/70">
                {section} <span className="text-white/30 font-mono">({sectionTables.length})</span>
              </h3>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {sectionTables.map((t) => {
                const meta = FLOOR_STATUS_META[t.status];
                return (
                  <button
                    key={t.table_number}
                    type="button"
                    onClick={() => onTableClick(t.table_number)}
                    className={cn(
                      'glass-card rounded-2xl p-3.5 text-left border transition-all cursor-pointer active:scale-95 min-h-[118px] flex flex-col justify-between group',
                      meta.ring,
                    )}
                    aria-label={`${t.table_number}, ${meta.label}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-serif text-lg font-bold text-white leading-none">{t.table_number}</span>
                      <span className={cn('h-2.5 w-2.5 rounded-full shrink-0 mt-1', meta.dot)} />
                    </div>
                    <div className="flex flex-col gap-1.5 mt-2">
                      <span
                        className={cn(
                          'self-start px-2 py-0.5 rounded-full border text-[9px] font-extrabold uppercase tracking-widest',
                          meta.pill,
                        )}
                      >
                        {meta.label}
                      </span>
                      {t.reservation ? (
                        <span className="text-[11px] font-semibold text-white/85 truncate">
                          {t.reservation.guest_name} • {t.reservation.party_size}pax
                        </span>
                      ) : t.order ? (
                        <span className="text-[11px] font-mono text-white/60 truncate">
                          #{t.order.token} • ₹{Number(t.order.total || 0).toFixed(0)}
                        </span>
                      ) : (
                        <span className="text-[11px] text-white/35 flex items-center gap-1">
                          <Users size={11} /> seats {t.capacity}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-white/35">
                        {t.reservation
                          ? new Date(t.reservation.reservation_time).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
                          : `T-${t.table_number.slice(2)} • ${normalizeTableNumber(t.table_number)}`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {(Object.keys(FLOOR_STATUS_META) as FloorTableStatus[]).map((key) => (
          <span
            key={key}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-extrabold uppercase tracking-widest',
              FLOOR_STATUS_META[key].pill,
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', FLOOR_STATUS_META[key].dot)} />
            {FLOOR_STATUS_META[key].label}
          </span>
        ))}
      </div>
    </div>
  );
}
