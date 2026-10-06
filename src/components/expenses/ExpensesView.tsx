import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { AddExpenseModal, EXPENSE_CATEGORIES, type Expense } from './AddExpenseModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Receipt,
  RefreshCcw,
  Search,
  Trash2,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return iso;
  }
}

type RangeKey = 'today' | '7d' | '30d' | 'all';

const RANGE_DAYS: Record<RangeKey, number | null> = {
  today: 1,
  '7d': 7,
  '30d': 30,
  all: null,
};

export function ExpensesView() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [range, setRange] = useState<RangeKey>('30d');
  const [addOpen, setAddOpen] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [editNotes, setEditNotes] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const fetchExpenses = React.useCallback(async () => {
    setLoading(true);
    setTableMissing(false);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) {
        // PGRST205 / 42P01 => table not created yet
        if (error.code === 'PGRST205' || error.code === '42P01' || /expenses/i.test(error.message)) {
          setTableMissing(true);
          setExpenses([]);
        } else {
          throw new Error(error.message);
        }
      } else {
        setExpenses((data ?? []) as Expense[]);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
    const channel = supabase
      .channel('expenses-realtime')
      .on('postgres_changes', { event: '*', table: 'expenses', schema: 'public' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const row = payload.new as Expense;
          setExpenses((prev) => (prev.some((e) => e.id === row.id) ? prev : [row, ...prev]));
        } else if (payload.eventType === 'UPDATE') {
          const row = payload.new as Expense;
          setExpenses((prev) => prev.map((e) => (e.id === row.id ? row : e)));
        } else if (payload.eventType === 'DELETE') {
          const old = payload.old as { id: string };
          setExpenses((prev) => prev.filter((e) => e.id !== old.id));
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchExpenses]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    expenses.forEach((e) => e.category && set.add(e.category));
    return ['all', ...Array.from(set)];
  }, [expenses]);

  const filtered = useMemo(() => {
    const now = Date.now();
    const days = RANGE_DAYS[range];
    const q = search.trim().toLowerCase();
    return expenses.filter((e) => {
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      if (days !== null) {
        const t = new Date(e.created_at).getTime();
        if (Number.isNaN(t) || now - t > days * 24 * 60 * 60 * 1000) return false;
      }
      if (q && !`${e.notes ?? ''} ${e.category} ${e.amount}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [expenses, search, categoryFilter, range]);

  const stats = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    let today = 0;
    let week = 0;
    let month = 0;
    for (const e of expenses) {
      const amt = Number(e.amount) || 0;
      const t = new Date(e.created_at).getTime();
      if (Number.isNaN(t)) continue;
      const age = now - t;
      if (age <= day) today += amt;
      if (age <= 7 * day) week += amt;
      if (age <= 30 * day) month += amt;
    }
    return { today, week, month, count: expenses.length };
  }, [expenses]);

  const openEdit = (expense: Expense) => {
    setEditing(expense);
    setEditAmount(String(expense.amount));
    setEditCategory(expense.category);
    setEditNotes(expense.notes ?? '');
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    const parsed = parseFloat(editAmount);
    if (isNaN(parsed) || parsed < 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setIsSavingEdit(true);
    const prev = expenses;
    setExpenses((list) =>
      list.map((e) =>
        e.id === editing.id
          ? { ...e, amount: parsed, category: editCategory, notes: editNotes.trim() || null }
          : e,
      ),
    );
    try {
      const { error } = await supabase
        .from('expenses')
        .update({ amount: parsed, category: editCategory, notes: editNotes.trim() || null })
        .eq('id', editing.id);
      if (error) throw new Error(error.message);
      toast.success('Expense updated');
      setEditing(null);
    } catch (err) {
      setExpenses(prev);
      toast.error(err instanceof Error ? err.message : 'Failed to update expense');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    const prev = expenses;
    setExpenses((list) => list.filter((e) => e.id !== id));
    setConfirmingId(null);
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw new Error(error.message);
      toast.success('Expense deleted');
    } catch (err) {
      setExpenses(prev);
      toast.error(err instanceof Error ? err.message : 'Failed to delete expense');
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 border border-primary/25 text-primary shadow-[0_0_20px_rgba(197,160,89,0.15)] shrink-0">
            <Wallet size={20} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">Expenses</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 mt-0.5 font-bold">
              Outlet spend ledger · auto-syncs to Google Sheets
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/70 pointer-events-none" />
            <Input
              placeholder="Search vendor, category..."
              className="pl-11 bg-[#0D0E15] border-white/10 rounded-2xl h-11 text-xs font-semibold tracking-wider focus-visible:ring-primary/20 focus-visible:border-primary/40 transition-all text-white placeholder:text-white/40 shadow-inner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchExpenses}
            disabled={loading}
            className="rounded-2xl h-11 border-white/10"
          >
            <RefreshCcw size={14} className={cn(loading && 'animate-spin')} />
            Refresh
          </Button>
          <Button type="button" onClick={() => setAddOpen(true)} className="rounded-2xl h-11">
            <Plus size={16} /> Add Expense
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Today', value: stats.today },
          { label: 'Last 7 days', value: stats.week },
          { label: 'Last 30 days', value: stats.month },
          { label: 'Records', value: null as number | null, text: String(stats.count) },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-white/10 bg-[#0E0F16] px-4 py-3.5 shadow-[0_0_25px_rgba(0,0,0,0.35)]"
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/50">{s.label}</p>
            <p className="mt-1 font-mono text-lg sm:text-xl font-bold text-primary">
              {s.value !== null && s.value !== undefined ? inr.format(s.value) : s.text}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 shrink-0">
          {(['today', '7d', '30d', 'all'] as RangeKey[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={cn(
                'rounded-xl px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0',
                range === r
                  ? 'bg-primary text-black shadow-[0_0_15px_rgba(197,160,89,0.25)] font-extrabold'
                  : 'bg-[#0E0F16] border border-white/10 text-white/80 hover:bg-white/10 hover:text-white',
              )}
            >
              {r === 'today' ? 'Today' : r === 'all' ? 'All time' : `Last ${r}`}
            </button>
          ))}
          <span className="mx-1 h-5 w-px bg-white/10 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                'rounded-xl px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0',
                categoryFilter === cat
                  ? 'bg-primary text-black shadow-[0_0_15px_rgba(197,160,89,0.25)] font-extrabold'
                  : 'bg-[#0E0F16] border border-white/10 text-white/80 hover:bg-white/10 hover:text-white',
              )}
            >
              <span className="capitalize">{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-white/60">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Loading expenses…</span>
          </div>
        ) : tableMissing ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 text-center">
            <Receipt className="mx-auto h-8 w-8 text-amber-400" />
            <h3 className="mt-3 font-serif text-lg font-bold text-white">Expenses table not found</h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-white/60">
              Run <span className="font-mono text-amber-300">supabase/migrations/20261005_create_expenses_and_receipts.sql</span> in
              the Supabase SQL Editor, then press Refresh.
            </p>
            <Button type="button" onClick={fetchExpenses} className="mt-4">
              <RefreshCcw size={14} /> Retry
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0E0F16] p-10 text-center">
            <Wallet className="mx-auto h-8 w-8 text-white/25" />
            <h3 className="mt-3 font-serif text-lg font-bold text-white">No expenses found</h3>
            <p className="mt-1 text-xs text-white/50">
              {expenses.length === 0 ? 'Record your first outlet expense to start the ledger.' : 'Try clearing search or filters.'}
            </p>
            {expenses.length === 0 && (
              <Button type="button" onClick={() => setAddOpen(true)} className="mt-4">
                <Plus size={16} /> Add Expense
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 pb-10">
            {filtered.map((e) => (
              <div
                key={e.id}
                className="rounded-2xl border border-white/10 bg-[#0E0F16] p-4 flex gap-3.5 hover:border-primary/40 transition-all"
              >
                {e.receipt_url ? (
                  <a
                    href={e.receipt_url}
                    target="_blank"
                    rel="noreferrer"
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 group"
                    title="Open receipt"
                  >
                    <img src={e.receipt_url} alt="Receipt" className="h-full w-full object-cover" loading="lazy" />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink size={16} className="text-white" />
                    </span>
                  </a>
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-white/15 bg-black/40">
                    <Receipt size={20} className="text-white/25" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-mono text-base font-bold text-primary">{inr.format(Number(e.amount) || 0)}</p>
                    <span className="shrink-0 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                      {e.category}
                    </span>
                  </div>
                  {e.notes && <p className="mt-1 truncate text-xs text-white/80">{e.notes}</p>}
                  <p className="mt-1 font-mono text-[10px] text-white/40">{formatDateTime(e.created_at)}</p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(e)}
                      className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    {confirmingId === e.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleDelete(e.id)}
                          className="rounded-lg bg-red-500/20 border border-red-500/40 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-300 hover:bg-red-500/30 transition-all cursor-pointer"
                        >
                          Confirm delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingId(null)}
                          className="rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/50 hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmingId(e.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/50 hover:text-red-300 hover:border-red-500/40 hover:bg-red-500/10 transition-all cursor-pointer"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddExpenseModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onExpenseAdded={(row) =>
          setExpenses((prev) => (prev.some((e) => e.id === row.id) ? prev : [row, ...prev]))
        }
      />

      {/* Edit dialog */}
      <Dialog open={editing !== null} onOpenChange={(next) => !next && !isSavingEdit && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>Changes sync to Supabase. Sheets rows are append-only and keep history.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <label htmlFor="edit-expense-amount" className="text-sm font-medium">Amount (₹)</label>
              <Input
                id="edit-expense-amount"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                disabled={isSavingEdit}
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="edit-expense-category" className="text-sm font-medium">Category</label>
              <select
                id="edit-expense-category"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                disabled={isSavingEdit}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring disabled:opacity-50 dark:bg-input/30"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="edit-expense-notes" className="text-sm font-medium">Notes / Vendor</label>
              <Input
                id="edit-expense-notes"
                type="text"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                disabled={isSavingEdit}
                maxLength={300}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditing(null)} disabled={isSavingEdit}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveEdit} disabled={isSavingEdit}>
              {isSavingEdit && <Loader2 className="size-4 animate-spin" />}
              {isSavingEdit ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
