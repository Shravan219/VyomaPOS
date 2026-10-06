# Survey Report: Automated Testing Suite Setup (Requirement R5)

**Agent**: explorer_survey_3 (Test and Build Explorer)  
**Date**: 2026-10-06  
**Target Milestone**: Survey and Architecture for Requirement R5  
**Working Directory**: `c:\Users\Anay0216\Documents\Coding\ScanServe_Dashboard-main\.agents\teamwork\explorer_survey_3`  

---

## 1. Executive Summary

This report provides an exhaustive, read-only architectural investigation for **Requirement R5: Automated Testing Suite Setup** in the Vyoma ScanServe Dashboard repository, as specified in `ORIGINAL_REQUEST.md`.

### Core Findings
1. **Existing Test Infrastructure**: Currently, the repository has **no test runner, no test scripts, and zero test files** in `src/`. `package.json` contains no `"test"` script.
2. **Baseline Build & Lint Health**:
   - `npm run lint` (`tsc --noEmit`) currently passes with **0 errors**.
   - `npm run build` (`vite build && node build.js`) builds cleanly in ~6.2s, generating frontend chunks in `dist/` and standalone backend server in `dist/server.cjs`.
3. **Tooling & Runtime**:
   - Node runtime: `v24.18.0`, npm: `12.0.2`.
   - Vite version: `^6.2.0`, React: `^19.0.0`, TypeScript: `~5.8.2`.
   - Vitest is the ideal test runner due to native alignment with Vite 6, built-in ESM/TS support, and fast execution.
4. **The 4 Required Test Areas**:
   - **GST Calculation**: Currently inlined inside React components (`src/components/invoices/InvoiceCreator.tsx` lines 79–101 and `src/components/Receipt.tsx` lines 53–63). We recommend extracting this into a dedicated, pure helper `src/utils/gst.ts` to enable comprehensive unit testing and eliminate component duplication.
   - **GSTIN Format Validation**: Regex `/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/` is currently inlined in `src/App.tsx` (line 2592). It should be exported from `src/utils/gst.ts` as `validateGSTIN` and `normalizeGSTIN`.
   - **Order Status Mapping**: Already implemented in `lib/dispatch-status.ts` (`mapStatusToDyno`), re-exported in `src/lib/dispatch-status.ts`, and defined as `DYNO_STATUS_MAP` in `src/lib/orderSync.ts`.
   - **Auth Verification Logic**: Located in `src/lib/authService.ts`. Currently, demo passcodes (`1234`, `admin123`, `staff123`) bypass auth unconditionally (lines 34 & 104). Requirement R1 will gate these behind `import.meta.env.DEV`. The test suite must test dev fallback (immediate approval) vs production mode (rejection unless authorized via Supabase or `/api/auth/verify`).

---

## 2. Repository Configuration & Build Tooling Analysis

### 2.1 `package.json` Inspection
- **Current Scripts**:
  ```json
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build && node build.js",
    "start": "node dist/server.cjs",
    "preview": "vite preview",
    "clean": "rimraf dist release || exit 0",
    "lint": "tsc --noEmit",
    "pack:win": "...",
    "cap:sync": "vite build && cap sync android",
    "apk:build": "...",
    "apk:install": "node scripts/install-apk.cjs",
    "apk:devices": "node scripts/install-apk.cjs --devices-only"
  }
  ```
  - **Notice**: No `"test"` script exists.
  - Adding `"test": "vitest run"` and `"test:watch": "vitest"` will satisfy Requirement R5 and acceptance criteria.
- **Dependencies**:
  - React 19 (`"react": "^19.0.0"`, `"react-dom": "^19.0.0"`).
  - Vite (`"vite": "^6.2.0"`), TypeScript (`"typescript": "~5.8.2"`).
  - Tailwind CSS v4 with `@tailwindcss/vite` (`^4.1.14`).

### 2.2 `vite.config.ts` Inspection
- Defined using `defineConfig` from `'vite'`.
- Configures path aliases:
  - `@lib`: `./src/lib`
  - `@`: `.` (repo root)
