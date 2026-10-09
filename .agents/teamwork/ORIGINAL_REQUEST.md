# Original User Request

## Initial Request — 2026-10-06T04:29:47Z

Remediate all client-delivery blockers, harden auth security, unify database schemas, fix invoicing error handling, organize CI/CD workflows, and implement an automated Vitest test suite for the VyomaPOS - Xtra Rooftop Dashboard.

Working directory: c:\Users\Anay0216\Documents\Coding\VyomaPOS_Dashboard-main
Integrity mode: development

## Requirements

### R1. Authentication Security Hardening
In src/lib/authService.ts, restrict default demo passcodes ('1234', 'admin123', 'staff123') strictly to development environments (import.meta.env.DEV). In production builds, strictly require passcodes to match credentials stored in the Supabase app_passwords table or verified via the server /api/auth/verify endpoint, preventing any backdoor access on customer premises.

### R2. Database Schema Consolidation & Documentation
Consolidate supabase_schema.sql so running it on a clean Supabase project creates all necessary objects:
- app_passwords table with default seed row or instructions and RLS policy
- expenses table with indexes and RLS policies
- receipts public storage bucket and storage RLS policies
Update .env.example and README.md to document the optional Google Sheets sync secrets (GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, SPREADSHEET_ID).

### R3. Invoicing Transaction Integrity & Error Handling
Update src/components/invoices/InvoiceCreator.tsx so that when /api/invoices or database persistence fails (!res.ok or data.success === false), the UI stops and displays a clear error toast. Do not trigger the success receipt modal unless the order is successfully saved.

### R4. Repository Cleanliness & CI/CD Organization
- Move build-apk.yml to .github/workflows/build-apk.yml.
- Untrack VyomPOS Leads.xlsx from git (git rm --cached "VyomPOS Leads.xlsx") while keeping the file on disk, and ensure *.xlsx is listed in .gitignore.
- Ensure .gitignore ignores temporary artifacts and test coverage folders.

### R5. Automated Testing Suite Setup
Install and configure Vitest with a dedicated npm test script. Implement unit and integration tests covering:
- GST calculation (5% tax, taxable subtotal, flat vs. percentage discounts, rounding)
- GSTIN format validation (15-character Indian format regex)
- Order status mapping (pending, preparing, ready, completed, cancelled)
- Auth verification logic (testing dev fallback vs production rejection)

## Acceptance Criteria

### Security & Auth Verification
- [ ] In production mode, entering 1234 or admin123 fails when the corresponding passcode is not in app_passwords
- [ ] In development mode, developer convenience logins continue to work seamlessly
- [ ] TypeScript type checks (npm run lint) pass with 0 errors

### Database Schema Verification
- [ ] supabase_schema.sql contains valid SQL DDL for app_passwords, expenses, and receipts storage bucket
- [ ] Documentation in README.md and .env.example includes all required configuration parameters

### Invoicing Reliability
- [ ] If the /api/invoices endpoint returns an error, an error toast is shown and false success notifications are prevented
- [ ] Successful API responses properly open the receipt modal

### Quality Assurance & Automated Tests
- [ ] npm test runs via Vitest and passes 100% of tests with zero failures
- [ ] Production build (npm run build) completes cleanly without errors
- [ ] .github/workflows/build-apk.yml is in the correct directory for GitHub Actions execution
- [ ] VyomPOS Leads.xlsx is no longer staged or tracked in git
