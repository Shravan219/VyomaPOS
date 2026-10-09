# Handoff Report: Database Schema Consolidation & CI/CD Cleanliness (R2 & R4)

**Agent**: `explorer_survey_2`  
**Working Directory**: `c:\Users\Anay0216\Documents\Coding\VyomaPOS_Dashboard-main\.agents\teamwork\explorer_survey_2`  
**Handoff Type**: Hard (Task Complete)  
**Date**: 2026-10-06  

---

## 1. Observation

1. **`supabase_schema.sql` (lines 1–175)**:
   - Root database schema only defines `public.customers` (lines 32–41), `public.menu_items` (lines 47–57), `public.orders` (lines 63–75), order sync trigger `sync_customer_from_order()` (lines 89–134), and RLS policies for those 3 tables (lines 142–175).
   - Verbatim check: Neither `app_passwords`, `expenses`, nor `storage.buckets` appear anywhere in `supabase_schema.sql`.
2. **`supabase/migrations/20261005_create_expenses_and_receipts.sql` (lines 1–76)**:
   - Defines `public.expenses` with `id UUID DEFAULT gen_random_uuid() PRIMARY KEY`, `created_at TIMESTAMPTZ`, `amount NUMERIC(10,2)`, `category TEXT`, `notes TEXT`, `receipt_url TEXT`.
   - Defines indexes `idx_expenses_created_at_desc` and `idx_expenses_category`.
   - Defines RLS policies for `public.expenses`: SELECT, INSERT, UPDATE, DELETE with `USING (true)`.
   - Inserts into `storage.buckets`: `INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true) ON CONFLICT (id) DO UPDATE SET public = true;`.
   - Defines storage RLS on `storage.objects` for SELECT, INSERT, UPDATE, DELETE scoped to `bucket_id = 'receipts'`.
3. **Application Password Consumer Code**:
   - `server/routes/auth.ts` lines 21–42 queries `supabase.from('app_passwords').select('*')` and matches `keyVal = String(row.key || row.name || row.type || row.id || '').trim().toLowerCase()` against target keys `['staff_password', 'staff', 'staffpassword']` or `['admin_password', 'admin', 'adminpassword']`.
   - `src/lib/authService.ts` lines 67–85 & 137–155 queries `supabase.from('app_passwords').select('*')` directly from client with anon key.
4. **Environment Variables & Documentation**:
   - `.env.example` lines 1–16 contains only Supabase URL/key and Dyno/Tester webhook variables. It contains zero references to `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `SPREADSHEET_ID`, or `SHEET_RANGE`.
   - `supabase/functions/sync-expense-to-sheets/index.ts` lines 96–109 explicitly requires `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, and `SPREADSHEET_ID`, throwing an error if absent.
   - `README.md` lines 130–145 (Environment Variables table) and lines 340–349 (Integrations table) omit Google Sheets and expense syncing completely. Line 286 says "Create staff/admin password rows expected by authService" without providing schema DDL or column definitions.
5. **CI/CD Workflow Location**:
   - Command `Get-ChildItem -Path . -Filter "build-apk.yml"` finds the file at repository root `build-apk.yml`.
   - Command `Get-ChildItem -Path .github` returns `Cannot find path '.github' because it does not exist`.
6. **Proprietary File Tracking**:
   - Command `git ls-files "VyomPOS Leads.xlsx"` returns `VyomPOS Leads.xlsx`.
   - File exists on disk: length 23,996 bytes.
   - Commit history: committed in commit `c2b38ce1416c8869124a2e2dd4ddd6b0649741c8` ("VyomaPOS with expenses ledger + Sheets sync").
7. **`.gitignore` (lines 1–26)**:
   - Contains rules for `node_modules/`, `build/`, `dist/`, `coverage/`, `.env*`, android builds, and graphify cache.
   - Verbatim check: does not contain `*.xlsx`, `.vitest/`, `.nyc_output/`, or general temporary files (`*.tmp`).

---

## 2. Logic Chain

