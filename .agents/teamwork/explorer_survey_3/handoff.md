# Handoff Report: Automated Testing Suite Setup (Requirement R5)

**Agent**: explorer_survey_3 (Test and Build Explorer)  
**Type**: Hard Handoff (Investigation & Survey Complete)  
**Date**: 2026-10-06  
**Report Artifact**: `c:\Users\Anay0216\Documents\Coding\ScanServe_Dashboard-main\.agents\teamwork\explorer_survey_3\survey_report.md`  

---

## 1. Observation

1. **`package.json`**:
   - Lines 7–19: Current scripts are `"dev"`, `"build"`, `"start"`, `"preview"`, `"clean"`, `"lint"`, `"pack:win"`, `"cap:sync"`, `"apk:build"`, `"apk:install"`, `"apk:devices"`.
   - **No test script** exists (no `"test"` key).
   - Lines 20–58: Runtime dependencies include `"react": "^19.0.0"`, `"vite": "^6.2.0"`, `"typescript": "~5.8.2"`, `"@tailwindcss/vite": "^4.1.14"`.
   - Lines 59–71: Dev dependencies do **not** contain `vitest`, `jsdom`, or `happy-dom`.
2. **`vite.config.ts`**:
   - Lines 13–18: Path aliases define `@lib` as `./src/lib` and `@` as repo root `.`.
   - Lines 23–46: Rollup manual chunks define vendor splitting for `react-vendor`, `pdf-vendor`, `supabase-vendor`, `motion-vendor`, `icons-vendor`.
   - Uses `defineConfig` imported from `'vite'`.
3. **`tsconfig.json`**:
   - Lines 30–37: `"include": ["src", "components", "lib", "server", "server.ts", "vite.config.ts"]`.
   - Lines 18–19: `"types": ["vite/client", "node"]`.
   - Lines 20–27: `"paths": { "@/*": ["./*"], "@lib/*": ["./src/lib/*", "./lib/*"] }`.
4. **Baseline Tool Verification**:
   - Command `npm run lint` (`tsc --noEmit`) exited with code 0 (0 errors).
   - Command `npm run build` (`vite build && node build.js`) exited with code 0, producing `dist/` and `dist/server.cjs` in 6.23s.
   - Node runtime is `v24.18.0` and npm is `12.0.2`.
5. **Source Code for the 4 Test Areas**:
   - **GST Calculation**:
     - `src/components/invoices/InvoiceCreator.tsx` lines 79–101: Calculates `subtotal`, `discountAmount` (flat capped at subtotal vs percent capped at 100%), `taxableAmount = Math.max(0, subtotal - discountAmount)`, `gstAmount = taxableAmount * (gstRate / 100)`, `grandTotal = Math.round((taxableAmount + gstAmount) * 100) / 100`.
     - `src/components/Receipt.tsx` lines 53–63: Calculates `cgstRate = computedTaxRate / 2`, `sgstRate = computedTaxRate / 2`, `cgstAmount = subtotal * (cgstRate / 100)`, `sgstAmount = subtotal * (sgstRate / 100)`, `taxAmount = cgstAmount + sgstAmount`.
   - **GSTIN Format Validation**:
     - `src/App.tsx` line 2592: Defines `const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;`.
     - `src/App.tsx` line 2607: Cleans input with `val.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 15)`.
     - `src/components/invoices/InvoiceCreator.tsx` line 523: Clamps input to uppercase 15 characters.
   - **Order Status Mapping**:
     - `lib/dispatch-status.ts` lines 1–55: Exports `OrderStatus` type (`'pending' | 'preparing' | 'ready' | 'waiting for payment' | 'completed' | 'cancelled'`), `DynoMappedStatus` type (`'ACCEPTED' | 'PREPARING' | 'READY' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED'`), and `mapStatusToDyno` function.
     - `src/lib/dispatch-status.ts`: Re-exports `../../lib/dispatch-status`.
     - `src/lib/orderSync.ts` lines 2–8: Exports `DYNO_STATUS_MAP` mapping `pending -> ACCEPTED`, `preparing -> PREPARING`, `ready -> READY`, `completed -> DELIVERED`, `cancelled -> CANCELLED`.
   - **Auth Verification Logic**:
     - `src/lib/authService.ts` lines 10–12, 27–91, 97–161: Defines `verifyStaffPassword` and `verifyAdminPassword`. Lines 34 and 104 currently allow demo passcodes unconditionally. R1 requires gating with `import.meta.env.DEV`.
     - `server/routes/auth.ts` lines 76–114: Demonstrates strict server-side `/api/auth/verify` behavior validating against Supabase `app_passwords` table.

