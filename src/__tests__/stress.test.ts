import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateGst, validateGSTIN, normalizeGSTIN, GSTIN_REGEX } from '../utils/gst';
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

describe('Adversarial Stress Test: src/lib/authService.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Backend offline'));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('handles empty and whitespace-only strings gracefully', async () => {
    vi.stubEnv('DEV', true);
    const emptyStaff = await verifyStaffPassword('');
    expect(emptyStaff).toEqual({ success: false, message: 'Password cannot be empty' });

    const wsStaff = await verifyStaffPassword('   \t\n  ');
    expect(wsStaff).toEqual({ success: false, message: 'Password cannot be empty' });

    vi.stubEnv('DEV', false);
    const emptyAdmin = await verifyAdminPassword('');
    expect(emptyAdmin).toEqual({ success: false, message: 'Password cannot be empty' });

    const wsAdmin = await verifyAdminPassword('   ');
    expect(wsAdmin).toEqual({ success: false, message: 'Password cannot be empty' });
  });

  it('empirically evaluates undefined or null inputs', async () => {
    // Evaluating if input.trim() throws on undefined / null
    let staffUndefinedThrew = false;
    try {
      await verifyStaffPassword(undefined as any);
    } catch {
      staffUndefinedThrew = true;
    }

    let adminNullThrew = false;
    try {
      await verifyAdminPassword(null as any);
    } catch {
      adminNullThrew = true;
    }

    // Notice: If input.trim() is not guarded against non-string types, it throws TypeError
    expect(staffUndefinedThrew).toBe(true);
    expect(adminNullThrew).toBe(true);
  });

  it('verifies invalid credentials in DEV mode', async () => {
    vi.stubEnv('DEV', true);
    const res = await verifyStaffPassword('wrong_password_999');
    expect(res.success).toBe(false);
    expect(res.message).toContain('Invalid Passcode. Use default (1234 / staff123)');
  });

  it('verifies invalid credentials in PROD mode', async () => {
    vi.stubEnv('DEV', false);
    const res = await verifyStaffPassword('wrong_password_999');
    expect(res.success).toBe(false);
    expect(res.message).toBe('Invalid Passcode. Credentials not found or invalid in database.');
  });

  it('strictly rejects demo passcodes in PROD mode when offline', async () => {
    vi.stubEnv('DEV', false);
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

  it('allows demo passcodes in DEV mode', async () => {
    vi.stubEnv('DEV', true);
    expect((await verifyStaffPassword('1234')).success).toBe(true);
    expect((await verifyStaffPassword('staff123')).success).toBe(true);
    expect((await verifyAdminPassword('admin123')).success).toBe(true);
    expect((await verifyAdminPassword('1234')).success).toBe(true);
  });
});