- Configures custom Rollup `manualChunks` splitting for vendors: `pdf-vendor`, `supabase-vendor`, `motion-vendor`, `icons-vendor`, `react-vendor`.
- **Architectural Decision**: Keep `vite.config.ts` dedicated to production building. Create a separate `vitest.config.ts` in the project root. This avoids adding test-specific plugins or types to the production bundle pipeline and ensures `vite build` continues without any overhead or typing ambiguities.

### 2.3 `tsconfig.json` Inspection
- Options:
  ```json
  "target": "ES2022",
  "module": "ESNext",
  "moduleResolution": "bundler",
  "types": ["vite/client", "node"],
  "paths": {
    "@/*": ["./*"],
    "@lib/*": ["./src/lib/*", "./lib/*"]
  },
  "include": [
    "src",
    "components",
    "lib",
    "server",
    "server.ts",
    "vite.config.ts"
  ]
  ```
- **Type Checking Invariant**:
  - `npm run lint` executes `tsc --noEmit`.
  - Because `"src"` is listed under `"include"`, any test files placed in `src/__tests__/` or `src/tests/` **will be typechecked by `tsc --noEmit`**.
  - To prevent TypeScript errors:
    1. Every test file should explicitly import Vitest functions (`import { describe, it, expect, vi, beforeEach } from 'vitest';`). This guarantees full type definitions without relying on global namespace pollution.
    2. Add `"vitest.config.ts"` to `tsconfig.json`'s `"include"` list (alongside `"vite.config.ts"`).

### 2.4 `.gitignore` Inspection
- Line 5 already contains `coverage/`.
- Temporary Vitest cache directories (`.vitest/`) can also be added if needed, complying with Requirement R4.

---

## 3. Recommended Vitest Packages & Configuration

### 3.1 Recommended Packages (DevDependencies)
To support testing the 4 required areas cleanly and quickly:
1. `vitest` (latest compatible with Vite 6, e.g. `^3.0.0` or `^3.1.0`): The core test runner.
2. `happy-dom` (`^16.0.0` or `^17.0.0`): Fast, lightweight DOM / browser simulation providing `window`, `document`, `localStorage`, and Web APIs needed by `authService.ts` and `apiConfig.ts`. (Much faster and lighter than `jsdom` with zero binary dependencies).

*(Optional)* `@testing-library/react` and `@testing-library/jest-dom` can be added if React component rendering tests are needed, but for unit/integration testing of the 4 required areas, pure logic and service testing in `happy-dom` provides 100% test coverage with sub-second execution.

### 3.2 Recommended `vitest.config.ts`
Place this file in the project root:
```ts
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@lib': path.resolve(__dirname, './src/lib'),
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/**', 'dist/**', 'release/**', 'src/__tests__/**'],
    },
  },
});
```

### 3.3 Test Environment Setup (`src/__tests__/setup.ts`)
```ts
import { beforeEach, vi } from 'vitest';

// Reset mocks and storage between tests
beforeEach(() => {
  vi.clearAllMocks();
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
});
```

---

## 4. Deep-Dive Investigation of the 4 Required Test Areas

### Area 1: GST Calculation (5% Tax, Taxable Subtotal, Flat vs. Percentage Discounts, Rounding)

#### Current Code Observations:
- In `src/components/invoices/InvoiceCreator.tsx` (lines 78–101):
  ```ts
  const subtotal = useMemo(() => {
    return items.reduce((acc, it) => acc + (Math.max(0, it.price) * Math.max(1, it.quantity)), 0);
  }, [items]);

  const discountAmount = useMemo(() => {
    const rawVal = parseFloat(discountValue) || 0;
    if (rawVal <= 0) return 0;
    if (discountType === 'percent') {
      return (subtotal * Math.min(100, rawVal)) / 100;
    }
    return Math.min(subtotal, rawVal);
  }, [subtotal, discountValue, discountType]);

  const taxableAmount = Math.max(0, subtotal - discountAmount);

  const gstAmount = useMemo(() => {
    if (!applyGst || gstRate <= 0) return 0;
    return taxableAmount * (gstRate / 100);
  }, [applyGst, gstRate, taxableAmount]);

  const grandTotal = useMemo(() => {
    return Math.round((taxableAmount + gstAmount) * 100) / 100;
  }, [taxableAmount, gstAmount]);
  ```
