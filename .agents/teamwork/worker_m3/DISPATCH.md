## 2026-10-06T04:50:27Z
You are worker_m3 (Auth Security Hardening Worker).
Your working directory is: c:\Users\Anay0216\Documents\Coding\ScanServe_Dashboard-main\.agents\teamwork\worker_m3

Authoritative user requirements are located at:
c:\Users\Anay0216\Documents\Coding\ScanServe_Dashboard-main\.agents\teamwork\ORIGINAL_REQUEST.md
You MUST read ORIGINAL_REQUEST.md before starting work.

Also read PROJECT.md at:
c:\Users\Anay0216\Documents\Coding\ScanServe_Dashboard-main\.agents\teamwork\orchestrator_1\PROJECT.md
And reference Explorer 1 findings at:
c:\Users\Anay0216\Documents\Coding\ScanServe_Dashboard-main\.agents\teamwork\explorer_survey_1\survey_report.md

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Exclusively owned files:
- `src/lib/authService.ts`
DO NOT modify any other files in the project.

Your Objective (Milestone M3 / Requirement R1):
1. Harden `src/lib/authService.ts`:
   - In `verifyStaffPassword` and `verifyAdminPassword`, restrict default demo passcodes ('1234', 'admin123', 'staff123', etc.) strictly to development environments by wrapping them inside `if (import.meta.env.DEV)`.
   - In production builds (`import.meta.env.DEV` is falsy), demo passcodes MUST NOT be granted access immediately. They must fall through to the server `/api/auth/verify` endpoint or Supabase `app_passwords` table lookup.
   - Import and use `resolveApiUrl` from `./apiConfig` (e.g. `import { getApiBaseUrl, resolveApiUrl } from './apiConfig';`) so that `/api/auth/verify` calls use `fetch(resolveApiUrl('/api/auth/verify'), ...)`. This ensures mobile Android APKs route correctly to the POS server IP.
   - Update fallback error messages so they do not leak demo credentials in production:
     In `verifyStaffPassword`:
     `message: import.meta.env.DEV ? 'Invalid Passcode. Use default (1234 / staff123) or configure in Supabase.' : 'Invalid Passcode. Credentials not found or invalid in database.'`
     In `verifyAdminPassword`:
     `message: import.meta.env.DEV ? 'Invalid Admin Passcode. Use default (1234 / admin123) or configure in Supabase.' : 'Invalid Admin Passcode. Credentials not found or invalid in database.'`
2. Verification:
   - Run `npm run lint` (`tsc --noEmit`) to verify zero TypeScript errors.
   - Verify code structure ensures clean separation of DEV vs PROD execution branches.
3. Deliverables:
   - Write `changes.md` in your working directory detailing all edits.
   - Write `handoff.md` with Observation, Logic Chain, Caveats, Conclusion, and Verification Method.
   - Send completion message to parent.
