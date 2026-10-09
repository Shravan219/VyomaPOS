## 2026-10-06T04:42:57Z
You are worker_m2 (Database Schema and Documentation Worker).
Your working directory is: c:\Users\Anay0216\Documents\Coding\VyomaPOS_Dashboard-main\.agents\teamwork\worker_m2

Authoritative user requirements are located at:
c:\Users\Anay0216\Documents\Coding\VyomaPOS_Dashboard-main\.agents\teamwork\ORIGINAL_REQUEST.md
You MUST read ORIGINAL_REQUEST.md before starting work.

Also read PROJECT.md at:
c:\Users\Anay0216\Documents\Coding\VyomaPOS_Dashboard-main\.agents\teamwork\orchestrator_1\PROJECT.md
And reference Explorer 2 findings at:
c:\Users\Anay0216\Documents\Coding\VyomaPOS_Dashboard-main\.agents\teamwork\explorer_survey_2\survey_report.md

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Exclusively owned files:
- `supabase_schema.sql`
- `.env.example`
- `README.md`
DO NOT modify any other files in the project.

Your Objective (Milestone M2 / Requirement R2):
1. Consolidate `supabase_schema.sql`:
   - Add `public.app_passwords` table DDL (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, key TEXT UNIQUE NOT NULL, password TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now()), default seed row(s) for `staff_password` ('1234') and `admin_password` ('admin123') using `ON CONFLICT (key) DO NOTHING`, enable RLS, and add public read policy (`FOR SELECT USING (true)`).
   - Consolidate `public.expenses` table DDL, indexes (`idx_expenses_created_at_desc`, `idx_expenses_category`), enable RLS, and add full CRUD policies (from `supabase/migrations/20261005_create_expenses_and_receipts.sql`).
   - Add `receipts` public storage bucket insertion (`INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true) ON CONFLICT (id) DO UPDATE SET public = true;`) and storage RLS policies for `storage.objects` (SELECT, INSERT, UPDATE, DELETE for `bucket_id = 'receipts'`).
2. Update `.env.example`:
   - Document the optional Google Sheets sync secrets:
     `GOOGLE_SERVICE_ACCOUNT_EMAIL`
     `GOOGLE_PRIVATE_KEY`
     `SPREADSHEET_ID`
     `SHEET_RANGE`
3. Update `README.md`:
   - Document the Google Sheets sync configuration and credentials in the Environment Variables table and Integrations section.
   - Document the consolidated database tables (`app_passwords`, `expenses`, `receipts` bucket) and setup instructions.
4. Verification:
   - Review SQL for syntax correctness.
   - Run `npm run lint` to verify zero TypeScript errors.
5. Deliverables:
   - Write `changes.md` in your working directory detailing all changes.
   - Write `handoff.md` with Observation, Logic Chain, Caveats, Conclusion, and Verification Method.
   - Send completion message to parent.
