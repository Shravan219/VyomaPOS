import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Controlled mocks for Supabase client
let mockIsSupabaseConfigured = false;
const mockFrom = vi.fn();

vi.mock('../lib/supabase', () => ({
  get isSupabaseConfigured() {
    return mockIsSupabaseConfigured;
  },
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
  },
}));

// Import after vi.mock so the module binds to mocked dependencies
import { verifyStaffPassword, verifyAdminPassword } from '../lib/authService';

describe('Auth Service Verification Logic (production)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsSupabaseConfigured = false;
    // Default fetch spy that simulates network failure / unreachable backend unless overridden
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Backend offline'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Empty and Whitespace Passwords', () => {
    it('rejects empty and whitespace inputs for staff password', async () => {
      const emptyRes = await verifyStaffPassword('');
      expect(emptyRes).toEqual({ success: false, message: 'Password cannot be empty' });

      const wsRes = await verifyStaffPassword('   ');
      expect(wsRes).toEqual({ success: false, message: 'Password cannot be empty' });
    });

    it('rejects empty and whitespace inputs for admin password', async () => {
      const emptyRes = await verifyAdminPassword('');
      expect(emptyRes).toEqual({ success: false, message: 'Password cannot be empty' });

      const wsRes = await verifyAdminPassword(' \t \n ');
      expect(wsRes).toEqual({ success: false, message: 'Password cannot be empty' });
    });
  });

  describe('Production auth (no demo bypass)', () => {
    it('strictly DOES NOT bypass auth for demo passcodes when offline/unconfigured', async () => {
      // Former demo passcodes must be rejected in production
      const resStaff = await verifyStaffPassword('1234');
      expect(resStaff.success).toBe(false);
      expect(resStaff.message).toBe('Invalid Passcode. Credentials not found or invalid in database.');

      const resStaff2 = await verifyStaffPassword('staff123');
      expect(resStaff2.success).toBe(false);

      const resAdmin = await verifyAdminPassword('admin123');
      expect(resAdmin.success).toBe(false);
      expect(resAdmin.message).toBe('Invalid Admin Passcode. Credentials not found or invalid in database.');
    });

    it('rejects unrecognized passwords when offline', async () => {
      const res = await verifyStaffPassword('wrong_passcode');
      expect(res.success).toBe(false);
      expect(res.message).toBe('Invalid Passcode. Credentials not found or invalid in database.');
    });

    it('authorizes staff when server /api/auth/verify succeeds', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Verified by POS server' }),
      } as Response);

      const res = await verifyStaffPassword('secret_staff_token');
      expect(res).toEqual({ success: true, message: 'Verified by POS server' });
    });

    it('authorizes admin when server /api/auth/verify succeeds', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Admin verified by server' }),
      } as Response);

      const res = await verifyAdminPassword('secret_admin_token');
      expect(res).toEqual({ success: true, message: 'Admin verified by server' });
    });

    it('rejects when server returns unsuccessful status', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, message: 'Invalid server passcode' }),
      } as Response);

      const res = await verifyStaffPassword('invalid_staff');
      expect(res.success).toBe(false);
    });

    it('falls through to Supabase app_passwords and verifies staff credential', async () => {
      mockIsSupabaseConfigured = true;
      mockFrom.mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [{ key: 'staff_password', password: 'secureStaff2026' }],
          error: null,
        }),
      });

      const successRes = await verifyStaffPassword('secureStaff2026');
      expect(successRes).toEqual({ success: true });

      const failRes = await verifyStaffPassword('wrong_password');
      expect(failRes).toEqual({ success: false, message: 'Invalid Staff Access Password' });
    });

    it('falls through to Supabase app_passwords and verifies admin credential', async () => {
      mockIsSupabaseConfigured = true;
      mockFrom.mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [{ key: 'admin_password', password: 'secureAdmin2026' }],
          error: null,
        }),
      });

      const successRes = await verifyAdminPassword('secureAdmin2026');
      expect(successRes).toEqual({ success: true });

      const failRes = await verifyAdminPassword('wrong_password');
      expect(failRes).toEqual({ success: false, message: 'Invalid Admin Password' });
    });
  });
});
