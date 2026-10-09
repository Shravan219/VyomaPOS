import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateGst, validateGSTIN, normalizeGSTIN, GSTIN_REGEX } from '../utils/gst';

// Mock Supabase as unconfigured so auth tests run offline-deterministically
// (no 2s network timeouts, no dependency on real .env credentials).
let mockIsSupabaseConfiguredStress = false;
const mockFromStress = vi.fn();

vi.mock('../lib/supabase', () => ({
  get isSupabaseConfigured() {
    return mockIsSupabaseConfiguredStress;
  },
  supabase: {
    from: (...args: any[]) => mockFromStress(...args),
  },
}));

import { verifyStaffPassword, verifyAdminPassword } from '../lib/authService';

describe('Adversarial Stress Test: src/utils/gst.ts', () => {
  it('handles 0 price items without NaN or errors', () => {
    const res = calculateGst({ items: [{ price: 0, quantity: 5 }] });
    expect(res.subtotal).toBe(0);
    expect(res.taxableAmount).toBe(0);
    expect(res.gstAmount).toBe(0);
    expect(res.grandTotal).toBe(0);
  });

  it('handles negative price items defensively (clamped to 0)', () => {
    const res = calculateGst({
      items: [
        { price: -100, quantity: 2 },
        { price: 50, quantity: 1 }
      ]
    });
    // -100 is clamped to 0, 50 * 1 = 50, GST @ 5% = 2.5, grand total = 52.5
    expect(res.subtotal).toBe(50);
    expect(res.gstAmount).toBe(2.5);
    expect(res.grandTotal).toBe(52.5);
  });

  it('handles 0 quantity items (clamping behavior analysis)', () => {
    // Current gst.ts behavior: Math.max(1, Number(it?.quantity) || 1) clamps 0 to 1
    const res = calculateGst({ items: [{ price: 100, quantity: 0 }] });
    // Verify empirical behavior of quantity 0
    expect(res.subtotal).toBe(100);
    expect(res.grandTotal).toBe(105);
  });

  it('handles float precision and half-up rounding accurately', () => {
    // 33.33 * 3 = 99.99
    // 99.99 * 0.05 = 4.9995 -> 5.00
    const res1 = calculateGst({ items: [{ price: 33.33, quantity: 3 }], gstRate: 5 });
    expect(res1.subtotal).toBe(99.99);
    expect(res1.gstAmount).toBe(5);
    expect(res1.grandTotal).toBe(104.99);

    // 0.1 * 1 = 0.10
    // 0.10 * 0.05 = 0.005 -> 0.01
    const res2 = calculateGst({ items: [{ price: 0.1, quantity: 1 }], gstRate: 5 });
    expect(res2.subtotal).toBe(0.1);
    expect(res2.gstAmount).toBe(0.01);
    expect(res2.grandTotal).toBe(0.11);

    // 19.99 * 3 = 59.97
    // 59.97 * 0.05 = 2.9985 -> 3.00
    const res3 = calculateGst({ items: [{ price: 19.99, quantity: 3 }], gstRate: 5 });
    expect(res3.subtotal).toBe(59.97);
    expect(res3.gstAmount).toBe(3);
    expect(res3.grandTotal).toBe(62.97);
  });

  it('handles 100% discount correctly reducing taxable amount and tax to 0', () => {
    const res = calculateGst({
      items: [{ price: 250, quantity: 4 }], // 1000
      discountType: 'percent',
      discountValue: 100
    });
    expect(res.subtotal).toBe(1000);
    expect(res.discountAmount).toBe(1000);
    expect(res.taxableAmount).toBe(0);
    expect(res.gstAmount).toBe(0);
    expect(res.cgstAmount).toBe(0);
    expect(res.sgstAmount).toBe(0);
    expect(res.grandTotal).toBe(0);
  });

  it('clamps 150% discount to 100% without negative grand total', () => {
    const res = calculateGst({
      items: [{ price: 200, quantity: 1 }],
      discountType: 'percent',
      discountValue: 150
    });
    expect(res.subtotal).toBe(200);
    expect(res.discountAmount).toBe(200);
    expect(res.taxableAmount).toBe(0);
    expect(res.grandTotal).toBe(0);
  });
});