---

## 2. Logic Chain

1. From Observation 1, because `package.json` contains no `"test"` script and no testing libraries, Vitest must be installed as a dev dependency along with a DOM simulator to test browser/native-dependent code.
2. From Observation 4, the environment runs Node v24.18.0 and Vite 6.2.0. Vitest (v3.x) is the native test runner designed for Vite 6 and provides out-of-the-box support for TypeScript, Vite path aliases (`@` and `@lib`), and `import.meta.env`.
3. From Observation 2, `vite.config.ts` uses complex custom Rollup vendor chunking for production web/desktop builds. Placing test configuration in a separate `vitest.config.ts` ensures that `vite build` remains untouched and test configuration stays completely segregated.
4. From Observation 3 and 4, `tsconfig.json` includes `"src"`, which means test files in `src/__tests__/` will be analyzed by `tsc --noEmit` during `npm run lint`. To avoid missing type errors, test files must use explicit imports (`import { describe, it, expect, vi } from 'vitest'`) and `vitest.config.ts` must be included in `tsconfig.json`.
5. From Observation 5:
   - GST calculations and GSTIN regex are currently inlined within React component bodies (`InvoiceCreator.tsx`, `Receipt.tsx`, and `App.tsx`).
   - Extracting these into a dedicated utility file `src/utils/gst.ts` (`calculateGst`, `validateGSTIN`, `normalizeGSTIN`, `GSTIN_REGEX`) creates a decoupled, single source of truth that can be unit tested against all financial/tax rounding and validation edge cases without rendering heavy UI components.
   - Order status mapping is already modularized in `lib/dispatch-status.ts` and `src/lib/orderSync.ts` and can be directly imported and tested.
   - Auth verification in `src/lib/authService.ts` can be tested under both `DEV=true` (immediate approval for demo passcodes) and `DEV=false` (rejection when unconfigured, or verified via Supabase/server mocks) using Vitest environment stubs and mocks.

---

## 3. Caveats

1. **Read-Only Scope**: In accordance with the Explorer mandate, no dependencies were installed (`npm install` was not run) and no source files were modified.
2. **Interplay with Requirement R1**: In the existing codebase, `authService.ts` lines 34 and 104 have not yet been modified by the R1 implementer to check `import.meta.env.DEV`. The test suite for R5 is designed to test the R1-hardened behavior once R1 is applied.
3. **DOM Library Choice**: `happy-dom` is recommended over `jsdom` due to faster start times and lower dependency overhead, but `jsdom` is an equally viable alternative if preferred.

---

## 4. Conclusion

Requirement R5 can be implemented cleanly and reliably without breaking existing builds or linting.
The recommended implementation path:
1. Install `vitest` and `happy-dom` as dev dependencies.
2. Add `"test": "vitest run"` and `"test:watch": "vitest"` to `package.json`.
3. Add root `vitest.config.ts` and update `tsconfig.json` `"include"` to include it.
4. Create `src/utils/gst.ts` containing `calculateGst`, `validateGSTIN`, `normalizeGSTIN`, and `GSTIN_REGEX`.
5. Create test files in `src/__tests__/`:
   - `src/__tests__/setup.ts`
   - `src/__tests__/gst.test.ts`
   - `src/__tests__/gstin.test.ts`
   - `src/__tests__/orderStatus.test.ts`
   - `src/__tests__/authService.test.ts`
6. Run `npm test`, `npm run lint`, and `npm run build` to verify 100% pass rates.

---

## 5. Verification Method

To verify these findings and test the future implementation:

1. **Verify Baseline Quality Gates**:
   - `npm run lint` -> Confirms `tsc --noEmit` exits with code 0.
   - `npm run build` -> Confirms `vite build && node build.js` exits with code 0.
2. **Inspect Survey Report**:
   - View `c:\Users\Anay0216\Documents\Coding\ScanServe_Dashboard-main\.agents\teamwork\explorer_survey_3\survey_report.md` for complete matrices of test cases, edge cases, and code templates.
3. **Post-Implementation Verification Commands**:
   - `npm test` -> Must run Vitest and report 100% passing tests across all 4 suites.
   - `npm run lint` -> Must pass with 0 errors.
   - `npm run build` -> Must bundle cleanly in ~6s.
