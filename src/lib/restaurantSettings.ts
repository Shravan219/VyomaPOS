/**
 * Outlet-level restaurant settings: GSTIN + GST rate (GSTAMT).
 *
 * - Asked once on first app open (RestaurantSetupModal) and persisted in localStorage.
 * - `GSTIN`  = outlet GSTIN string (15-char Indian GSTIN, may be '' if skipped).
 * - `GSTAMT` = outlet GST percentage number (e.g. 5). Single source of truth for
 *   every bill/card/receipt GST calculation.
 * - `RESTAURANT_NAME` = 'Xtra Rooftop Lounge & Cafe' (printed on every invoice).
 */

export const RESTAURANT_NAME = 'Xtra Rooftop Lounge & Cafe';
export const RESTAURANT_NAME_RECEIPT = 'Xtra Rooftop Lounge & Cafe';
export const RESTAURANT_NAME_WHATSAPP = 'XTRA ROOFTOP LOUNGE & CAFE';

/** Google review link printed on WhatsApp invoices and receipts. */
export const GOOGLE_REVIEW_URL = 'https://maps.app.goo.gl/A2caFjF8RDXqDBXA7';

const GSTIN_KEY = 'xtra_restaurant_gstin';
const GSTAMT_KEY = 'xtra_restaurant_gst_rate';
const CONFIGURED_KEY = 'xtra_restaurant_settings_configured';

export const DEFAULT_GST_RATE = 5;
export const SETTINGS_CHANGED_EVENT = 'xtra:restaurant-settings-changed';

function readLS(key: string): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLS(key: string, value: string) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(key, value);
  } catch {
    // storage unavailable (private mode) — in-memory vars below still work
  }
}

/** Outlet GSTIN var — live value, kept in sync with localStorage. */
export let GSTIN: string = readLS(GSTIN_KEY) || '';

/** Outlet GST percentage var — live value, kept in sync with localStorage. */
export let GSTAMT: number = (() => {
  const raw = readLS(GSTAMT_KEY);
  const n = raw !== null ? Number(raw) : NaN;
  return Number.isFinite(n) && n >= 0 && n <= 28 ? n : DEFAULT_GST_RATE;
})();

export function getGSTIN(): string {
  return GSTIN;
}

export function getGSTAMT(): number {
  return GSTAMT;
}

export function getRestaurantName(): string {
  return RESTAURANT_NAME;
}

export function isRestaurantConfigured(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return GSTIN !== '' || true;
    return window.localStorage.getItem(CONFIGURED_KEY) === 'true';
  } catch {
    return true;
  }
}

export interface RestaurantSettings {
  gstin: string;
  gstRate: number;
  configured: boolean;
}

export function getRestaurantSettings(): RestaurantSettings {
  return { gstin: GSTIN, gstRate: GSTAMT, configured: isRestaurantConfigured() };
}

function notifyChanged() {
  try {
    window.dispatchEvent(new CustomEvent(SETTINGS_CHANGED_EVENT));
  } catch {
    // ignore
  }
}

/**
 * Persist outlet settings and refresh the live GSTIN/GSTAMT vars.
 * Pass { markConfigured: true } (default) on first-run save/skip.
 */
export function saveRestaurantSettings(
  gstin: string,
  gstRate: number,
  opts: { markConfigured?: boolean } = {},
): RestaurantSettings {
  const cleanGstin = (gstin || '').toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 15);
  const rate = Number(gstRate);
  const safeRate = Number.isFinite(rate) ? Math.min(28, Math.max(0, rate)) : DEFAULT_GST_RATE;

  GSTIN = cleanGstin;
  GSTAMT = safeRate;

  writeLS(GSTIN_KEY, cleanGstin);
  writeLS(GSTAMT_KEY, String(safeRate));
  if (opts.markConfigured !== false) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(CONFIGURED_KEY, 'true');
      }
    } catch {
      // ignore
    }
  }
  notifyChanged();
  return getRestaurantSettings();
}

/** Re-read localStorage into the live vars (e.g. after external change). */
export function refreshRestaurantSettings(): RestaurantSettings {
  GSTIN = readLS(GSTIN_KEY) || '';
  const raw = readLS(GSTAMT_KEY);
  const n = raw !== null ? Number(raw) : NaN;
  GSTAMT = Number.isFinite(n) && n >= 0 && n <= 28 ? n : DEFAULT_GST_RATE;
  return getRestaurantSettings();
}
