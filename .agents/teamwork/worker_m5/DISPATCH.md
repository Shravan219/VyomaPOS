## 2026-10-06T04:56:58Z

You are worker_m5 (Automated Testing Suite Worker).
Your working directory is: c:\Users\Anay0216\Documents\Coding\VyomaPOS_Dashboard-main\.agents\teamwork\worker_m5

Authoritative user requirements are located at:
c:\Users\Anay0216\Documents\Coding\VyomaPOS_Dashboard-main\.agents\teamwork\ORIGINAL_REQUEST.md
You MUST read ORIGINAL_REQUEST.md before starting work.

Also read PROJECT.md at:
c:\Users\Anay0216\Documents\Coding\VyomaPOS_Dashboard-main\.agents\teamwork\orchestrator_1\PROJECT.md
And reference Explorer 3 findings and test matrices at:
c:\Users\Anay0216\Documents\Coding\VyomaPOS_Dashboard-main\.agents\teamwork\explorer_survey_3\survey_report.md

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Exclusively owned files:
- `package.json`
- `tsconfig.json`
- `vitest.config.ts`
- `src/utils/gst.ts`
- `src/__tests__/*`
DO NOT modify any other files in the project.

Your Objective (Milestone M5 / Requirement R5):
1. Install testing dependencies:
   Run `npm install -D vitest happy-dom`
2. Update `package.json`:
   Add scripts:
   `"test": "vitest run"`,
   `"test:watch": "vitest"`
3. Create root `vitest.config.ts`:
   Configure `happy-dom` environment, `@` and `@lib` aliases matching `vite.config.ts`, `globals: true`, setup file `./src/__tests__/setup.ts`, include `['src/**/*.{test,spec}.{ts,tsx}']`.
4. Update `tsconfig.json`:
   Add `"vitest.config.ts"` to the `"include"` array.
5. Create `src/utils/gst.ts`:
   Implement and export:
   - `calculateGst(options: CalculateGstOptions): GstCalculationResult` (pure function computing subtotal, discountAmount with flat capping at subtotal and percentage capping at 100%, taxableAmount, 5% default gstRate, gstAmount, cgstRate/Amount, sgstRate/Amount, grandTotal rounded to 2 decimals)
   - `validateGSTIN(gstin: string | null | undefined): boolean`
   - `normalizeGSTIN(val: string | null | undefined): string`
   - `GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/`
6. Create test suites in `src/__tests__/`:
   - `src/__tests__/setup.ts`: clear mocks, clear localStorage.
   - `src/__tests__/gst.test.ts`: test 5% GST on single/multiple items, flat discount below/above subtotal, percentage discounts (10%, 100%, >100%), 50/50 CGST and SGST split, decimal rounding, applyGst: false, empty items, defensive negative prices/quantities.
   - `src/__tests__/gstin.test.ts`: test 15-character Indian format regex, valid GSTINs from demo data (Maharashtra 27AABCS1429B1Z8, Karnataka 29AAAAA0000A1Z5, Delhi 07AAAAA0000A1Z5), too short, too long, 14th char not Z, invalid state code, lowercase normalization, empty/whitespace/null handling.
   - `src/__tests__/orderStatus.test.ts`: test order status mapping (`mapStatusToDyno` from `lib/dispatch-status.ts` / `src/lib/dispatch-status.ts`, and `DYNO_STATUS_MAP` from `src/lib/orderSync.ts`) covering pending -> ACCEPTED, preparing -> PREPARING, ready -> READY, completed -> DELIVERED, cancelled -> CANCELLED, plus aliases ('waiting for payment', 'in_kitchen', 'delivered', 'dispatched'), case insensitivity, whitespace, unknown fallback.
   - `src/__tests__/authService.test.ts`: test auth verification logic in `src/lib/authService.ts`. In DEV mode (`DEV=true`), demo passcodes ('1234', 'staff123', 'admin123') return `{ success: true }`. In PROD mode (`DEV=false`), demo passcodes do NOT bypass auth and are rejected unless verified via server `/api/auth/verify` mock or Supabase `app_passwords` mock. Also test empty/whitespace passwords.
7. Verification:
   - Run `npm test` and verify 100% of test suites and test cases PASS with 0 failures.
   - Run `npm run lint` and verify 0 TypeScript errors.
   - Run `npm run build` and verify clean production build succeeds without issues.
8. Deliverables:
   - Write `changes.md` in your working directory.
   - Write `handoff.md` with Observation, Logic Chain, Caveats, Conclusion, and Verification Method.
   - Send completion message to parent.
