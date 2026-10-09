# Explorer Survey Report: Database Schema Consolidation & CI/CD Cleanliness (R2 & R4)

**Investigator**: `explorer_survey_2` (Database and CI Explorer)  
**Target Repository**: `c:\Users\Anay0216\Documents\Coding\VyomaPOS_Dashboard-main`  
**Date**: 2026-10-06  
**Scope**: Requirements R2 (Database Schema Consolidation & Documentation) & R4 (Repository Cleanliness & CI/CD Organization)  

---

## 1. Executive Summary

This investigation examines the current state of database definitions, environment documentation, repository cleanliness, and CI/CD workflow configuration for the VyomaPOS - Xtra Rooftop Dashboard.

### Key Findings:
1. **Database Schema Gaps (R2)**:
   - `supabase_schema.sql` at root only provisions `customers`, `menu_items`, and `orders`. It is completely missing:
     - `public.app_passwords` table DDL, seed credentials (`1234`, `admin123`), and RLS policies.
     - `public.expenses` table DDL, indexes, and CRUD RLS policies (currently isolated in `supabase/migrations/20261005_create_expenses_and_receipts.sql`).
     - `storage.buckets` entry for `receipts` and its four `storage.objects` RLS policies.
     - The `pgcrypto` extension required for `gen_random_uuid()`.
   - Running `supabase_schema.sql` on a fresh Supabase instance currently leaves the application broken on authentication, expense ledger, and receipt image uploads.
2. **Documentation Gaps (R2)**:
   - Neither `.env.example` nor `README.md` documents the Google Sheets synchronization secrets (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `SPREADSHEET_ID`, `SHEET_RANGE`) used by the `sync-expense-to-sheets` Edge Function.
   - `README.md` mentions `authService` passwords vaguely ("Create staff/admin password rows expected by authService") without schema definitions, column specifications, or SQL statements.
3. **CI/CD Workflow Misplacement (R4)**:
   - `build-apk.yml` resides in the repository root. GitHub Actions ignores workflows outside of `.github/workflows/`.
   - The `.github/` directory does not currently exist.
4. **Tracked Proprietary Data & .gitignore Rules (R4)**:
   - `VyomPOS Leads.xlsx` (23,996 bytes) is currently tracked in the Git index (committed in `c2b38ce`).
   - `.gitignore` does not ignore `*.xlsx`, `.vitest/`, `.nyc_output/`, or temporary file patterns.

---

## 2. Requirement R2: Database Schema Consolidation & Documentation

### 2.1 Current State Analysis

#### Root Schema (`supabase_schema.sql`):
- Provisions extensions: `uuid-ossp`.
- Provisions tables: `public.customers`, `public.menu_items`, `public.orders`.
- Provisions trigger: `public.sync_customer_from_order()`.
- Provisions RLS for `customers`, `menu_items`, `orders`.
- **Deficiencies**:
  - Does NOT create `app_passwords`.
  - Does NOT create `expenses`.
  - Does NOT create `receipts` storage bucket.
  - Does NOT configure storage RLS.

#### Migration Schema (`supabase/migrations/20261005_create_expenses_and_receipts.sql`):
- Created on 2026-10-05 to support the expense ledger and receipts upload.
- Defines `public.expenses` with columns `(id, created_at, amount, category, notes, receipt_url)`.
- Defines indexes `idx_expenses_created_at_desc` and `idx_expenses_category`.
- Defines 4 RLS policies on `public.expenses` (SELECT, INSERT, UPDATE, DELETE).
- Inserts `receipts` into `storage.buckets` (`public = true`).
- Defines 4 RLS policies on `storage.objects` scoped to `bucket_id = 'receipts'`.
- **Deficiency**: It exists in a separate migrations directory and was never merged into the master `supabase_schema.sql`, requiring developers to run multiple disparate SQL scripts.

#### Application Code Expectations:
1. **`app_passwords` consumption**:
   - `server/routes/auth.ts` lines 21-42:
     - Queries `supabase.from('app_passwords').select('*')`.
     - Key resolution: `row.key || row.name || row.type || row.id`.
     - Value resolution: `row.password || row.value || row.pass`.
     - Staff matches: `['staff_password', 'staff', 'staffpassword']`.
     - Admin matches: `['admin_password', 'admin', 'adminpassword']`.
   - `src/lib/authService.ts` lines 67-85 & 137-155:
     - Client-side direct query `supabase.from('app_passwords').select('*')` using anon key.
     - Looks for `staffRow` with key `staff_password` and `adminRow` with key `admin_password`.
   - **Conclusion**: Canonical columns must be `key TEXT PRIMARY KEY` (or `UNIQUE`) and `password TEXT NOT NULL`.
