# Changes Report — Milestone M5 / Requirement R5: Automated Testing Suite

## Summary
Milestone M5 implemented a fully configured, high-performance automated testing infrastructure using Vitest and happy-dom. Extracted reusable GST calculation and GSTIN validation utilities to `src/utils/gst.ts`, and implemented 41 unit/integration test cases across 4 test suites covering all required domains with 100% test pass rate, 0 TypeScript lint errors, and a clean production build.

## Exclusively Owned Files Modified / Created

### 1. `package.json`
- Installed `vitest` (`^5.0.3`) and `happy-dom` (`^20.14.5`) as devDependencies.
- Added test scripts:
  - `"test": "vitest run"`
  - `"test:watch": "vitest"`

### 2. `tsconfig.json`
- Added `"vitest.config.ts"` to the `"include"` array so test configuration is typed and checked by `tsc --noEmit`.

### 3. `vitest.config.ts` (New File)
- Configured root Vitest configuration:
  - Environment: `happy-dom` (fast DOM/browser simulation for browser APIs, `window`, `localStorage`, and `fetch`).
  - Path aliases: `@lib` (`./src/lib`) and `@` (`.`), matching `vite.config.ts`.
  - Global setup file: `./src/__tests__/setup.ts`.
  - Test pattern: `src/**/*.{test,spec}.{ts,tsx}`.
  - Test globals enabled (`globals: true`).

### 4. `src/utils/gst.ts` (New File)
- Extracted pure financial calculation engine:
  - `calculateGst(options: CalculateGstOptions): GstCalculationResult`:
    - Computes item subtotal defensively (handling negative prices and invalid quantities).
    - Computes discount amounts for flat (capped at subtotal) and percentage (capped at 100%).
    - Calculates taxable base amount.
    - Applies configurable GST rate (default 5%) when `applyGst` is enabled.
    - Computes 50/50 split for CGST and SGST rates and amounts.
    - Rounds all monetary quantities to 2 decimal places (`Math.round(val * 100) / 100`).
  - `validateGSTIN(gstin: string | null | undefined): boolean`:
    - Validates 15-character Indian GSTIN format against `GSTIN_REGEX`.
    - Handles case normalization and trims whitespace.
    - Safely rejects null, undefined, empty, or invalidly structured values.
  - `normalizeGSTIN(val: string | null | undefined): string`:
    - Normalizes user input by upper-casing, removing non-alphanumeric characters, and truncating to 15 characters.
  - `GSTIN_REGEX`:
    - `/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/`.

### 5. `src/__tests__/setup.ts` (New File)
- Global test environment lifecycle setup:
  - Clears all Vitest mocks (`vi.clearAllMocks()`) before each test.
  - Resets `localStorage` before each test.

### 6. `src/__tests__/gst.test.ts` (New File — 12 Tests)
- Single item with standard 5% GST and no discount.
- Multiple items with standard 5% GST.
- Flat discount below subtotal.
- Flat discount exceeding subtotal (capped at subtotal).
- Percentage discount (10%).
- 100% percentage discount.
- Percentage discount exceeding 100% (capped at 100%).
- 50/50 CGST and SGST rate and amount split verification.
- Decimal precision and 2-decimal-place rounding verification (3 x ₹33.33 = ₹99.99 with 5% GST).
- GST disabled (`applyGst: false`).
- Empty items array (`[]`).
- Defensive handling of negative prices and invalid quantities.

### 7. `src/__tests__/gstin.test.ts` (New File — 11 Tests)
- Format regex validation against valid Indian GSTINs (Maharashtra `27AABCS1429B1Z8`, Karnataka `29AAAAA0000A1Z5`, Delhi `07AAAAA0000A1Z5`, Maharashtra `27AAACG0561F1ZV`).
- Direct `GSTIN_REGEX` testing.
- Too short string rejection (14 characters).
- Too long string rejection (16 characters).
- 14th character rejection when not 'Z'.
- Invalid non-numeric state code rejection.
- Invalid PAN structure rejection.
- Special characters / hyphens rejection.
- Auto-normalization of lowercase input.
- Empty, whitespace, null, and undefined rejection.
- Dirty user input normalization via `normalizeGSTIN`.

### 8. `src/__tests__/orderStatus.test.ts` (New File — 7 Tests)
- Mapping of 5 primary statuses (`pending` -> `ACCEPTED`, `preparing` -> `PREPARING`, `ready` -> `READY`, `completed` -> `DELIVERED`, `cancelled` -> `CANCELLED`).
- Mapping of status aliases (`accepted`, `waiting for payment`, `waiting_for_payment`, `in_kitchen`, `dispatched`, `delivered`).
- Case-insensitivity verification across mixed/uppercase inputs.
- Leading and trailing whitespace handling.
- Unknown status fallback to `ACCEPTED`.
- Empty and falsy input fallback to `ACCEPTED`.
- Constant dictionary integrity check on `DYNO_STATUS_MAP`.

### 9. `src/__tests__/authService.test.ts` (New File — 11 Tests)
- Empty and whitespace passcode rejection for staff and admin.
- Development mode (`import.meta.env.DEV = true`): instant demo passcode approval for `'1234'`, `'staff123'`, `'admin123'`.
- Development mode rejection of unrecognized passcodes when offline.
- Production mode (`import.meta.env.DEV = false`): demo passcodes (`1234`, `staff123`, `admin123`) strictly DO NOT bypass authentication when offline or unconfigured.
- Production mode server `/api/auth/verify` authentication for staff and admin.
- Production mode server rejection when backend returns failure.
- Production mode Supabase `app_passwords` table fallback verification for staff (`secureStaff2026`) and admin (`secureAdmin2026`), with rejection of invalid passcodes.

## External Documentation & Vault Synchronization
- Synchronized `C:\Users\Anay0216\Documents\Obsidian Vault\Projects\VyomaPOS - Xtra Rooftop\Roadmap.md` with Milestone M5 completion.
- Synchronized `C:\Users\Anay0216\Documents\Obsidian Vault\Daily\2026-10-06.md` with comprehensive M5 activity summary.
- Updated project AST knowledge graph via `graphify update .`.