- In `src/components/Receipt.tsx` (lines 53–63):
  ```ts
  const hasGstin = !!gstin && gstin.trim().length > 0;
  const computedTaxRate = Number(taxRate);
  const cgstRate = computedTaxRate / 2;
  const sgstRate = computedTaxRate / 2;

  const cgstAmount = hasGstin ? subtotal * (cgstRate / 100) : 0;
  const sgstAmount = hasGstin ? subtotal * (sgstRate / 100) : 0;
  const taxAmount = cgstAmount + sgstAmount;
  const grandTotal = hasGstin ? subtotal + taxAmount : subtotal;
  ```

#### Recommended Architecture:
Extract into `src/utils/gst.ts` (or `src/lib/gst.ts`):
```ts
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

export function calculateGst({
  items = [],
  discountType = 'flat',
  discountValue = 0,
  gstRate = 5,
  applyGst = true,
}: CalculateGstOptions): GstCalculationResult {
  const subtotal = items.reduce((acc, it) => {
    const price = Math.max(0, Number(it.price) || 0);
    const quantity = Math.max(1, Number(it.quantity) || 1);
    return acc + (price * quantity);
  }, 0);

  const rawVal = typeof discountValue === 'string' ? parseFloat(discountValue) || 0 : Number(discountValue) || 0;
  let discountAmount = 0;
  if (rawVal > 0) {
    if (discountType === 'percent') {
      discountAmount = (subtotal * Math.min(100, rawVal)) / 100;
    } else {
      discountAmount = Math.min(subtotal, rawVal);
    }
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const effectiveGstRate = applyGst && gstRate > 0 ? gstRate : 0;
  const gstAmount = taxableAmount * (effectiveGstRate / 100);

  const cgstRate = effectiveGstRate / 2;
  const sgstRate = effectiveGstRate / 2;
  const cgstAmount = gstAmount / 2;
  const sgstAmount = gstAmount / 2;

  const grandTotal = Math.round((taxableAmount + gstAmount) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    gstRate: effectiveGstRate,
    gstAmount: Math.round(gstAmount * 100) / 100,
    cgstRate,
    cgstAmount: Math.round(cgstAmount * 100) / 100,
    sgstRate,
    sgstAmount: Math.round(sgstAmount * 100) / 100,
    grandTotal
  };
}
```

#### Test Cases Matrix for GST Calculation (`src/__tests__/gst.test.ts`):
| # | Scenario | Inputs | Expected Output |
|---|---|---|---|
| 1 | Standard 5% GST on single item | Item: ₹100 x 1, no discount, 5% GST | Subtotal: 100, Taxable: 100, GST: 5.00, Grand Total: 105.00 |
| 2 | Standard 5% GST on multiple items | Item A: ₹150 x 2, Item B: ₹50 x 1 | Subtotal: 350, Taxable: 350, GST: 17.50, Grand Total: 367.50 |
| 3 | Flat discount below subtotal | Subtotal: ₹200, Flat Discount: ₹50 | Discount: 50, Taxable: 150, 5% GST: 7.50, Grand Total: 157.50 |
| 4 | Flat discount exceeding subtotal | Subtotal: ₹200, Flat Discount: ₹300 | Discount capped at 200, Taxable: 0, GST: 0, Grand Total: 0 |
| 5 | Percentage discount (10%) | Subtotal: ₹500, Percent Discount: 10% | Discount: 50, Taxable: 450, 5% GST: 22.50, Grand Total: 472.50 |
| 6 | 100% percentage discount | Subtotal: ₹500, Percent Discount: 100% | Discount: 500, Taxable: 0, GST: 0, Grand Total: 0 |
| 7 | Percentage discount > 100% | Subtotal: ₹500, Percent Discount: 150% | Discount capped at 100% (500), Taxable: 0, GST: 0, Grand Total: 0 |
| 8 | CGST and SGST 50/50 split | Taxable: ₹100, 5% GST | CGST Rate: 2.5%, CGST: 2.50, SGST Rate: 2.5%, SGST: 2.50 |
| 9 | Decimal precision / rounding | Items: 3 x ₹33.33 = ₹99.99, 5% GST = ₹4.9995 | GST rounded to 5.00, Grand Total: 104.99 |
| 10 | GST disabled (`applyGst: false`) | Subtotal: ₹200, applyGst: false | GST: 0, Grand Total: 200 |
| 11 | Empty items list | Items: [] | Subtotal: 0, Taxable: 0, GST: 0, Grand Total: 0 |
| 12 | Negative price or invalid quantities | Price: -50, Quantity: -2 | Handled defensively (price: 0, qty min 1) -> Subtotal: 0 |

