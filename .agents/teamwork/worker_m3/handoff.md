# Handoff Report: Milestone M3 / Requirement R1 (Authentication Security Hardening)

**Worker**: `worker_m3`  
**Target File**: `src/lib/authService.ts`  
**Date**: 2026-10-06T04:57:00Z  

---

## 1. Observation
- In `src/lib/authService.ts`:
  - `DEFAULT_ADMIN_PASSWORDS = ['admin123', '1234', 'admin', 'vyoma2026']` and `DEFAULT_STAFF_PASSWORDS = ['staff123', '1234', 'staff', 'captain123']` were previously checked unconditionally in Step 1 of both `verifyStaffPassword` (lines 33–36) and `verifyAdminPassword` (lines 103–106) with 0ms latency.
  - Anyone entering demo passcodes in production environments was immediately granted access regardless of whether valid credentials were configured in Supabase or the POS server database.
  - The fallback error messages on line 90 (`'Invalid Passcode. Use default (1234 / staff123) or configure in Supabase.'`) and line 160 (`'Invalid Admin Passcode. Use default (1234 / admin123) or configure in Supabase.'`) directly leaked default demo credentials to users upon failed authentication attempts.
  - The network calls to `/api/auth/verify` on lines 45 and 115 used relative paths `fetch('/api/auth/verify', ...)`. In native mobile Capacitor APK environments (`capacitor://localhost`), relative requests fail because no server runs on the mobile device.

---

## 2. Logic Chain
1. **DEV Environment Separation**:
   - In Vite applications, `import.meta.env.DEV` is a boolean that is `true` during development (`npm run dev`) and `false` in production builds (`npm run build`). Vite replaces it statically with `false` during Rollup bundling, enabling dead-code elimination.
   - Wrapping the Step 1 demo passcode checks inside `if (import.meta.env.DEV)` guarantees that in development, developers retain convenient access with `'1234'` or `'admin123'`. In production builds, this block is bypassed, forcing all login attempts to be validated against the server `/api/auth/verify` endpoint or Supabase `app_passwords` table.
2. **Capacitor Mobile API Routing**:
   - `src/lib/apiConfig.ts` exports `resolveApiUrl(path: string): string`, which retrieves the user-configured POS Server IP from `localStorage` (key `vyoma_pos_server_url`) or `VITE_API_BASE_URL`.
   - Wrapping `/api/auth/verify` as `fetch(resolveApiUrl('/api/auth/verify'), ...)` guarantees that Android APK builds route to the local network POS server IP rather than failing against `capacitor://localhost`.
3. **Information Disclosure Prevention**:
   - In production (`import.meta.env.DEV` is falsy), fallback error messages must not advertise default demo passcodes.
   - We applied ternary expressions to ensure production environments receive sanitized messages:
     - Staff: `'Invalid Passcode. Credentials not found or invalid in database.'`
     - Admin: `'Invalid Admin Passcode. Credentials not found or invalid in database.'`
   - In development environments, helpful guidance remains active.

---

## 3. Caveats
- No caveats. The change strictly adheres to the minimal-change principle, modifying only `src/lib/authService.ts`. All other files remain untouched by this worker.

---

## 4. Conclusion
- Requirement R1 (Authentication Security Hardening / Milestone M3) is fully implemented.
- Default demo credentials are strictly limited to development builds.
- Production builds require credentials from the server `/api/auth/verify` route or the Supabase `app_passwords` table.
- Mobile APK compatibility is assured via `resolveApiUrl`.
- Production error messages are sanitized against credential leakage.
- TypeScript linting (`npm run lint` / `tsc --noEmit`) passes with 0 errors.
- Production build (`npm run build`) completes with 0 errors in 9.42s.

---

## 5. Verification Method
1. **TypeScript Type Check**:
   ```powershell
   npm run lint
   ```
   *Expected outcome*: Exits with code 0 and 0 errors.
2. **Production Bundle Verification**:
   ```powershell
   npm run build
   ```
   *Expected outcome*: Exits with code 0, bundles `dist/assets/*.js` and `dist/server.cjs`.
3. **Source Code Inspection**:
   Inspect `src/lib/authService.ts` to confirm:
   - Line 3: `import { getApiBaseUrl, resolveApiUrl } from './apiConfig';`
   - Lines 34–38: `if (import.meta.env.DEV) { ... }` in `verifyStaffPassword`
   - Line 47: `fetch(resolveApiUrl('/api/auth/verify'), ...)` in `verifyStaffPassword`
   - Lines 92–97: Sanitized error ternary in `verifyStaffPassword`
   - Lines 111–115: `if (import.meta.env.DEV) { ... }` in `verifyAdminPassword`
   - Line 124: `fetch(resolveApiUrl('/api/auth/verify'), ...)` in `verifyAdminPassword`
   - Lines 169–174: Sanitized error ternary in `verifyAdminPassword`
