import { supabase, isSupabaseConfigured } from './supabase';
import { Capacitor } from '@capacitor/core';
import { getApiBaseUrl, resolveApiUrl } from './apiConfig';

export interface VerifyResult {
  success: boolean;
  message?: string;
}

/**
 * Executes a promise with a hard timeout to prevent mobile app hanging on slow networks.
 */
function withTimeout<T>(promise: PromiseLike<T> | Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    Promise.resolve(promise) as Promise<T>,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
  ]);
}

/**
 * Verifies a staff access password against the remote POS server
 * and Supabase 'app_passwords' table. Production-only: no demo
 * passcodes or development bypasses.
 */
export async function verifyStaffPassword(input: string): Promise<VerifyResult> {
  const trimmed = (input ?? '').trim();
  if (!trimmed) {
    return { success: false, message: 'Password cannot be empty' };
  }

  // 1. Try server verification route only if web or remote POS server is configured
  const hasServer = !Capacitor.isNativePlatform() || Boolean(getApiBaseUrl());
  if (hasServer) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const apiRes = await fetch(resolveApiUrl('/api/auth/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'staff', password: trimmed }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data.success) {
          return { success: true, message: data.message };
        }
      }
    } catch {
      // Backend route unreachable or timed out, fallback to Supabase
    }
  }

  // 2. Direct client query to Supabase 'app_passwords' table if configured (with 2s timeout)
  if (isSupabaseConfigured) {
    try {
      const queryPromise = supabase.from('app_passwords').select('*');
      const { data, error } = await withTimeout(queryPromise, 2000, { data: null, error: { message: 'Timed out' } } as any);

      // DB unreachable (offline, timed out, or RLS blocks anon reads) — say so
      // instead of blaming the password.
      if (error) {
        return { success: false, message: 'Cannot reach password database. Check internet connection or configure the POS server URL.' };
      }

      if (data && data.length > 0) {
        const staffRow = data.find((r: any) => {
          const k = String(r.key || r.name || r.type || r.id || '').trim().toLowerCase();
          return k === 'staff_password' || k === 'staff' || k === 'staffpassword';
        });

        if (staffRow) {
          const passVal = String(staffRow.password || staffRow.value || staffRow.pass || '').trim();
          if (trimmed === passVal) {
            return { success: true };
          } else {
            return { success: false, message: 'Invalid Staff Access Password' };
          }
        }
      }
    } catch (err: any) {
      console.warn('[AuthService] Supabase query notice:', err?.message);
      return { success: false, message: 'Cannot reach password database. Check internet connection or configure the POS server URL.' };
    }
  }

  return {
    success: false,
    message: 'Invalid Passcode. Credentials not found or invalid in database.'
  };
}

/**
 * Verifies an admin password against the remote POS server
 * and Supabase 'app_passwords' table. Production-only: no demo
 * passcodes or development bypasses.
 */
export async function verifyAdminPassword(input: string): Promise<VerifyResult> {
  const trimmed = (input ?? '').trim();
  if (!trimmed) {
    return { success: false, message: 'Password cannot be empty' };
  }

  // 1. Try server verification route only if web or remote POS server is configured
  const hasServer = !Capacitor.isNativePlatform() || Boolean(getApiBaseUrl());
  if (hasServer) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const apiRes = await fetch(resolveApiUrl('/api/auth/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'admin', password: trimmed }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data.success) {
          return { success: true, message: data.message };
        }
      }
    } catch {
      // Backend route unreachable or timed out, fallback to Supabase
    }
  }

  // 2. Direct client query to Supabase 'app_passwords' table if configured (with 2s timeout)
  if (isSupabaseConfigured) {
    try {
      const queryPromise = supabase.from('app_passwords').select('*');
      const { data, error } = await withTimeout(queryPromise, 2000, { data: null, error: { message: 'Timed out' } } as any);

      // DB unreachable (offline, timed out, or RLS blocks anon reads) — say so
      // instead of blaming the password.
      if (error) {
        return { success: false, message: 'Cannot reach password database. Check internet connection or configure the POS server URL.' };
      }

      if (data && data.length > 0) {
        const adminRow = data.find((r: any) => {
          const k = String(r.key || r.name || r.type || r.id || '').trim().toLowerCase();
          return k === 'admin_password' || k === 'admin' || k === 'adminpassword';
        });

        if (adminRow) {
          const passVal = String(adminRow.password || adminRow.value || adminRow.pass || '').trim();
          if (trimmed === passVal) {
            return { success: true };
          } else {
            return { success: false, message: 'Invalid Admin Password' };
          }
        }
      }
    } catch (err: any) {
      console.warn('[AuthService] Supabase query notice:', err?.message);
      return { success: false, message: 'Cannot reach password database. Check internet connection or configure the POS server URL.' };
    }
  }

  return {
    success: false,
    message: 'Invalid Admin Passcode. Credentials not found or invalid in database.'
  };
}