---

### Area 2: GSTIN Format Validation (15-Character Indian Format Regex)

#### Current Code Observations:
- In `src/App.tsx` (line 2592):
  ```ts
  const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  const isValidGstin = !receiptGstin || GSTIN_REGEX.test(receiptGstin);
  ```
- In `src/App.tsx` (line 2607):
  ```ts
  const cleaned = val.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 15);
  ```
- In `src/components/invoices/InvoiceCreator.tsx` (line 523):
  ```ts
  onChange={(e) => setGstin(e.target.value.toUpperCase().slice(0, 15))}
  ```

#### GSTIN Structure Breakdown:
- `^[0-9]{2}`: 2 digits for Indian State Code (01 to 37).
- `[A-Z]{5}`: 5 uppercase letters for PAN first 5 characters.
- `[0-9]{4}`: 4 digits for PAN sequential number.
- `[A-Z]{1}`: 1 uppercase letter for PAN check digit.
- `[1-9A-Z]{1}`: 1 entity number of same PAN holder in state.
- `Z`: 14th character must strictly be `'Z'`.
- `[0-9A-Z]{1}$`: 1 checksum character (alphanumeric).
Total: exactly 15 characters.

#### Recommended Utility Functions (`src/utils/gst.ts`):
```ts
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export function validateGSTIN(gstin: string | null | undefined): boolean {
  if (!gstin) return false;
  return GSTIN_REGEX.test(gstin.trim().toUpperCase());
}

export function normalizeGSTIN(val: string | null | undefined): string {
  if (!val) return '';
  return val.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 15);
}
```

#### Test Cases Matrix for GSTIN Validation (`src/__tests__/gstin.test.ts`):
| # | Scenario | Test Input | Expected Result | Reason |
|---|---|---|---|---|
| 1 | Valid Maharashtra GSTIN (from demoData) | `27AABCS1429B1Z8` | `true` | Matches all 15 chars, state 27, PAN AABCS1429B, '1', 'Z', '8' |
| 2 | Valid Karnataka GSTIN (from demoData) | `29AAAAA0000A1Z5` | `true` | Valid state 29, PAN AAAAA0000A, '1', 'Z', '5' |
| 3 | Valid Maharashtra GSTIN 2 | `27AAACG0561F1ZV` | `true` | Valid checksum 'V' |
| 4 | Valid Delhi GSTIN | `07AAAAA0000A1Z5` | `true` | Valid state 07 |
| 5 | String too short (14 chars) | `27AABCS1429B1Z` | `false` | Length is 14 |
| 6 | String too long (16 chars) | `27AABCS1429B1Z89` | `false` | Length is 16 |
| 7 | 14th character is not 'Z' | `27AABCS1429B1A8` | `false` | 14th char is 'A' instead of 'Z' |
| 8 | Invalid state code (letters) | `XXAABCS1429B1Z8` | `false` | State code must be 2 digits |
| 9 | Invalid PAN (digits in letters part) | `27123451429B1Z8` | `false` | PAN chars 1-5 must be letters |
| 10 | Special characters included | `27-AABCS1429-B1Z` | `false` | Hyphens not allowed |
| 11 | Empty string / whitespace | `""`, `"   "` | `false` | Missing input |
| 12 | Null / undefined | `null`, `undefined` | `false` | Falsy input |
| 13 | Lowercase handling | `27aabcs1429b1z8` | `true` with `validateGSTIN` (auto-uppercased) | Normalizes case |
| 14 | Normalization function test | `" 27aabcs-1429b1z8 "` | `"27AABCS1429B1Z8"` | Strips spaces, hyphens, uppercases |

