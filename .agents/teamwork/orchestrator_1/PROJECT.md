# Project: VyomaPOS - Xtra Rooftop Dashboard Remediation

## Architecture
- Frontend: React 19 + TypeScript + Vite 6 + Tailwind CSS v4.
- Backend: Express + TSX / standalone `dist/server.cjs` + Supabase (PostgreSQL, Storage, Edge Functions).
- Hybrid/Mobile: Capacitor Android APK build pipeline.
- Testing: Vitest + happy-dom for unit & integration testing.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | R4-F1: CI/CD Workflow Relocation | Move `build-apk.yml` to `.github/workflows/build-apk.yml` | M1 | Survey (R4) |
| 2 | R4-F2: Untrack Excel Leads | Untrack `VyomPOS Leads.xlsx` via `git rm --cached` while keeping file on disk | M1 | Survey (R4) |
| 3 | R4-F3: Update Gitignore | Add `*.xlsx`, `*.xls`, `.vitest/`, `.nyc_output/`, `test-results/`, `*.tmp`, `tmp/`, `*.apk` to `.gitignore` | M1 | Survey (R4) |
| 4 | R2-F1: App Passwords Schema | Add `app_passwords` DDL, default seed credentials, and SELECT RLS policy to `supabase_schema.sql` | M2 | Survey (R2) |
| 5 | R2-F2: Expenses Schema | Consolidate `expenses` table DDL, indexes, and full CRUD RLS into `supabase_schema.sql` | M2 | Survey (R2) |
| 6 | R2-F3: Receipts Storage Schema | Add `receipts` public storage bucket insertion and storage RLS to `supabase_schema.sql` | M2 | Survey (R2) |
| 7 | R2-F4: Env Example Documentation | Add Google Sheets sync secrets (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `SPREADSHEET_ID`, `SHEET_RANGE`) to `.env.example` | M2 | Survey (R2) |
| 8 | R2-F5: README Documentation | Document Google Sheets sync setup and secrets in `README.md` | M2 | Survey (R2) |
| 9 | R1-F1: Auth Security DEV Restriction | Restrict demo passcodes ('1234', 'admin123', 'staff123') in `src/lib/authService.ts` strictly to `import.meta.env.DEV` | M3 | Survey (R1) |
| 10 | R1-F2: Auth Endpoint Resolution & Error Messages | Use `resolveApiUrl` for `/api/auth/verify` and update fallback messages to prevent demo passcode leakage | M3 | Survey (R1) |
| 11 | R3-F1: Invoicing Error Toast | Show clear `toast.error` when `/api/invoices` or persistence fails (`!res.ok`, `data.success === false`, or `data.success === '0'`) | M4 | Survey (R3) |
| 12 | R3-F2: Prevent False Success Modal | Halt execution on persistence failure; do not open receipt modal or emit `onOrderCreated` | M4 | Survey (R3) |
| 13 | R3-F3: Invoicing Endpoint Resolution | Route `/api/invoices` through `resolveApiUrl` for Capacitor Android compatibility | M4 | Survey (R3) |
| 14 | R5-F1: Pure GST Utility Extraction | Implement `calculateGst`, `validateGSTIN`, `normalizeGSTIN`, and `GSTIN_REGEX` in `src/utils/gst.ts` | M5 | Survey (R5) |
| 15 | R5-F2: Vitest Setup & Configuration | Install `vitest` + `happy-dom`, add `vitest.config.ts`, add `"test": "vitest run"` script to `package.json`, update `tsconfig.json` | M5 | Survey (R5) |
| 16 | R5-F3: GST Calculation Unit Tests | Test 5% GST, taxable subtotal, flat vs percent discount, rounding, CGST/SGST split in `src/__tests__/gst.test.ts` | M5 | Survey (R5) |
| 17 | R5-F4: GSTIN Format Validation Tests | Test 15-char Indian GSTIN regex, edge cases, lowercase normalization in `src/__tests__/gstin.test.ts` | M5 | Survey (R5) |
| 18 | R5-F5: Order Status Mapping Tests | Test status transitions (`pending`, `preparing`, `ready`, `completed`, `cancelled`) & aliases in `src/__tests__/orderStatus.test.ts` | M5 | Survey (R5) |
| 19 | R5-F6: Auth Verification Tests | Test dev fallback approval vs production rejection & database verification in `src/__tests__/authService.test.ts` | M5 | Survey (R5) |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Repository Cleanliness & CI/CD Organization (R4) | Move `build-apk.yml`, untrack `VyomPOS Leads.xlsx`, update `.gitignore` | none | DONE |
| 2 | Database Schema Consolidation & Documentation (R2) | Update `supabase_schema.sql`, `.env.example`, `README.md` | none | DONE |
| 3 | Authentication Security Hardening (R1) | Harden `src/lib/authService.ts` with `import.meta.env.DEV` & `resolveApiUrl` | M2 | DONE |
| 4 | Invoicing Transaction Integrity & Error Handling (R3) | Harden `src/components/invoices/InvoiceCreator.tsx` error toast & modal gating | none | DONE |
| 5 | Automated Testing Suite Setup (R5) | Setup Vitest, extract `src/utils/gst.ts`, implement tests in `src/__tests__/` | M1, M2, M3, M4 | DONE |

## Interface Contracts
### `src/utils/gst.ts` ↔ Invoicing & Testing Components
```typescript
export interface InvoiceItemInput {
  price: number;
  quantity: number;
}

export interface CalculateGstOptions {
  items: InvoiceItemInput[];
  discountType?: 'flat' | 'percent';
  discountValue?: number | string;
  gstRate?: number;       // default 5
  applyGst?: boolean;     // default true
}

export interface GstCalculationResult {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  gstRate: number;
  gstAmount: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  grandTotal: number;
}

export function calculateGst(options: CalculateGstOptions): GstCalculationResult;
export function validateGSTIN(gstin: string | null | undefined): boolean;
export function normalizeGSTIN(val: string | null | undefined): string;
export const GSTIN_REGEX: RegExp;
```

### `src/lib/authService.ts` ↔ Login & Captain UI
```typescript
export interface VerifyResult {
  success: boolean;
  message?: string;
}

// In dev (import.meta.env.DEV === true): demo passcodes ('1234', 'admin123', 'staff123') return { success: true }
// In prod (import.meta.env.DEV === false): demo passcodes fall through to /api/auth/verify or Supabase app_passwords
export function verifyStaffPassword(input: string): Promise<VerifyResult>;
export function verifyAdminPassword(input: string): Promise<VerifyResult>;
```

## Code Layout
- `.github/workflows/build-apk.yml` (CI/CD)
- `supabase_schema.sql` (Consolidated Supabase DDL, seed data, RLS)
- `.env.example` & `README.md` (Configuration & Documentation)
- `src/lib/authService.ts` (Authentication client service)
- `src/components/invoices/InvoiceCreator.tsx` (Invoicing UI & transaction handling)
- `src/utils/gst.ts` (Pure financial calculation & validation utilities)
- `src/__tests__/` (Vitest test suites):
  - `src/__tests__/setup.ts`
  - `src/__tests__/gst.test.ts`
  - `src/__tests__/gstin.test.ts`
  - `src/__tests__/orderStatus.test.ts`
  - `src/__tests__/authService.test.ts`
- `vitest.config.ts` (Root test configuration)
- `package.json` (Scripts and dependencies)
- `tsconfig.json` (TypeScript project configuration)
