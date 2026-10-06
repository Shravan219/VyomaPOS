# Comprehensive Technical Survey Report: R1 (Auth Security) & R3 (Invoicing Transaction Integrity)

**Date**: 2026-10-06  
**Investigator**: `explorer_survey_1` (Auth & Invoicing Explorer)  
**Target Project**: Vyoma ScanServe Dashboard (`c:\Users\Anay0216\Documents\Coding\ScanServe_Dashboard-main`)  
**Scope**: Requirements R1 & R3 from `ORIGINAL_REQUEST.md`

---

## Executive Summary

This survey provides exhaustive codebase tracing, root cause analysis, and remediation specifications for two critical requirements:
1. **Requirement R1 (Authentication Security Hardening)**: Default demo passcodes (`'1234'`, `'admin123'`, `'staff123'`, etc.) are currently evaluated unconditionally with a 0ms bypass ahead of any database or API checks. This creates a severe backdoor in production environments. We have isolated the exact code paths in `src/lib/authService.ts`, verified how Vite's `import.meta.env.DEV` handles environment discrimination, and mapped the contract required for Supabase's `app_passwords` table and the `/api/auth/verify` endpoint.
2. **Requirement R3 (Invoicing Transaction Integrity & Error Handling)**: In `src/components/invoices/InvoiceCreator.tsx`, when invoice persistence to `/api/invoices` fails (`!res.ok` or `data.success === false`), the component currently emits only a `console.warn` notice and proceeds unconditionally to display a success toast, open the receipt modal, and propagate the unpersisted order into application state. We have pinpointed the exact lines and drafted the required halting logic and error notifications.

---

## 1. Requirement R1: Authentication Security Hardening

### 1.1 Problem Analysis & Current Vulnerability

In `src/lib/authService.ts`:
- **Line 10**: `const DEFAULT_ADMIN_PASSWORDS = ['admin123', '1234', 'admin', 'vyoma2026'];`
- **Line 11**: `const DEFAULT_STAFF_PASSWORDS = ['staff123', '1234', 'staff', 'captain123'];`
- **Lines 33–36** in `verifyStaffPassword`:
  ```typescript
  // 1. Instant check for standard demo & default passcodes (0ms latency)
  if (DEFAULT_STAFF_PASSWORDS.includes(trimmed) || DEFAULT_ADMIN_PASSWORDS.includes(trimmed)) {
    return { success: true, message: 'Access Granted' };
  }
  ```
- **Lines 103–106** in `verifyAdminPassword`:
  ```typescript
  // 1. Instant check for standard admin demo & default passcodes (0ms latency)
  if (DEFAULT_ADMIN_PASSWORDS.includes(trimmed)) {
    return { success: true, message: 'Access Granted' };
  }
  ```

#### Vulnerability Assessment
Because Step 1 executes unconditionally prior to any server or Supabase validation:
- Any user or unauthorized actor on a client terminal running in production can enter `'1234'`, `'admin123'`, or `'staff123'` and gain immediate administrative or staff access, bypassing customer credentials configured in Supabase.
- Even if a client configures custom passwords in their Supabase `app_passwords` table, the default passwords remain universally valid backdoors.
- In lines 90 and 160, the fallback error messages explicitly prompt: `"Use default (1234 / staff123) or configure in Supabase."`, further exposing the hardcoded backdoors to end users.

### 1.2 Authentication Entry Points & Usage Across the App

The functions `verifyStaffPassword` and `verifyAdminPassword` are consumed in two primary UI locations:
1. **`src/App.tsx` (Lines 494–512, 1149–1197)**:
   - Controls staff gatekeeper terminal authentication (`!isAuthenticated`).
   - Calls `await verifyStaffPassword(password)`.
   - On success: stores `'vyoma_staff_authenticated' = 'true'` in `localStorage`, sets `isAuthenticated(true)`.
2. **`src/components/captain/CaptainDashboard.tsx` (Lines 243–265)**:
   - Controls Kiosk Lock / Unlock mode (locking the terminal strictly to Captain Desk vs full dashboard).
   - Calls `await verifyAdminPassword(passwordInput.trim())`.
   - On success: updates `isKioskLocked`.

### 1.3 Server-Side & Supabase Schema Verification Flow

There are two verification avenues available for production authentication:

#### A. Backend Server Route (`server/routes/auth.ts`)
- Mounted in `server/app.ts` at `/api/auth` (Line 35: `app.use('/api/auth', authRouter);`).
- Exported as Vercel serverless function via `api/index.ts` -> `server/app.ts`.
- **`POST /api/auth/verify`**:
  - Accepts body `{ type: 'staff' | 'admin', password: string }`.
  - Queries `app_passwords` in Supabase using `getSupabaseClient()`:
    - Admin keys checked: `'admin_password'`, `'admin'`, `'adminpassword'`.
    - Staff keys checked: `'staff_password'`, `'staff'`, `'staffpassword'`.
  - Compares `input === dbPassword`.
  - If match: Returns HTTP 200 `{ success: true, type, message: 'Password verified successfully against Supabase app_passwords table' }`.
  - If no match or DB empty: Returns HTTP 401 `{ success: false, message: ... }`.
  - Enforces: **No hardcoded fallbacks** on backend.

#### B. Direct Client Supabase Query (`src/lib/authService.ts` Lines 64–88, 134–158)
- Executes if `isSupabaseConfigured` is true (valid `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).
- Queries `supabase.from('app_passwords').select('*')` with a 2000ms timeout race.
- Matches row keys (`staff_password`, `admin_password`) and values (`password`, `value`, `pass`).

#### C. Database Schema Contract (`public.app_passwords`)
For production verification to function properly, the Supabase schema requires:
```sql
CREATE TABLE IF NOT EXISTS public.app_passwords (
    id UUID DEFAULT uuid_generate_v4() NOT NULL,
    key TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT app_passwords_pkey PRIMARY KEY (id)
);

ALTER TABLE public.app_passwords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to app_passwords"
ON public.app_passwords FOR SELECT
USING (true);
```

### 1.4 Environment Mode Handling (`import.meta.env.DEV`)

- In Vite, `import.meta.env.DEV` is a boolean:
  - `true` when running via `vite` / `npm run dev`.
  - `false` when compiled via `vite build` (`npm run build`).
- During production builds (`vite build`), Vite statically replaces `import.meta.env.DEV` with `false`. Dead code elimination (DCE) in Rollup strips the conditional branch containing demo credentials out of the production bundle.
- In Vitest unit testing, `import.meta.env.DEV` is supported natively and can be stubbed via `vi.stubEnv('DEV', false)` to test both development fallbacks and production rejections.
- To prevent type or runtime errors across Node and bundlers, `Boolean(import.meta.env && import.meta.env.DEV)` is 100% safe and typed under `"types": ["vite/client", "node"]` in `tsconfig.json`.

### 1.5 Precise Remediation Plan for `src/lib/authService.ts`

1. **Gate demo passcodes strictly inside `if (import.meta.env.DEV)`**:
   - In `verifyStaffPassword`:
     ```typescript
     // 1. Instant check for standard demo & default passcodes (development mode only)
     if (import.meta.env.DEV) {
       if (DEFAULT_STAFF_PASSWORDS.includes(trimmed) || DEFAULT_ADMIN_PASSWORDS.includes(trimmed)) {
         return { success: true, message: 'Access Granted (Dev Mode)' };
       }
     }
     ```
   - In `verifyAdminPassword`:
     ```typescript
     // 1. Instant check for standard admin demo & default passcodes (development mode only)
     if (import.meta.env.DEV) {
       if (DEFAULT_ADMIN_PASSWORDS.includes(trimmed)) {
         return { success: true, message: 'Access Granted (Dev Mode)' };
       }
     }
     ```

2. **Network endpoint resolution using `resolveApiUrl`**:
   - Update line 3 to import `resolveApiUrl`:
     `import { getApiBaseUrl, resolveApiUrl } from './apiConfig';`
   - In lines 45 and 115, replace `fetch('/api/auth/verify', ...)` with:
     `fetch(resolveApiUrl('/api/auth/verify'), ...)`
   - This ensures mobile Android APKs (via Capacitor) communicate with the POS server IP rather than attempting to resolve `capacitor://localhost/api/auth/verify`.

3. **Production-safe fallback error messages**:
   - Lines 90 and 160:
     ```typescript
     return {
       success: false,
       message: import.meta.env.DEV
         ? 'Invalid Passcode. Use default (1234 / staff123) or configure in Supabase.'
         : 'Invalid Passcode. Credentials not found or invalid in database.'
     };
     ```
     and
     ```typescript
     return {
       success: false,
       message: import.meta.env.DEV
         ? 'Invalid Admin Passcode. Use default (1234 / admin123) or configure in Supabase.'
         : 'Invalid Admin Passcode. Credentials not found or invalid in database.'
     };
     ```

---

## 2. Requirement R3: Invoicing Transaction Integrity & Error Handling

### 2.1 Problem Analysis & Current Bug

In `src/components/invoices/InvoiceCreator.tsx`:
- Submission handler `handleGenerateInvoice` runs when clicking "Issue & Save Invoice".
- Lines 274–290 initiate POST request to `/api/invoices`.
- **Lines 292–295**:
  ```typescript
  if (!res.ok || data.success === false) {
    console.warn('[Invoice API Response Notice]', data);
  }
  ```
- **Lines 297–323**:
  ```typescript
  // Success
  toast.success(`Invoice #${randomToken} created & saved to database!`, {
    description: `Grand Total: ₹${grandTotal.toFixed(2)} (${paymentMode})`
  });

  const savedData: SavedInvoiceData = { ... };

  setSavedInvoice(savedData);
  setIsReceiptModalOpen(true);

  if (onOrderCreated) {
    onOrderCreated(savedData);
  }
  ```

#### Critical Flaw
1. When `/api/invoices` returns a failure (e.g. HTTP 400, 500, network error response, or `{ success: false, message: 'Database write error' }`):
   - The conditional block `if (!res.ok || data.success === false)` **does not return or halt execution**.
   - It merely logs a warning to the browser console.
2. The code immediately continues to:
   - Display a green success toast claiming the order was created and saved to the database.
   - Set `savedInvoice` state.
   - Open the receipt modal (`setIsReceiptModalOpen(true)`).
   - Call `onOrderCreated(savedData)`.
3. In `src/App.tsx` (lines 2337–2352), `onOrderCreated` inserts the unpersisted order into `orders` and `allOrders` React state.
4. If the page is subsequently refreshed or another terminal looks at the database, the order does not exist, causing reconciliation discrepancy, lost orders, and erroneous receipts printed for customers.

### 2.2 Invoicing API Flow & Expected Backend Responses

`POST /api/invoices` is handled as follows:
1. `server/app.ts` line 42: `app.use('/api/invoices', ordersRouter);`
2. `server/routes/orders.ts` line 127: `router.post(['/', '/create', '/webhook'], ...)` invokes `processWebhookPayload(...)`.
3. `server/processWebhook.ts`:
   - Persists order in memory (`saveMemoryOrder`).
   - Attempts Supabase database insert to `public.orders`.
   - On success (line 607): Returns HTTP 200 with `{ success: '1', message: 'Order saved successfully', order_id: ... }`.
   - On error (line 622): Returns HTTP 500 with `{ success: '0', status: 'error', message: ... }`.
4. Other server error paths (e.g. `orders.ts` line 136) return: `{ success: false, message: err?.message || 'Error processing order' }`.

Therefore, a failed persistence is indicated whenever:
- `!res.ok` (HTTP status < 200 or >= 300)
- `data.success === false`
- `data.success === '0'`

### 2.3 Sonner Toast Integration & UX Specifications

In `InvoiceCreator.tsx`:
- Toast service used is `toast` from `'sonner'` (Line 24).
- The root `<Toaster position="top-center" theme="dark" richColors />` is active in `App.tsx` (Line 1194).
- When persistence fails, the UI must:
  1. Halt execution immediately (`return`).
  2. Prevent the receipt modal from opening (`isReceiptModalOpen` remains `false`).
  3. Prevent form reset or state corruption so the operator does not lose the entered items.
  4. Fire `toast.error` with a descriptive message extracted from `data.message || data.error || resText || 'Failed to persist invoice to database.'`.
  5. Set `isSubmitting` back to `false` in the `finally` block so the "Issue & Save Invoice" button re-enables.

### 2.4 Precise Remediation Plan for `src/components/invoices/InvoiceCreator.tsx`

1. **Add API endpoint resolution**:
   - Import `resolveApiUrl`:
     `import { resolveApiUrl } from '@/src/lib/apiConfig';`
   - Update line 275:
     ```typescript
     const targetUrl = resolveApiUrl('/api/invoices');
     const res = await fetch(targetUrl, { ... });
     ```

2. **Replace lines 292–295 with strict gating and error toast**:
   ```typescript
   if (!res.ok || data.success === false || data.success === '0') {
     const errorMsg = data?.message || data?.error || `Server responded with status ${res.status}`;
     console.error('[Invoice API Error]:', data);
     toast.error('Invoice Creation Failed', {
       description: errorMsg || 'Could not persist invoice to database.'
     });
     return;
   }
   ```

3. **Verify the success sequence only triggers when persistence succeeded**:
   ```typescript
   // 2. Only reached if API and database write succeeded
   toast.success(`Invoice #${randomToken} created & saved to database!`, {
     description: `Grand Total: ₹${grandTotal.toFixed(2)} (${paymentMode})`
   });

   const savedData: SavedInvoiceData = {
     id: invoiceId,
     token: `#${randomToken}`,
     customer_name: finalCustomerName,
     customer_phone: finalCustomerPhone,
     items: formattedItems,
     subtotal,
     tax_amount: gstAmount,
     tax_rate: applyGst ? gstRate : 0,
     discount: discountAmount,
     total: grandTotal,
     payment_mode: paymentMode,
     table_id: finalTableId,
     created_at: new Date().toISOString(),
     gstin: gstin.trim() || undefined
   };

   setSavedInvoice(savedData);
   setIsReceiptModalOpen(true);

   if (onOrderCreated) {
     onOrderCreated(savedData);
   }
   ```

---

## 3. Cross-Cutting Insights & Testing Requirements (R5 Compatibility)

### 3.1 Auth Verification Unit Testing Strategy
Requirement R5 specifies:
> "Auth verification logic (testing dev fallback vs production rejection)"

With the R1 remediation in place:
1. **In Dev Mode Test**:
   - `import.meta.env.DEV = true`
   - Calling `verifyStaffPassword('1234')` resolves `{ success: true }`.
   - Calling `verifyAdminPassword('admin123')` resolves `{ success: true }`.
2. **In Production Mode Test**:
   - Stub `import.meta.env.DEV = false` (or `vi.stubEnv('DEV', false)`).
   - Mock fetch and Supabase client to return no matching rows.
   - Calling `verifyStaffPassword('1234')` resolves `{ success: false }`.
   - Calling `verifyAdminPassword('admin123')` resolves `{ success: false }`.
   - Calling with a valid password stored in mocked Supabase `app_passwords` resolves `{ success: true }`.

### 3.2 Invoicing Calculations & Validations (for R5 Tests)
`InvoiceCreator.tsx` contains standard calculation logic that aligns with R5 test requirements:
1. **GST Calculation**:
   - Subtotal = $\sum (\text{item.price} \times \text{item.quantity})$
   - Percent Discount = $(\text{subtotal} \times \min(100, \text{discountValue})) / 100$
   - Flat Discount = $\min(\text{subtotal}, \text{discountValue})$
   - Taxable Subtotal = $\max(0, \text{subtotal} - \text{discount})$
   - GST (5%) = $\text{taxableAmount} \times 0.05$
   - Grand Total = $\text{round}((\text{taxableAmount} + \text{gstAmount}) \times 100) / 100$
2. **GSTIN Regex**:
   - `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`
   - 15 alphanumeric characters adhering to Indian GSTIN specifications.
3. **Status Mapping**:
   - In `src/lib/orderSync.ts`:
     `pending` $\rightarrow$ `ACCEPTED`  
     `preparing` $\rightarrow$ `PREPARING`  
     `ready` $\rightarrow$ `READY`  
     `completed` $\rightarrow$ `DELIVERED`  
     `cancelled` $\rightarrow$ `CANCELLED`  

---

## 4. Summary of Files to Modify (Read-Only Proposal for Implementer)

| File Path | Lines Affected | Nature of Change |
|---|---|---|
| `src/lib/authService.ts` | 33–36, 45, 90, 103–106, 115, 160 | Enforce `import.meta.env.DEV` wrapper around default passcodes; use `resolveApiUrl`; update fallback messages. |
| `src/components/invoices/InvoiceCreator.tsx` | 275, 292–295 | Use `resolveApiUrl`; halt execution on `!res.ok \|\| data.success === false \|\| data.success === '0'`; fire `toast.error`; prevent premature receipt modal trigger. |