---

### Area 3: Order Status Mapping (pending, preparing, ready, completed, cancelled)

#### Current Code Observations:
- In `lib/dispatch-status.ts` (lines 1–55) and `src/lib/dispatch-status.ts`:
  ```ts
  export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'waiting for payment' | 'completed' | 'cancelled';
  export type DynoMappedStatus = 'ACCEPTED' | 'PREPARING' | 'READY' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';

  export function mapStatusToDyno(status: OrderStatus | string): DynoMappedStatus {
    const normalized = String(status || '').toLowerCase().trim();
    switch (normalized) {
      case 'pending':
      case 'accepted':
        return 'ACCEPTED';
      case 'preparing':
      case 'in_kitchen':
        return 'PREPARING';
      case 'ready':
      case 'waiting for payment':
      case 'waiting_for_payment':
        return 'READY';
      case 'dispatched':
        return 'DISPATCHED';
      case 'completed':
      case 'delivered':
        return 'DELIVERED';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return 'ACCEPTED';
    }
  }
  ```
- In `src/lib/orderSync.ts` (lines 1–9):
  ```ts
  export const DYNO_STATUS_MAP = {
    pending: 'ACCEPTED',
    preparing: 'PREPARING',
    ready: 'READY',
    completed: 'DELIVERED',
    cancelled: 'CANCELLED'
  } as const;
  ```
- In `src/App.tsx` (lines 2301–2313):
  - Transition flow:
    - `pending` -> `preparing` (action: "Accept & Fire")
    - `preparing` -> `ready` (action: "Mark Ready")
    - `ready` -> `completed` (action: "Handover to Rider")
    - `completed` -> `completed` (action: "Handed Over")
    - `cancelled` -> terminal state

#### Test Cases Matrix for Order Status Mapping (`src/__tests__/orderStatus.test.ts`):
| # | Test Target | Input Status | Expected Mapped Status | Notes |
|---|---|---|---|---|
| 1 | `mapStatusToDyno` | `'pending'` | `'ACCEPTED'` | Core status 1 |
| 2 | `mapStatusToDyno` | `'preparing'` | `'PREPARING'` | Core status 2 |
| 3 | `mapStatusToDyno` | `'ready'` | `'READY'` | Core status 3 |
| 4 | `mapStatusToDyno` | `'completed'` | `'DELIVERED'` | Core status 4 |
| 5 | `mapStatusToDyno` | `'cancelled'` | `'CANCELLED'` | Core status 5 |
| 6 | `mapStatusToDyno` | `'waiting for payment'` | `'READY'` | POS alias |
| 7 | `mapStatusToDyno` | `'waiting_for_payment'` | `'READY'` | Underscore POS alias |
| 8 | `mapStatusToDyno` | `'in_kitchen'` | `'PREPARING'` | Kitchen display alias |
| 9 | `mapStatusToDyno` | `'delivered'` | `'DELIVERED'` | Delivery alias |
| 10 | `mapStatusToDyno` | `'dispatched'` | `'DISPATCHED'` | Rider dispatch alias |
| 11 | Case insensitivity | `'PENDING'`, `'Preparing'`, `'READY'` | `'ACCEPTED'`, `'PREPARING'`, `'READY'` | Case normalization |
| 12 | Whitespace trimming | `'  ready  '` | `'READY'` | Trims leading/trailing whitespace |
| 13 | Unknown status fallback | `'unknown_state'` | `'ACCEPTED'` | Defaults safely to ACCEPTED |
| 14 | Empty / falsy input | `''`, `null`, `undefined` | `'ACCEPTED'` | Defaults safely to ACCEPTED |
| 15 | `DYNO_STATUS_MAP` verification | Object entries | Exact 5 core mappings | Verifies constant integrity |

---

### Area 4: Auth Verification Logic (Dev Fallback vs. Production Rejection)