1. From Observation 1, a developer running `supabase_schema.sql` on a clean Supabase project will not have `app_passwords`, `expenses`, or the `receipts` storage bucket created.
2. From Observation 3, when `app_passwords` is absent, client authentication fails when falling back to database verification, and server route `/api/auth/verify` returns a database error (`Database error querying 'app_passwords'`). Therefore, `app_passwords` DDL, seed data (`staff_password='1234'`, `admin_password='admin123'`), and a SELECT RLS policy must be consolidated into `supabase_schema.sql`.
3. From Observation 2, `public.expenses` DDL, indexes, RLS, and the `receipts` storage bucket insertion + RLS exist in a separate migration file (`supabase/migrations/20261005_create_expenses_and_receipts.sql`) and must be merged directly into `supabase_schema.sql` so that clean project setup creates all database objects in a single execution.
4. From Observation 4, the `sync-expense-to-sheets` Edge Function relies on 3 mandatory environment variables (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `SPREADSHEET_ID`) and 1 optional (`SHEET_RANGE`). Missing documentation in `.env.example` and `README.md` prevents teams from configuring expense sync. Documenting these in `.env.example` and `README.md` fulfills Requirement R2.
5. From Observation 5, GitHub Actions requires workflow files to reside in `.github/workflows/*.yml`. Because `build-apk.yml` is in the root and `.github/` does not exist, the Android APK CI workflow has never executed on GitHub Actions. Moving it to `.github/workflows/build-apk.yml` via `git mv` will activate GitHub Actions execution for Android builds.
6. From Observation 6, `VyomPOS Leads.xlsx` is tracked by git. Running `git rm --cached "VyomPOS Leads.xlsx"` removes it from git tracking without deleting the file from disk.
7. From Observation 7, if `VyomPOS Leads.xlsx` is untracked without adding `*.xlsx` to `.gitignore`, it will immediately appear as an untracked file in `git status`. Adding `*.xlsx`, `*.xls`, `.vitest/`, `.nyc_output/`, `test-results/`, and temporary patterns to `.gitignore` ensures repository cleanliness and fulfills Requirement R4.

---

## 3. Caveats

1. **`public.tables` schema**: `CaptainDashboard.tsx` queries `supabase.from('tables')`. When absent, it falls back to in-memory `DEFAULT_TABLES`. While not explicitly demanded in Requirement R2, a DDL block for `public.tables` has been documented in `survey_report.md` as an optional enhancement for the implementer.
2. **Supabase Storage Schema Availability**: In official Supabase environments, `storage.buckets` and `storage.objects` are pre-provisioned by Supabase. If `supabase_schema.sql` is run on a vanilla, non-Supabase PostgreSQL instance without the Supabase storage extension installed, operations on `storage.*` will require the storage schema. Supabase projects handle this out-of-the-box.
3. **Historical Commit Retention**: `git rm --cached` untracks `VyomPOS Leads.xlsx` from future commits, but does not purge the file from past Git history (`c2b38ce`). For complete repository scrubbing of sensitive lead data, `git filter-repo` or BFG would be required; however, the requirement specifically requested `git rm --cached "VyomPOS Leads.xlsx"`.

---

## 4. Conclusion

All requirements for R2 and R4 are clearly defined and ready for execution by the implementer agent:
1. **R2 Execution**:
   - Update `supabase_schema.sql` to add `pgcrypto`, `public.app_passwords` (DDL, seed data for `staff_password` and `admin_password`, SELECT RLS policy), `public.expenses` (DDL, indexes, full CRUD RLS), and `receipts` public storage bucket + storage RLS.
   - Update `.env.example` to document Google Sheets sync secrets.
   - Update `README.md` in Environment Variables table, Database section, and Integrations section.
2. **R4 Execution**:
   - Create `.github/workflows/` and move `build-apk.yml` to `.github/workflows/build-apk.yml`.
   - Run `git rm --cached "VyomPOS Leads.xlsx"` while keeping the file on disk.
   - Update `.gitignore` with `*.xlsx`, `*.xls`, `.vitest/`, `.nyc_output/`, `test-results/`, `*.tmp`, `tmp/`, and `*.apk`.

The full specifications, complete SQL code blocks, and proposed file contents are detailed in:
`c:\Users\Anay0216\Documents\Coding\VyomaPOS_Dashboard-main\.agents\teamwork\explorer_survey_2\survey_report.md`.

---

## 5. Verification Method

To independently verify the investigation and subsequent implementation:

1. **Inspect Survey Report**:
   ```powershell
   Get-Content "c:\Users\Anay0216\Documents\Coding\VyomaPOS_Dashboard-main\.agents\teamwork\explorer_survey_2\survey_report.md"
   ```
2. **Verify CI/CD File Relocation**:
   ```powershell
   Test-Path ".github\workflows\build-apk.yml"  # Must return True after implementer finishes
   Test-Path "build-apk.yml"                    # Must return False
   ```
3. **Verify Git Tracking of Spreadsheet**:
   ```powershell
   git ls-files "VyomPOS Leads.xlsx"            # Must return empty
   Test-Path "VyomPOS Leads.xlsx"               # Must return True (remains on disk)
   git check-ignore -v "VyomPOS Leads.xlsx"     # Must match .gitignore:*.xlsx
   ```
4. **Verify Schema Consolidation**:
   - Check `supabase_schema.sql` contains `app_passwords`, `expenses`, and `storage.buckets`.
5. **Verify Documentation**:
   - Check `.env.example` and `README.md` contain `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `SPREADSHEET_ID`.