2. **`expenses` consumption**:
   - `src/components/expenses/ExpensesView.tsx` lines 75, 183, 202:
     - `supabase.from('expenses').select('*')`
     - `supabase.from('expenses').update(...)`
     - `supabase.from('expenses').delete().eq('id', id)`
   - `src/components/expenses/AddExpenseModal.tsx` lines 93, 104:
     - `supabase.storage.from('receipts').upload(...)`
     - `supabase.from('expenses').insert(...)`
3. **`tables` table (Architectural Finding)**:
   - `src/components/captain/CaptainDashboard.tsx` lines 83 & 107 attempts to query/upsert `supabase.from('tables')`. When absent, it falls back gracefully to in-memory `DEFAULT_TABLES`. While not explicitly listed in R2, including `public.tables` in the consolidated schema or documenting it ensures complete turnkey execution.

---

### 2.2 Exact SQL Specifications to Consolidate into `supabase_schema.sql`

#### 1. Extensions Update:
Add `pgcrypto` to line 29:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

#### 2. `app_passwords` Table DDL & Seed Data:
```sql
-- ====================================================================
-- 5. APP PASSWORDS TABLE (Role-Based Terminal Access Control)
-- Queried by src/lib/authService.ts and server/routes/auth.ts
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.app_passwords (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for key lookups
CREATE INDEX IF NOT EXISTS idx_app_passwords_key ON public.app_passwords (lower(key));

-- Enable RLS
ALTER TABLE public.app_passwords ENABLE ROW LEVEL SECURITY;

-- Allow public read access so client terminals can verify input passcodes
DROP POLICY IF EXISTS "Allow public read access to app_passwords" ON public.app_passwords;
CREATE POLICY "Allow public read access to app_passwords"
ON public.app_passwords FOR SELECT
USING (true);

-- Default Seed Credentials
-- Staff default passcode: 1234
-- Admin default passcode: admin123
-- NOTE: In production, rotate these passcodes immediately via:
-- UPDATE public.app_passwords SET password = 'your_new_staff_password', updated_at = now() WHERE key = 'staff_password';
-- UPDATE public.app_passwords SET password = 'your_new_admin_password', updated_at = now() WHERE key = 'admin_password';
INSERT INTO public.app_passwords (key, password)
VALUES 
    ('staff_password', '1234'),
    ('admin_password', 'admin123')
ON CONFLICT (key) DO NOTHING;
```

#### 3. `expenses` Table DDL & Indexes:
```sql
-- ====================================================================
-- 6. EXPENSES TABLE (Outlet Ledger & Petty Cash Tracking)
-- Queried by src/components/expenses/ExpensesView.tsx
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    category TEXT NOT NULL,
    notes TEXT,
    receipt_url TEXT NOT NULL DEFAULT ''
);

-- Indexes for date range sorting and category analytics
CREATE INDEX IF NOT EXISTS idx_expenses_created_at_desc ON public.expenses (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses (category);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Expenses (Full POS client CRUD)
DROP POLICY IF EXISTS "Allow public read access to expenses" ON public.expenses;
CREATE POLICY "Allow public read access to expenses"
ON public.expenses FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow public insert to expenses" ON public.expenses;
CREATE POLICY "Allow public insert to expenses"
ON public.expenses FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access to expenses" ON public.expenses;
CREATE POLICY "Allow public update access to expenses"
ON public.expenses FOR UPDATE
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete access to expenses" ON public.expenses;
CREATE POLICY "Allow public delete access to expenses"
ON public.expenses FOR DELETE
USING (true);
```

#### 4. `receipts` Storage Bucket & Storage RLS Policies:
```sql
-- ====================================================================
-- 7. STORAGE: RECEIPTS BUCKET & POLICIES
-- Used by AddExpenseModal.tsx for receipt photo uploads
-- ====================================================================

-- Create public 'receipts' storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS policies for receipts objects
DROP POLICY IF EXISTS "Allow public read access to receipts objects" ON storage.objects;
CREATE POLICY "Allow public read access to receipts objects"
ON storage.objects FOR SELECT
USING (bucket_id = 'receipts');

DROP POLICY IF EXISTS "Allow public insert to receipts bucket" ON storage.objects;
CREATE POLICY "Allow public insert to receipts bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'receipts');

DROP POLICY IF EXISTS "Allow public update access to receipts bucket" ON storage.objects;
CREATE POLICY "Allow public update access to receipts bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'receipts')
WITH CHECK (bucket_id = 'receipts');

DROP POLICY IF EXISTS "Allow public delete access to receipts bucket" ON storage.objects;
CREATE POLICY "Allow public delete access to receipts bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'receipts');
```

---

### 2.3 Documentation Updates Needed