#### Current Code Observations & Security Hardening (Requirement R1 Interplay):
In `src/lib/authService.ts`:
- Currently:
  ```ts
  const DEFAULT_ADMIN_PASSWORDS = ['admin123', '1234', 'admin', 'vyoma2026'];
  const DEFAULT_STAFF_PASSWORDS = ['staff123', '1234', 'staff', 'captain123'];

  export async function verifyStaffPassword(input: string): Promise<VerifyResult> {
    const trimmed = input.trim();
    if (!trimmed) {
      return { success: false, message: 'Password cannot be empty' };
    }

    // 1. Instant check for standard demo & default passcodes (0ms latency)
    if (DEFAULT_STAFF_PASSWORDS.includes(trimmed) || DEFAULT_ADMIN_PASSWORDS.includes(trimmed)) {
      return { success: true, message: 'Access Granted' };
    }
    // ...
  ```
- **R1 Remediation Requirement**:
  Both `verifyStaffPassword` and `verifyAdminPassword` must gate default demo passcodes with:
  ```ts
  const isDev = Boolean(import.meta.env.DEV);
  if (isDev && (DEFAULT_STAFF_PASSWORDS.includes(trimmed) || DEFAULT_ADMIN_PASSWORDS.includes(trimmed))) {
    return { success: true, message: 'Access Granted' };
  }
  ```
- When `import.meta.env.DEV` is `false` (Production mode):
  Demo passcodes (`1234`, `admin123`, `staff123`) MUST NOT be granted access immediately!
  They must fall through to:
  1. `/api/auth/verify` endpoint, OR
  2. Supabase `app_passwords` table query.
  If neither has a matching credential, authentication is rejected with `{ success: false }`.

#### How to Test in Vitest:
Vitest allows controlling Vite's environment variables:
```ts
// Set Development Mode
Object.defineProperty(import.meta.env, 'DEV', { value: true, configurable: true });

// Set Production Mode
Object.defineProperty(import.meta.env, 'DEV', { value: false, configurable: true });
```
Also, mocking Supabase and Fetch:
```ts
// Mock fetch for /api/auth/verify
global.fetch = vi.fn();

// Mock Supabase from './supabase'
vi.mock('@/src/lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({
        data: [{ key: 'staff_password', password: 'secureStaff2026' }],
        error: null,
      }),
    })),
  },
}));
```

#### Test Cases Matrix for Auth Verification (`src/__tests__/authService.test.ts`):
| # | Environment | Input Passcode | Backend/DB Mock | Expected Result |
|---|---|---|---|---|
| 1 | **DEV** (`DEV=true`) | `'1234'` | None (offline) | `{ success: true, message: 'Access Granted' }` |
| 2 | **DEV** (`DEV=true`) | `'staff123'` | None (offline) | `{ success: true, message: 'Access Granted' }` |
| 3 | **DEV** (`DEV=true`) | `'admin123'` | None (offline) | `{ success: true, message: 'Access Granted' }` |
| 4 | **DEV & PROD** | `""` (empty) | Any | `{ success: false, message: 'Password cannot be empty' }` |
| 5 | **DEV & PROD** | `"   "` (whitespace) | Any | `{ success: false, message: 'Password cannot be empty' }` |
| 6 | **PROD** (`DEV=false`) | `'1234'` | Unconfigured / Offline | `{ success: false }` (No instant bypass) |
| 7 | **PROD** (`DEV=false`) | `'admin123'` | Unconfigured / Offline | `{ success: false }` (No instant bypass) |
| 8 | **PROD** (`DEV=false`) | `'secret_staff'` | Server `/api/auth/verify` returns HTTP 200 `{ success: true }` | `{ success: true }` |
| 9 | **PROD** (`DEV=false`) | `'wrong_password'` | Server `/api/auth/verify` returns HTTP 401 `{ success: false }` | `{ success: false }` |
| 10 | **PROD** (`DEV=false`) | `'secureStaff2026'` | Supabase returns `{ key: 'staff_password', password: 'secureStaff2026' }` | `{ success: true }` |
| 11 | **PROD** (`DEV=false`) | `'wrongStaff'` | Supabase returns `{ key: 'staff_password', password: 'secureStaff2026' }` | `{ success: false, message: 'Invalid Staff Access Password' }` |
| 12 | **PROD** (`DEV=false`) | `'secureAdmin2026'` | Supabase returns `{ key: 'admin_password', password: 'secureAdmin2026' }` | `{ success: true }` |
| 13 | **PROD** (`DEV=false`) | `'wrongAdmin'` | Supabase returns `{ key: 'admin_password', password: 'secureAdmin2026' }` | `{ success: false, message: 'Invalid Admin Password' }` |

