/**
 * UPI payment helpers — scannable `upi://pay` QR codes with the exact bill amount.
 * Any UPI app (GPay, PhonePe, Paytm, BHIM) resolves these links and prefills
 * the payee + amount so the customer only confirms.
 */
import QRCode from 'qrcode';

/** Temporary outlet UPI ID (replace with the live merchant VPA when ready). */
export const TEMP_OUTLET_UPI_ID = '8788376667@postbank';

/** Outlet VPA — env override wins, temporary ID is the fallback. */
export function getOutletUpiId(): string {
  try {
    const envId =
      (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_UPI_ID) || '';
    if (typeof envId === 'string' && envId.trim()) return envId.trim();
  } catch {
    /* import.meta unavailable (SSR/tests) — fall through to default */
  }
  return TEMP_OUTLET_UPI_ID;
}

/** UPI `am` must carry paise precision — always 2 decimals. */
export function formatUpiAmount(amount: number): string {
  const v = Number(amount);
  if (!Number.isFinite(v) || v <= 0) return '0.00';
  return v.toFixed(2);
}

export interface UpiPayParams {
  /** Payee VPA, e.g. 8788376667@postbank */
  pa: string;
  /** Payee display name shown in the UPI app */
  pn: string;
  /** Exact amount to collect */
  amount: number;
  /** Transaction note (bill/token reference) */
  note?: string;
}

/**
 * Builds a `upi://pay` deep link. Built with explicit encodeURIComponent
 * (spaces → %20) since some UPI apps mishandle `+` in the note field.
 */
export function buildUpiPayUrl({ pa, pn, amount, note }: UpiPayParams): string {
  const parts = [
    `pa=${encodeURIComponent(pa.trim())}`,
    `pn=${encodeURIComponent(pn.trim() || 'Merchant')}`,
    `am=${encodeURIComponent(formatUpiAmount(amount))}`,
    'cu=INR',
  ];
  if (note && note.trim()) {
    parts.push(`tn=${encodeURIComponent(note.trim().slice(0, 80))}`);
  }
  return `upi://pay?${parts.join('&')}`;
}

/** Renders the UPI intent as a PNG data URL. Returns null on failure. */
export async function getUpiQrDataUrl(
  amount: number,
  opts?: { upiId?: string; payeeName?: string; note?: string; width?: number },
): Promise<string | null> {
  try {
    const url = buildUpiPayUrl({
      pa: opts?.upiId || getOutletUpiId(),
      pn: opts?.payeeName || 'Xtra Rooftop Lounge & Cafe',
      amount,
      note: opts?.note,
    });
    return await QRCode.toDataURL(url, {
      width: opts?.width ?? 240,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#000000', light: '#FFFFFF' },
    });
  } catch (err) {
    console.warn('[UPI] QR generation failed:', err);
    return null;
  }
}