#### A. `.env.example` Additions:
Add the Google Sheets synchronization configuration section:
```env
# Google Sheets Sync Integration (Expense Ledger Edge Function)
# These secrets must be configured in your Supabase project:
# Run: supabase secrets set GOOGLE_SERVICE_ACCOUNT_EMAIL="..." GOOGLE_PRIVATE_KEY="..." SPREADSHEET_ID="..."
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
SPREADSHEET_ID="your-google-spreadsheet-id"
SHEET_RANGE="Sheet1!A:E"
```

#### B. `README.md` Additions:
1. **Environment Variables Table**: Add entries for `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `SPREADSHEET_ID`, and `SHEET_RANGE`.
2. **Database Section**:
   - Explicitly detail that running `supabase_schema.sql` creates:
     - `customers` (CRM & Loyalty profiles)
     - `menu_items` (Digital catalog)
     - `orders` (Dine-in, takeaway, online orders)
     - `app_passwords` (Staff & Admin terminal credentials seeded with `1234` and `admin123`)
     - `expenses` (Daily outlet petty cash & expenses ledger)
     - `receipts` (Public storage bucket for expense receipt photos)
   - Include SQL commands to rotate production passcodes:
     ```sql
     UPDATE public.app_passwords SET password = 'NEW_STAFF_PASS' WHERE key = 'staff_password';
     UPDATE public.app_passwords SET password = 'NEW_ADMIN_PASS' WHERE key = 'admin_password';
     ```
3. **Integrations Section**:
   - Add a dedicated subsection for **Google Sheets (Expense Ledger Sync)**:
     - Explaining `supabase/functions/sync-expense-to-sheets/index.ts`.
     - Explaining how the Supabase Database Webhook fires on `INSERT` to `public.expenses`.
     - Instructions to share the target Google Sheet with `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
     - Edge function deployment commands:
       ```bash
       supabase functions deploy sync-expense-to-sheets
       supabase secrets set GOOGLE_SERVICE_ACCOUNT_EMAIL="<email>" GOOGLE_PRIVATE_KEY="<key>" SPREADSHEET_ID="<id>"
       ```

---

## 3. Requirement R4: Repository Cleanliness & CI/CD Organization

### 3.1 CI/CD Workflow Analysis: `build-apk.yml`

#### Current Status:
- File location: `c:\Users\Anay0216\Documents\Coding\VyomaPOS_Dashboard-main\build-apk.yml`
- Root directory contains `build-apk.yml`.
- `.github/` directory: **Does not exist**.
- Impact: GitHub Actions completely ignores workflow files placed in the repository root. The automated Android APK build pipeline has never been discoverable or executable by GitHub Actions runners.

#### Remediation:
1. Create directory structure: `.github/workflows/`
2. Move `build-apk.yml` to `.github/workflows/build-apk.yml` via Git:
   ```bash
   mkdir -p .github/workflows
   git mv build-apk.yml .github/workflows/build-apk.yml
   ```
   (In Windows PowerShell):
   ```powershell
   New-Item -ItemType Directory -Force -Path .github\workflows
   git mv build-apk.yml .github/workflows/build-apk.yml
   ```
3. File contents inspection:
   - Action uses: `actions/checkout@v4`, `actions/setup-node@v4` (Node 20), `actions/setup-java@v4` (JDK 17 Zulu), `npm ci`, `npm run build`, `npx cap sync android`, `gradlew assembleDebug`, `actions/upload-artifact@v4`.
   - Workflow logic is completely sound; moving it into `.github/workflows/build-apk.yml` immediately enables automatic builds on push to `main` / `master` and manual triggering via `workflow_dispatch`.

---

### 3.2 File Tracking Analysis: `VyomPOS Leads.xlsx`

#### Current Status:
- File location: `c:\Users\Anay0216\Documents\Coding\VyomaPOS_Dashboard-main\VyomPOS Leads.xlsx`
- File size: 23,996 bytes
- Git tracking status:
  - Output of `git ls-files "VyomPOS Leads.xlsx"`: `VyomPOS Leads.xlsx` (tracked).
  - Committed in commit `c2b38ce1416c8869124a2e2dd4ddd6b0649741c8`.
  - Content: Proprietary lead generation / customer outreach spreadsheet containing potential client phone numbers and notes.

#### Remediation:
1. Untrack from Git index while preserving the file on disk:
   ```bash
   git rm --cached "VyomPOS Leads.xlsx"
   ```
2. Verify file status:
   - `VyomPOS Leads.xlsx` remains intact on disk at `c:\Users\Anay0216\Documents\Coding\VyomaPOS_Dashboard-main\VyomPOS Leads.xlsx`.
   - Git status marks the file as `deleted` in staging (`D  VyomPOS Leads.xlsx`).
   - When `.gitignore` contains `*.xlsx`, Git will not show `VyomPOS Leads.xlsx` as an untracked file.

