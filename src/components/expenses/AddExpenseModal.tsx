import React, { useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/src/lib/supabase';
import { toast } from 'sonner';
import { Loader2, Receipt, Upload, X } from 'lucide-react';

export const EXPENSE_CATEGORIES = [
  'Vegetables',
  'Dairy',
  'Meat & Poultry',
  'Groceries',
  'Beverages',
  'Packaging',
  'Transport',
  'Rent',
  'Salaries',
  'Utilities',
  'Maintenance',
  'Marketing',
  'Other',
] as const;

export interface Expense {
  id: string;
  created_at: string;
  amount: number;
  category: string;
  notes: string | null;
  receipt_url: string;
}

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExpenseAdded?: (expense: Expense) => void;
}

export function AddExpenseModal({ open, onOpenChange, onExpenseAdded }: AddExpenseModalProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setAmount('');
    setCategory(EXPENSE_CATEGORIES[0]);
    setNotes('');
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Enter a valid amount greater than 0');
      return;
    }
    if (!category) {
      toast.error('Select a category');
      return;
    }

    setIsSaving(true);
    try {
      // 1. Upload receipt photo first (if attached)
      let receiptUrl = '';
      if (file) {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const path = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(path, file, { contentType: file.type || 'image/jpeg', upsert: false });
        if (uploadError) throw new Error(`Receipt upload failed: ${uploadError.message}`);

        const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(path);
        receiptUrl = urlData.publicUrl;
      }

      // 2. Insert expense row -> Database Webhook fires sync-expense-to-sheets
      const { data, error: insertError } = await supabase
        .from('expenses')
        .insert({
          amount: parsedAmount,
          category,
          notes: notes.trim() || null,
          receipt_url: receiptUrl,
        })
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);

      toast.success('Expense recorded — syncing to Google Sheet');
      onExpenseAdded?.(data as Expense);
      resetForm();
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save expense';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isSaving) {
          if (!next) resetForm();
          onOpenChange(next);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="size-4" /> Add Expense
          </DialogTitle>
          <DialogDescription>
            Saved to Supabase and auto-synced to your Google Sheet.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <label htmlFor="expense-amount" className="text-sm font-medium">
              Amount (₹) *
            </label>
            <Input
              id="expense-amount"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="e.g. 450.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isSaving}
              required
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="expense-category" className="text-sm font-medium">
              Category *
            </label>
            <select
              id="expense-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isSaving}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring disabled:opacity-50 dark:bg-input/30"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="expense-notes" className="text-sm font-medium">
              Notes / Vendor
            </label>
            <Input
              id="expense-notes"
              type="text"
              placeholder="e.g. Sharma Vegetables — tomatoes 10kg"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSaving}
              maxLength={300}
            />
          </div>

          <div className="grid gap-1.5">
            <span className="text-sm font-medium">Receipt Photo</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              disabled={isSaving}
              className="hidden"
            />
            {!previewUrl ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSaving}
                className="h-20 flex-col gap-1 border-dashed"
              >
                <Upload className="size-4" />
                <span className="text-xs">Tap to capture / upload receipt</span>
              </Button>
            ) : (
              <div className="relative overflow-hidden rounded-lg border">
                <img src={previewUrl} alt="Receipt preview" className="h-32 w-full object-cover" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-xs"
                  onClick={() => {
                    setFile(null);
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  disabled={isSaving}
                  className="absolute right-2 top-2"
                  aria-label="Remove receipt photo"
                >
                  <X className="size-3" />
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="size-4 animate-spin" />}
              {isSaving ? 'Saving…' : 'Save Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