---

## 5. Detailed Test Suite Architecture & File Layout

```
ScanServe_Dashboard-main/
├── vitest.config.ts                 # Vitest configuration (aliases, happy-dom, test patterns)
├── tsconfig.json                    # Updated to include vitest.config.ts
├── package.json                     # Updated with "test": "vitest run" and devDependencies
└── src/
    ├── utils/
    │   └── gst.ts                   # Extracted pure GST calculations & GSTIN validation
    └── __tests__/
        ├── setup.ts                 # Test environment setup (mocks reset, localStorage)
        ├── gst.test.ts              # Unit tests for GST calculation (subtotal, discounts, rounding)
        ├── gstin.test.ts            # Unit tests for 15-char GSTIN regex & normalization
        ├── orderStatus.test.ts      # Unit tests for order status mapping & transition logic
        └── authService.test.ts      # Unit/Integration tests for auth dev fallback vs prod rejection
```

---

## 6. Verification & Compatibility Analysis

### 6.1 `npm run lint` (`tsc --noEmit`) Safety
- **Test File Location**: `src/__tests__/` is located under `src`, which is listed in `tsconfig.json` `"include": ["src", ...]`.
- **Typing Safety**:
  - Because each test file explicitly imports test primitives:
    ```ts
    import { describe, it, expect, vi, beforeEach } from 'vitest';
    ```
    TypeScript resolves types directly from `node_modules/vitest/index.d.ts`.
  - There is no ambiguity or missing identifier.
  - Adding `"vitest.config.ts"` to `tsconfig.json` `"include"` ensures that `vitest.config.ts` is also checked and passes with 0 errors.

### 6.2 `npm run build` (`vite build && node build.js`) Safety
- `vite build` starts from HTML entry point (`index.html`) and recursively bundles files imported from `src/main.tsx`.
- Because `src/__tests__/` and `vitest.config.ts` are never imported in `main.tsx` or application code, **Vite build completely ignores test files**.
- `build.js` uses `esbuild.build({ entryPoints: ['server.ts'] })`. It also does not touch `src/__tests__/`.
- Therefore, the production build remains 100% clean, isolated, and fast (~6.2s).

---

## 7. Step-by-Step Implementation Guide for Subsequent Implementer Agent

When the implementer agent executes Requirement R5, here is the verified execution roadmap:

1. **Install Dependencies**:
   ```powershell
   npm install -D vitest happy-dom
   ```
2. **Update `package.json`**:
   Add test script:
   ```json
   "test": "vitest run",
   "test:watch": "vitest"
   ```
3. **Create `vitest.config.ts`**:
   Create root configuration with `happy-dom` environment and aliases matching `vite.config.ts`.
4. **Update `tsconfig.json`**:
   Add `"vitest.config.ts"` to `"include"` array.
5. **Create `src/utils/gst.ts`**:
   Implement and export `calculateGst`, `validateGSTIN`, `normalizeGSTIN`, and `GSTIN_REGEX`.
   *(Optionally refactor `InvoiceCreator.tsx`, `Receipt.tsx`, and `App.tsx` to import from this utility).*
6. **Create Test Suite in `src/__tests__/`**:
   - `src/__tests__/setup.ts`
   - `src/__tests__/gst.test.ts`
   - `src/__tests__/gstin.test.ts`
   - `src/__tests__/orderStatus.test.ts`
   - `src/__tests__/authService.test.ts`
7. **Empirical Verification**:
   - Run `npm test` -> Must pass 100% of test suites with 0 failures.
   - Run `npm run lint` -> Must complete with 0 TypeScript errors.
   - Run `npm run build` -> Must bundle frontend & server without errors.