---

### 3.3 `.gitignore` Gap Analysis & Target Specification

#### Current `.gitignore` (26 lines):
```gitignore
node_modules/
build/
dist/
exe setup file/
coverage/
.DS_Store
*.log
.env*
!.env.example
__pycache__/
*.pyc
.whatsapp_auth/

release/

# Android build artifacts
.gradle/
android/.gradle/
android/build/
android/app/build/
android/capacitor-cordova-android-plugins/build/
android/local.properties

# Graphify cache
graphify-out/cache/
```

#### Identified Deficiencies:
1. **Spreadsheets & Data**: No rule for `*.xlsx` or `*.xls`.
2. **Test Framework Coverage & Caches**: Only `coverage/` is listed. Missing `.vitest/`, `.nyc_output/`, `test-results/`.
3. **Temporary Files & Editor Swaps**: Missing `*.tmp`, `*.temp`, `tmp/`, `.temp/`, `*.swp`, `*~`.
4. **Binary Build Artifacts**: Missing `*.apk` (builds produce local APKs in root and `apk/`).

#### Proposed Target `.gitignore`:
```gitignore
# Dependencies
node_modules/

# Production build outputs
dist/
build/
release/
exe setup file/

# Android build & local artifacts
.gradle/
android/.gradle/
android/build/
android/app/build/
android/capacitor-cordova-android-plugins/build/
android/local.properties
*.apk

# Environment & Secrets
.env*
!.env.example
.whatsapp_auth/

# Testing & Coverage
coverage/
.nyc_output/
.vitest/
test-results/

# Temporary files & Editor swap files
*.log
*.tmp
*.temp
tmp/
.temp/
*.swp
*.swo
*~
.DS_Store

# Python caches
__pycache__/
*.pyc

# Proprietary spreadsheets & leads
*.xlsx
*.xls

# Graphify cache
graphify-out/cache/
```

---

## 4. Proposed File Change Diff Matrix

| Target File | Operation | Description |
|-------------|-----------|-------------|
| `supabase_schema.sql` | Modify (Append / Consolidate) | Add `pgcrypto`, `app_passwords` DDL, seed credentials (`1234`, `admin123`), `expenses` DDL, indexes, `receipts` storage bucket insertion, and RLS policies for both tables and storage objects. |
| `.env.example` | Modify (Append) | Add Google Sheets sync secrets (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `SPREADSHEET_ID`, `SHEET_RANGE`). |
| `README.md` | Modify | Update Environment Variables table, Database section, and Integrations section with Google Sheets sync and password management instructions. |
| `build-apk.yml` | Move (`git mv`) | Move from repo root to `.github/workflows/build-apk.yml`. |
| `VyomPOS Leads.xlsx` | Untrack (`git rm --cached`) | Untrack from git index while keeping the file on disk. |
| `.gitignore` | Modify | Add `*.xlsx`, `*.xls`, `.vitest/`, `.nyc_output/`, `test-results/`, `*.tmp`, `tmp/`, `*.apk`. |

---

## 5. Verification Protocol

The implementer can verify R2 and R4 using the following empirical checks:

### 1. Database Schema Verification:
- **Syntax Check**: Execute a dry-run / parse test of `supabase_schema.sql` using a PostgreSQL client or linter to confirm zero syntax errors.
- **Object Coverage**: Verify that `supabase_schema.sql` contains:
  - `CREATE TABLE IF NOT EXISTS public.app_passwords`
  - `INSERT INTO public.app_passwords` with `staff_password` and `admin_password`
  - `CREATE TABLE IF NOT EXISTS public.expenses`
  - `INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', ...)`
  - RLS policies for `public.app_passwords`, `public.expenses`, and `storage.objects`

### 2. Documentation Verification:
- Inspect `.env.example` to ensure `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, and `SPREADSHEET_ID` are present.
- Inspect `README.md` to ensure the table and sections mention the same variables and the database password setup.

### 3. CI/CD Workflow Verification:
- Run `Test-Path .github/workflows/build-apk.yml` -> returns `True`.
- Run `Test-Path build-apk.yml` -> returns `False`.
- Run `git status` -> confirms `renamed: build-apk.yml -> .github/workflows/build-apk.yml`.

### 4. Git Untracking & .gitignore Verification:
- Run `git ls-files "VyomPOS Leads.xlsx"` -> returns empty (no output).
- Run `Test-Path "VyomPOS Leads.xlsx"` -> returns `True` (file preserved on disk).
- Run `git check-ignore -v "VyomPOS Leads.xlsx"` -> outputs matching `.gitignore:*.xlsx` rule.
- Run `git check-ignore -v "coverage/index.html"` -> outputs matching `.gitignore:coverage/` rule.