describe('Adversarial Stress Test: validateGSTIN & GSTIN_REGEX', () => {
  it('enforces strict boundary string lengths (0, 14, 15, 16)', () => {
    expect(validateGSTIN('')).toBe(false);
    expect(validateGSTIN('27AABCS1429B1Z')).toBe(false); // 14
    expect(validateGSTIN('27AABCS1429B1Z8')).toBe(true);  // 15
    expect(validateGSTIN('27AABCS1429B1Z89')).toBe(false); // 16
  });

  it('evaluates huge input (1,000,000 characters) in sub-millisecond time without ReDoS', () => {
    const hugeInput = '27AABCS1429B1Z' + 'A'.repeat(1_000_000);
    const start = performance.now();
    const result = validateGSTIN(hugeInput);
    const elapsed = performance.now() - start;

    expect(result).toBe(false);
    expect(elapsed).toBeLessThan(50); // Under 50ms (typically < 1ms)
  });

  it('rejects malicious special characters, control codes, and injection payloads', () => {
    const attacks = [
      '27AABCS1429B1Z!',
      '27AABCS1429B1Z\0',
      '27\nAABCS1429B1Z8',
      '27AABCS 1429B1Z8',
      '27AABCS1429B1Z<script>',
      "27' OR 1=1 --",
      '27AABCS1429B1Z\u0000',
      '27AABCS1429B1Z;'
    ];
    for (const payload of attacks) {
      expect(validateGSTIN(payload)).toBe(false);
    }
  });

  it('normalizes dirty user inputs cleanly with normalizeGSTIN', () => {
    expect(normalizeGSTIN('  27aabcs-1429b1z8  ')).toBe('27AABCS1429B1Z8');
    expect(normalizeGSTIN(null)).toBe('');
    expect(normalizeGSTIN(undefined)).toBe('');
    expect(normalizeGSTIN('!@#$%^&*()')).toBe('');
  });
});

describe('Adversarial Stress Test: src/lib/authService.ts (production)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsSupabaseConfiguredStress = false;
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Backend offline'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles empty and whitespace-only strings gracefully', async () => {
    const emptyStaff = await verifyStaffPassword('');
    expect(emptyStaff).toEqual({ success: false, message: 'Password cannot be empty' });

    const wsStaff = await verifyStaffPassword('   \t\n  ');
    expect(wsStaff).toEqual({ success: false, message: 'Password cannot be empty' });

    const emptyAdmin = await verifyAdminPassword('');
    expect(emptyAdmin).toEqual({ success: false, message: 'Password cannot be empty' });

    const wsAdmin = await verifyAdminPassword('   ');
    expect(wsAdmin).toEqual({ success: false, message: 'Password cannot be empty' });
  });

  it('rejects undefined or null inputs gracefully (no throw)', async () => {
    // Production hardening: non-string inputs are coerced and rejected cleanly.
    const staffRes = await verifyStaffPassword(undefined as any);
    expect(staffRes).toEqual({ success: false, message: 'Password cannot be empty' });

    const adminRes = await verifyAdminPassword(null as any);
    expect(adminRes).toEqual({ success: false, message: 'Password cannot be empty' });
  });

  it('rejects invalid credentials when offline', async () => {
    const res = await verifyStaffPassword('wrong_password_999');
    expect(res.success).toBe(false);
    expect(res.message).toBe('Invalid Passcode. Credentials not found or invalid in database.');
  });

  it('rejects invalid credentials in production', async () => {
    const res = await verifyStaffPassword('wrong_password_999');
    expect(res.success).toBe(false);
    expect(res.message).toBe('Invalid Passcode. Credentials not found or invalid in database.');
  });

  it('strictly rejects former demo passcodes when offline (no bypass)', async () => {
    const demoCodes = ['1234', 'admin123', 'staff123', 'admin', 'staff', 'captain123', 'vyoma2026'];
    for (const code of demoCodes) {
      const staffRes = await verifyStaffPassword(code);
      expect(staffRes.success).toBe(false);
      expect(staffRes.message).toBe('Invalid Passcode. Credentials not found or invalid in database.');

      const adminRes = await verifyAdminPassword(code);
      expect(adminRes.success).toBe(false);
      expect(adminRes.message).toBe('Invalid Admin Passcode. Credentials not found or invalid in database.');
    }
  });
});
