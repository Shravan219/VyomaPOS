# Changes Log - Milestone M2 (Database Schema Consolidation & Documentation)

**Worker**: `worker_m2`  
**Timestamp**: 2026-10-06T04:49:30Z  

---

## 1. `supabase_schema.sql`
- **pgcrypto Extension**:
  - Added `CREATE EXTENSION IF NOT EXISTS "pgcrypto";` to support `gen_random_uuid()`.
- **`public.app_passwords` Table DDL**:
  - Defined table with `id UUID DEFAULT gen_random_uuid() PRIMARY KEY`, `key TEXT UNIQUE NOT NULL`, `password TEXT NOT NULL`, `created_at TIMESTAMPTZ DEFAULT now()`, `updated_at TIMESTAMPTZ DEFAULT now()`.
  - Added case-insensitive key lookup index `idx_app_passwords_key ON public.app_passwords (lower(key))`.
  - Enabled Row Level Security (`ALTER TABLE public.app_passwords ENABLE ROW LEVEL SECURITY`).
  - Added public read policy `Allow public read access to app_passwords` (`FOR SELECT USING (true)`).
  - Seeded default passcodes `staff_password` = `'1234'` and `admin_password` = `'admin123'` using `ON CONFLICT (key) DO NOTHING`.
- **`public.expenses` Table DDL**:
  - Defined table with `id UUID DEFAULT gen_random_uuid() PRIMARY KEY`, `created_at TIMESTAMPTZ DEFAULT now() NOT NULL`, `amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0)`, `category TEXT NOT NULL`, `notes TEXT`, `receipt_url TEXT NOT NULL DEFAULT ''`.
  - Added indexes `idx_expenses_created_at_desc` on `(created_at DESC)` and `idx_expenses_category` on `(category)`.
  - Enabled Row Level Security (`ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY`).
  - Added 4 CRUD RLS policies (SELECT, INSERT, UPDATE, DELETE) for public/POS access.
- **`receipts` Storage Bucket & Policies**:
  - Added public storage bucket insertion:
    `INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true) ON CONFLICT (id) DO UPDATE SET public = true;`
  - Added 4 storage RLS policies on `storage.objects` for `bucket_id = 'receipts'` (SELECT, INSERT, UPDATE, DELETE).

---

## 2. `.env.example`
- Added configuration secrets section for Google Sheets Sync Integration:
  - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Google Service Account email.
  - `GOOGLE_PRIVATE_KEY`: RSA private key for JWT OAuth token generation.
  - `SPREADSHEET_ID`: Target Google Spreadsheet identifier.
  - `SHEET_RANGE`: Target worksheet/cell range (defaults to `Sheet1!A:E`).
  - Documented CLI command `supabase secrets set ...` for Edge Function environment provisioning.

---

## 3. `README.md`
- **Table of Contents**:
  - Added sub-entry for Google Sheets Sync under Integrations.
- **Environment Variables Table**:
  - Documented `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `SPREADSHEET_ID`, and `SHEET_RANGE`.
- **Database Section**:
  - Documented turnkey setup instructions for `supabase_schema.sql`.
  - Added summary table of all consolidated database objects (`customers`, `menu_items`, `orders`, `app_passwords`, `expenses`, `receipts` bucket, and `trg_sync_customer_from_order`).
  - Documented SQL commands for rotating production credentials in `public.app_passwords`.
- **Integrations Section**:
  - Added Google Sheets to Integrations table.
  - Added dedicated subsection `Google Sheets Sync (Expense Ledger)` detailing service account provisioning, secret configuration, edge function deployment (`sync-expense-to-sheets`), and Supabase Database Webhook trigger setup.

---

## 4. Obsidian Vault Synchronization
- Synchronized `C:\Users\Anay0216\Documents\Obsidian Vault\Projects\Vyoma ScanServe\Database Schema.md` with definitions for `app_passwords`, `expenses`, `receipts` storage bucket, and updated RLS details.
- Recorded accomplishments in `C:\Users\Anay0216\Documents\Obsidian Vault\Daily\2026-10-06.md`.
