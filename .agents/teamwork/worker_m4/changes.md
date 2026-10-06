# Code Changes — Milestone M4 / Requirement R3 (Invoicing Transaction Integrity)

**Worker**: worker_m4 (Invoicing Integrity Worker)  
**Date**: 2026-10-06  
**Modified Files**:
- `src/components/invoices/InvoiceCreator.tsx`

---

## 1. `src/components/invoices/InvoiceCreator.tsx`

### A. Dynamic API Endpoint Resolution
- **Import added**:
  ```typescript
  import { resolveApiUrl } from '@/src/lib/apiConfig';
  ```
- **Fetch URL routed**:
  Replaced static `fetch('/api/invoices', ...)` with:
  ```typescript
  const res = await fetch(resolveApiUrl('/api/invoices'), { ... });
  ```
  This guarantees that in Capacitor Android or remote POS configurations, the invoice POST request resolves to the configured POS server URL instead of attempting to resolve against the local Webview domain (`capacitor://localhost/api/invoices`).

### B. Transaction Failure Gating & Halting
- **Replaced warning-only logic with strict validation & halt**:
  *Previous flawed code*:
  ```typescript
  if (!res.ok || data.success === false) {
    console.warn('[Invoice API Response Notice]', data);
  }
  // Proceeded unconditionally to show success toast and open modal!
  ```
  *Hardened code*:
  ```typescript
  if (!res.ok || data.success === false || data.success === '0') {
    const errorMsg = data?.message || data?.error || (res.status ? `Server responded with status ${res.status}` : 'Could not persist invoice to database.');
    console.error('[Invoice API Error]:', data);
    toast.error('Invoice Creation Failed', {
      description: errorMsg || 'Could not persist invoice to database.'
    });
    return;
  }
  ```
- When backend returns HTTP errors (`!res.ok`), boolean failures (`data.success === false`), or backend status codes (`data.success === '0'`), execution immediately stops.
- `toast.error('Invoice Creation Failed', { description: ... })` is displayed to provide immediate operator feedback with the specific server error message.

### C. Receipt Modal & Callback Gating
- The success toast (`toast.success(...)`), state update (`setSavedInvoice(savedData)`), receipt modal opening (`setIsReceiptModalOpen(true)`), and optional state propagation callback (`onOrderCreated(savedData)`) now strictly execute ONLY when `/api/invoices` and database persistence have confirmed success.
- Form data and entered items are preserved on failure so the operator can retry without losing their work.

### D. Submitting State Resilience
- `setIsSubmitting(false)` remains in the `finally` block, ensuring that regardless of whether the request succeeds, returns early on persistence failure, or throws an unhandled network error, the submit button is unlocked and does not hang in a loading state.

---

## 2. Verification Summary
- **TypeScript Check (`npm run lint` / `tsc --noEmit`)**:
  Exited with code 0 (0 errors, 0 warnings).
- **Scope Compliance**:
  No files outside `src/components/invoices/InvoiceCreator.tsx` were modified.
