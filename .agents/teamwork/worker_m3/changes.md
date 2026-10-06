# Changes Implemented: Auth Security Hardening (Milestone M3 / Requirement R1)

**File Modified**: `src/lib/authService.ts`

## 1. Environment-Gated Demo Passcodes
- **Issue**: Default passcodes (`'1234'`, `'admin123'`, `'staff123'`, `'admin'`, `'staff'`, etc.) previously evaluated with 0ms latency before checking database or remote API credentials in all environments, creating a backdoor vulnerability on client production installations.
- **Remediation**:
  - In `verifyStaffPassword`: Wrapped the initial `DEFAULT_STAFF_PASSWORDS` and `DEFAULT_ADMIN_PASSWORDS` checks inside `if (import.meta.env.DEV)`.
  - In `verifyAdminPassword`: Wrapped the initial `DEFAULT_ADMIN_PASSWORDS` check inside `if (import.meta.env.DEV)`.
  - In production builds (`import.meta.env.DEV` is falsy or stripped via Vite dead-code elimination), demo credentials are not granted access and immediately proceed to server `/api/auth/verify` or Supabase `app_passwords` validation.

## 2. API Endpoint Resolution via `resolveApiUrl`
- **Issue**: Calls to `/api/auth/verify` used a hardcoded relative path `'/api/auth/verify'`. On mobile Android APKs running via Capacitor (`capacitor://localhost`), relative requests fail because there is no local backend server running on the device.
- **Remediation**:
  - Imported `resolveApiUrl` alongside `getApiBaseUrl` from `./apiConfig`.
  - Replaced `fetch('/api/auth/verify', ...)` with `fetch(resolveApiUrl('/api/auth/verify'), ...)` in both `verifyStaffPassword` and `verifyAdminPassword`.
  - This ensures mobile Android APKs route correctly to the configured POS server IP address (e.g., `http://192.168.1.100:3000/api/auth/verify`).

## 3. Production Fallback Error Message Sanitization
- **Issue**: Fallback error messages previously displayed `"Use default (1234 / staff123) or configure in Supabase."` and `"Use default (1234 / admin123) or configure in Supabase."`, leaking default demo credentials to end users in production.
- **Remediation**:
  - Gated fallback error messages with ternary `import.meta.env.DEV`:
    - `verifyStaffPassword`:
      `message: import.meta.env.DEV ? 'Invalid Passcode. Use default (1234 / staff123) or configure in Supabase.' : 'Invalid Passcode. Credentials not found or invalid in database.'`
    - `verifyAdminPassword`:
      `message: import.meta.env.DEV ? 'Invalid Admin Passcode. Use default (1234 / admin123) or configure in Supabase.' : 'Invalid Admin Passcode. Credentials not found or invalid in database.'`

## Verification Summary
- `npm run lint` (`tsc --noEmit`): Exited 0 with 0 TypeScript errors.
- `npm run build` (`vite build && node build.js`): Successfully compiled bundle in 9.42s and bundled standalone server `dist/server.cjs` with exit code 0.
