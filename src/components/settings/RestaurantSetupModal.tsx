import * as React from 'react';
import { useState, useEffect } from 'react';
import { Store, BadgePercent, Save, SkipForward } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { validateGSTIN, normalizeGSTIN } from '@/src/utils/gst';
import {
  RESTAURANT_NAME,
  DEFAULT_GST_RATE,
  getGSTIN,
  getGSTAMT,
  saveRestaurantSettings,
} from '@/src/lib/restaurantSettings';

interface RestaurantSetupModalProps {
  open: boolean;
  /** 'onboarding' = first run (blocking, no dismiss). 'settings' = editable later. */
  mode?: 'onboarding' | 'settings';
  onOpenChange?: (open: boolean) => void;
  onSaved?: () => void;
}

const GST_SLABS = [0, 5, 12, 18, 28];

export function RestaurantSetupModal({
  open,
  mode = 'onboarding',
  onOpenChange,
  onSaved,
}: RestaurantSetupModalProps) {
  const [gstin, setGstin] = useState('');
  const [gstRate, setGstRate] = useState<string>(String(DEFAULT_GST_RATE));
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setGstin(getGSTIN());
      setGstRate(String(getGSTAMT()));
      setError('');
    }
  }, [open ]);

  const parsedRate = Number(gstRate);
  const rateValid = gstRate.trim() !== '' && Number.isFinite(parsedRate) && parsedRate >= 0 && parsedRate <= 28;
  const gstinValid = gstin.trim() === '' || validateGSTIN(gstin.trim());
  // Onboarding requires a valid GSTIN + rate; settings mode allows empty (retail-only).
  const canSave =
    mode === 'settings'
      ? rateValid && gstinValid
      : rateValid && validateGSTIN(gstin.trim());

  const previewBase = 1000;
  const previewGst = rateValid ? (previewBase * parsedRate) / 100 : 0;

  const handleSave = () => {
    if (!rateValid) {
      setError('Enter a GST percentage between 0 and 28.');
      return;
    }
    if (mode === 'onboarding' && !validateGSTIN(gstin.trim())) {
      setError('Enter your valid 15-character outlet GSTIN (e.g. 27ABCDE1234F1Z5).');
      return;
    }
    if (gstin.trim() && !validateGSTIN(gstin.trim())) {
      setError('GSTIN looks invalid. Check the 15-character format or clear it.');
      return;
    }
    saveRestaurantSettings(gstin.trim(), parsedRate);
    toast.success(`Outlet settings saved — GST ${parsedRate}% applied to all bills`);
    onSaved?.();
    onOpenChange?.(false);
  };

  const handleSkip = () => {
    saveRestaurantSettings('', DEFAULT_GST_RATE);
    toast.info('Skipped — using 5% GST. Update anytime from GST / Outlet settings.');
    onSaved?.();
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={mode === 'settings' ? onOpenChange : undefined}>
      <DialogContent
        showCloseButton={mode === 'settings'}
        className="bg-[#0A0A0A] border border-primary/20 text-white max-w-[440px] w-full rounded-[2rem] p-6 sm:p-8 max-h-[92vh] overflow-y-auto custom-scrollbar"
        onInteractOutside={(e) => {
          if (mode === 'onboarding') e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (mode === 'onboarding') e.preventDefault();
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Store size={18} />
            </div>
            <div>
              <DialogTitle className="text-xl font-serif tracking-tight">
                {mode === 'onboarding' ? 'Setup your outlet' : 'Outlet GST settings'}
              </DialogTitle>
              <DialogDescription className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-bold">
                {RESTAURANT_NAME}
              </DialogDescription>
            </div>
          </div>
          <p className="text-xs text-white/60 leading-relaxed pt-2">
            {mode === 'onboarding'
              ? 'First-run setup — enter your outlet GSTIN and GST % once. They are stored on this device and used for every bill, card total and invoice.'
              : 'Update your outlet GSTIN and GST %. New bills use the updated values instantly.'}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label htmlFor="outlet-gstin" className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-bold ml-1">
              Outlet GSTIN {mode === 'onboarding' ? '(required)' : '(optional)'}
            </label>
            <Input
              id="outlet-gstin"
              type="text"
              maxLength={15}
              placeholder="e.g. 27ABCDE1234F1Z5"
              value={gstin}
              onChange={(e) => {
                setGstin(normalizeGSTIN(e.target.value));
                setError('');
              }}
              className="bg-black/60 border-white/10 rounded-2xl h-12 text-sm font-mono font-semibold uppercase tracking-widest text-white placeholder:text-white/30"
            />
            <p className="text-[10px] text-white/40 ml-1">15 characters • auto-uppercased • printed on every tax invoice</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="outlet-gst-rate" className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-bold ml-1 flex items-center gap-1.5">
              <BadgePercent size={12} className="text-primary" />
              GST % (GSTAMT)
            </label>
            <Input
              id="outlet-gst-rate"
              type="number"
              min={0}
              max={28}
              step={0.5}
              placeholder="e.g. 5"
              value={gstRate}
              onChange={(e) => {
                setGstRate(e.target.value);
                setError('');
              }}
              className="bg-black/60 border-white/10 rounded-2xl h-12 text-sm font-mono font-semibold text-white placeholder:text-white/30"
            />
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {GST_SLABS.map((slab) => (
                <button
                  key={slab}
                  type="button"
                  onClick={() => {
                    setGstRate(String(slab));
                    setError('');
                  }}
                  aria-pressed={parsedRate === slab}
                  className={`min-h-[40px] rounded-xl text-[10px] sm:text-[11px] font-bold font-mono border transition-all px-1 ${
                    parsedRate === slab
                      ? 'bg-primary text-black border-primary'
                      : 'bg-black/40 border-white/10 text-white/60 hover:text-white hover:border-white/25'
                  }`}
                >
                  {slab}%
                </button>
              ))}
            </div>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-2xl p-3 text-[11px] font-mono text-white/70 space-y-1">
            <div className="flex justify-between gap-2">
              <span>Base</span>
              <span>₹{previewBase.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span>GST ({rateValid ? parsedRate : 0}%)</span>
              <span>₹{(rateValid ? previewGst : 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-2 border-t border-white/10 pt-1.5 text-primary font-bold">
              <span>Total</span>
              <span>₹{(previewBase + (rateValid ? previewGst : 0)).toFixed(2)}</span>
            </div>
          </div>

          {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}
        </div>

        <DialogFooter className="bg-transparent border-t border-white/5 -mx-0 -mb-0 rounded-none p-0 pt-4 flex-col-reverse sm:flex-row sm:justify-end gap-2">
          {mode === 'onboarding' && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              className="w-full sm:w-auto text-white/50 hover:text-white text-[10px] uppercase tracking-wider h-11"
            >
              <SkipForward size={13} className="mr-1.5" />
              Skip for now
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="w-full sm:w-auto bg-primary text-black hover:bg-primary/90 rounded-full text-[10px] uppercase tracking-[0.2em] font-extrabold h-12 px-6 disabled:opacity-40"
          >
            <Save size={14} className="mr-2 shrink-0" />
            Save outlet settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
