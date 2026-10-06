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

describe('Auth Service Verification Logic', () => {
  const originalDev = import.meta.env.DEV;

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsSupabaseConfigured = false;
    // Default fetch spy that simulates network failure / unreachable backend unless overridden
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Backend offline'));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('Empty and Whitespace Passwords', () => {
    it('rejects empty and whitespace inputs for staff password in DEV mode', async () => {
      vi.stubEnv('DEV', true);
      const emptyRes = await verifyStaffPassword('');
      expect(emptyRes).toEqual({ success: false, message: 'Password cannot be empty' });

      const wsRes = await verifyStaffPassword('   ');
      expect(wsRes).toEqual({ success: false, message: 'Password cannot be empty' });
    });

    it('rejects empty and whitespace inputs for admin password in PROD mode', async () => {
      vi.stubEnv('DEV', false);
      const emptyRes = await verifyAdminPassword('');
      expect(emptyRes).toEqual({ success: false, message: 'Password cannot be empty' });

      const wsRes = await verifyAdminPassword(' \t \n ');
      expect(wsRes).toEqual({ success: false, message: 'Password cannot be empty' });
    });
  });

  describe('Development Mode (DEV = true)', () => {
    beforeEach(() => {
      vi.stubEnv('DEV', true);
    });

    it('allows demo passcodes instantly for staff login', async () => {
      const res1 = await verifyStaffPassword('1234');
      expect(res1).toEqual({ success: true, message: 'Access Granted' });

      const res2 = await verifyStaffPassword('staff123');
      expect(res2).toEqual({ success: true, message: 'Access Granted' });

      const res3 = await verifyStaffPassword('admin123');
      expect(res3).toEqual({ success: true, message: 'Access Granted' });
    });

    it('allows demo passcodes instantly for admin login', async () => {
      const res1 = await verifyAdminPassword('admin123');
      expect(res1).toEqual({ success: true, message: 'Access Granted' });

      const res2 = await verifyAdminPassword('1234');
      expect(res2).toEqual({ success: true, message: 'Access Granted' });
    });

    it('rejects unrecognized passwords in DEV mode when offline', async () => {
      const res = await verifyStaffPassword('wrong_dev_passcode');
      expect(res.success).toBe(false);
      expect(res.message).toContain('Use default (1234 / staff123)');
    });
  });

  describe('Production Mode (DEV = false)', () => {
    beforeEach(() => {
      vi.stubEnv('DEV', false);
    });

    it('strictly DOES NOT bypass auth for demo passcodes when offline/unconfigured', async () => {
      // Demo passcode '1234' must be rejected in production
      const resStaff = await verifyStaffPassword('1234');
      expect(resStaff.success).toBe(false);
      expect(resStaff.message).toBe('Invalid Passcode. Credentials not found or invalid in database.');

      // Demo passcode 'staff123' must be rejected in production
      const resStaff2 = await verifyStaffPassword('staff123');
      expect(resStaff2.success).toBe(false);

      // Demo passcode 'admin123' must be rejected in production
      const resAdmin = await verifyAdminPassword('admin123');
      expect(resAdmin.success).toBe(false);
      expect(resAdmin.message).toBe('Invalid Admin Passcode. Credentials not found or invalid in database.');
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
