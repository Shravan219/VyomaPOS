/**
 * GST Calculation & GSTIN Validation Utilities
 * Pure financial utility functions supporting Indian GST compliance (5% standard rate).
 */

export interface InvoiceItemInput {
  price: number;
  quantity: number;
}

export interface CalculateGstOptions {
  items: InvoiceItemInput[];
  discountType?: 'flat' | 'percent';
  discountValue?: number | string;
  gstRate?: number;       // default 5
  applyGst?: boolean;     // default true
}

export interface GstCalculationResult {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  gstRate: number;
  gstAmount: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  grandTotal: number;
}

/**
 * 15-character Indian Goods and Services Tax Identification Number (GSTIN) Regex:
 * - 2 digits state code (01-37)
 * - 5 letters PAN prefix
 * - 4 digits PAN sequence
 * - 1 letter PAN check char
 * - 1 alphanumeric entity code
 * - 'Z' fixed 14th character
 * - 1 alphanumeric checksum
 */
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

/**
 * Calculates item subtotal, discounts (flat or percent), taxable base,
 * GST at specified rate (default 5%), 50/50 CGST/SGST split, and grand total.
 */
export function calculateGst({
  items = [],
  discountType = 'flat',
  discountValue = 0,
  gstRate = 5,
  applyGst = true,
}: CalculateGstOptions): GstCalculationResult {
  const subtotal = (items || []).reduce((acc, it) => {
    const price = Math.max(0, Number(it?.price) || 0);
    const quantity = Math.max(1, Number(it?.quantity) || 1);
    return acc + (price * quantity);
  }, 0);

  const rawVal = typeof discountValue === 'string'
    ? parseFloat(discountValue) || 0
    : Number(discountValue) || 0;

  let discountAmount = 0;
  if (rawVal > 0) {
    if (discountType === 'percent') {
      discountAmount = (subtotal * Math.min(100, rawVal)) / 100;
    } else {
      discountAmount = Math.min(subtotal, rawVal);
    }
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const effectiveGstRate = (applyGst && gstRate > 0) ? gstRate : 0;
  const gstAmount = taxableAmount * (effectiveGstRate / 100);

  const roundedSubtotal = Math.round(subtotal * 100) / 100;
  const roundedDiscount = Math.round(discountAmount * 100) / 100;
  const roundedTaxable = Math.round(taxableAmount * 100) / 100;
  const roundedGst = Math.round(gstAmount * 100) / 100;

  const cgstRate = effectiveGstRate / 2;
  const sgstRate = effectiveGstRate / 2;
  const cgstAmount = Math.round((roundedGst / 2) * 100) / 100;
  const sgstAmount = Math.round((roundedGst / 2) * 100) / 100;

  const grandTotal = Math.round((roundedTaxable + roundedGst) * 100) / 100;

  return {
    subtotal: roundedSubtotal,
    discountAmount: roundedDiscount,
    taxableAmount: roundedTaxable,
    gstRate: effectiveGstRate,
    gstAmount: roundedGst,
    cgstRate,
    cgstAmount,
    sgstRate,
    sgstAmount,
    grandTotal
  };
}

/**
 * Validates whether the given string is a valid 15-character Indian GSTIN.
 * Case-insensitive, trims leading/trailing whitespace.
 */
export function validateGSTIN(gstin: string | null | undefined): boolean {
  if (!gstin || typeof gstin !== 'string') return false;
  const trimmed = gstin.trim().toUpperCase();
  if (trimmed.length !== 15) return false;
  return GSTIN_REGEX.test(trimmed);
}

/**
 * Normalizes input string to valid GSTIN characters (alphanumeric uppercase, max 15 chars).
 */
export function normalizeGSTIN(val: string | null | undefined): string {
  if (!val || typeof val !== 'string') return '';
  return val.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 15);
}
