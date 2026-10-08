# Vyoma ScanServe Dashboard — Agent Quickstart

This file captures the facts an agent needs before making changes. Every line answers: "Would an agent likely miss this without help?"

## Project Structure
- `src/` — React 19 + TypeScript entrypoint (`main.tsx` → `App.tsx`). Do **not** edit `.env` from here; read env via `import.meta.env`.
- `server/` — Express app (`server.ts` → `app.ts` + `server/routes/`). API routes mounted under `/api` in dev; Vercel serverless in `api/`.
- `api/` — Vercel serverless functions (rewrites to `/api/*` in `vercel.json`).
- `src/lib/` — Utilities: `supabase.ts`, `authService.ts`, `apiConfig.ts`, `sound.ts`, `orderSync.ts`, `dyno-adapter.ts`, `dispatch-status.ts`, `capacitorSetup.ts`.
- `components/` — shadcn/ui primitives under `src/components/ui/`. New components go under `src/components/<feature>/`.
- `server/ordersStore.ts` — In-memory order map + SSE broadcaster + Supabase client factory. **Single source of truth** for live orders in dev.
- `dist/` — Client + server CJS bundle (produced by `npm run build`).
- `release/` — Windows `.exe` output (produced by `npm run pack:win`).
- `apk/` — Android debug APK output.

## Developer Commands (exact, non-obvious)
- `npm run dev` — starts Express + Vite dev server via `tsx server.ts`. Serves API + Vite HMR. **Do not** run `node server.ts` directly in prod mode; it expects ESM/tsx.
- `npm run lint` — `tsc --noEmit`. Runs type-check only. Does **not** run a linter (no eslint configured).
- `npm run test` — `vitest run`. Uses `happy-dom`. Tests in `src/**/*.{test,spec}.{ts,tsx}`. **2s timeouts** on Supabase fetches (see `src/lib/supabase.ts`).
- `npm run build` — `vite build && node build.js`. Produces `dist/client` + `dist/server.cjs`. **Do not** skip `node build.js`; it generates the CJS server entry.
- `npm run pack:win` — `npm run clean && npm run build && electron-packager . Vyoma --platform=win32 --arch=x64 --out=release --overwrite --icon=assets/icon.ico --ignore="^(/(src|server|api|components|lib|scripts|android|apk|VyomPOS|design-system|graphify-out|release))"` & `--ignore="[.](git|agents|impeccable|md|pdf|xlsx|map)$"` & `prune=true`. **Must run `npm run clean` first**; it clears `dist` and `release`.
- `npm run apk:build` — `vite build && cap sync android && cd android && gradlew.bat assembleDebug && cd .. && powershell -Command "Copy-Item android/app/build/outputs/apk/debug/app-debug.apk apk/Vyoma_ScanServe_Dashboard_v1.0.apk -Force; Copy-Item android/app/build/outputs/apk/debug/app-debug.apk Vyoma_ScanServe.apk -Force"`. **Must run `npm run cap:sync` before Gradle**.
- `npm run cap:sync` — `vite build && cap sync android`. Syncs web build into Capacitor Android project.
- `npx cap add android` / `npx cap add ios` — add Capacitor native platforms. Only run in an environment with Android Studio / JDK.

## Environment Setup (critical gotchas)
1. Copy `.env.example` to `.env` at repo root.
2. **Required vars** (fill these):
   - `VITE_SUPABASE_URL` — Supabase project URL (client)
   - `VITE_SUPABASE_ANON_KEY` — Supabase anon key (client)
   - `SUPABASE_URL` — Same URL for Express/serverless
   - `SUPABASE_ANON_KEY` — Anon key for server routes
   - `SUPABASE_SERVICE_ROLE_KEY` — **Never expose to client**. Used by server routes.
3. **Optional vars**: `DYNO_API_KEY`, `DYNO_API_URL`, `TESTER_CALLBACK_URL`, `VITE_TESTER_CALLBACK_URL`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `SPREADSHEET_ID`, `SHEET_RANGE`.
4. **Never commit `.env`** — it is git-ignored.
5. Default passwords (dev only): staff `1234` / `staff123`, admin `admin123`. Rotate in production via Supabase SQL (see `README.md` → "Production Passcode Rotation").

## API Routes (mounted under `/api`)
| Route | Description |
|------|-------------|
| `GET /api/health` | Health check |
| `POST /api/auth/...` | Staff/admin password verification |
| `GET|POST /api/orders` | List/create orders |
| `GET /api/orders/events` | SSE stream of order updates |
| `GET|POST /api/customers` | Customer directory |
| `GET|POST /api/invoices` | GST invoice CRUD |
| `POST /api/webhooks/petpooja` | PetPooja order intake |
| `POST /api/webhooks/dyno` | Dyno order intake |
| `POST /api/webhooks/aggregator` | Generic aggregator intake |
| `GET /api/whatsapp/status` | WhatsApp connection status |
| `GET /api/whatsapp/qr` | Pairing QR |
| `POST /api/whatsapp/send-receipt` | Send receipt to guest |

Exact handlers live in `server/routes/` and `api/`.

## Realtime Strategy (three-layer fallback)
1. **Supabase realtime** channel `orders-realtime` — `postgres_changes` on `orders` table.
2. **SSE** at `/api/orders/events` — heartbeat every 20s; keeps connection alive through proxies.
3. **Polling** every ~3.5s (`setInterval(..., 3500)`) — safety net when SSE disconnects.
4. **`visibilitychange`** refetch — when tab regains focus, `fetchData()` runs immediately.

All three are wired in `src/App.tsx` (`useEffect` → SSE + poll + visibilitychange). **Do not** remove any layer without updating all three.

## Auth Password Gate
- Default staff passcode: `1234`. Default admin passcode: `admin123`.
- Verification order (in `src/lib/authService.ts`):
  1. Instant check against `DEFAULT_STAFF_PASSWORDS` / `DEFAULT_ADMIN_PASSWORDS` if `import.meta.env.DEV` or Supabase not configured.
  2. Server route `POST /api/auth/verify` (with 2s timeout).
  3. Direct Supabase query to `public.app_passwords` table (2s timeout).
- Passwords stored in `public.app_passwords` table (seeded by `supabase_schema.sql`).
- **To rotate**: run the SQL UPDATE statements in `README.md` → "Production Passcode Rotation".

## Sound Chimes (Web Audio API)
- `src/lib/sound.ts` — `soundService.playNewOrderSound()`, `playReadyChime()`, `playSuccessChime()`, `playTicketDispatchChime()`, `triggerVibration(pattern)`.
- Muted state persisted in `localStorage` (`vyoma_sound_muted`).
- **Do not** call `soundService.*` outside a browser context (causes runtime error).
- Vibration API (`navigator.vibrate`) for mobile — guarded for non-native platforms.

## Capacitor / Native Platform Quirks
- `src/lib/apiConfig.ts` — `setupApiInterceptor()` rewrites relative `/api/*` requests.
- **Android emulator**: `localhost` auto-converted to `10.0.2.2` (Android's loopback alias). Do not hardcode `127.0.0.1` in `.env` on Android.
- If no POS server IP configured, fetch returns immediate 503 with `{'message': 'No POS server configured on mobile'}` so callers fail over to Supabase/offline cache in 0ms.
- `initializeCapacitorAdaptations()` in `src/main.tsx` sets up back-button handler (double-press to exit), status bar styles, and wake lock for KDS/counter tablets.

## Testing Quirks
- Vitest with `happy-dom`. No real browser needed.
- Tests in `src/**/*.{test,spec}.{ts,tsx}`. Include pattern: `['src/**/*.{test,spec}.{ts,tsx}']`.
- **Every Supabase fetch has a 2s timeout** (via `withTimeout` helper in `authService.ts` or `Promise.race` in `main.tsx`). Tests should mock or skip network calls.
- SSE events tested by mocking `EventSource` or using `supabase channel` subscription mocks.
- **Do not** rely on real Supabase credentials in tests — use the placeholder URL/key from `.env.example` or set `isSupabaseConfigured` to `false`.

## Build Artifacts & Infra
- `dist/server.cjs` — CJS entry for production server (`node dist/server.cjs` starts it). Generated by `node build.js` during `npm run build`.
- `dist/client` — client bundle (React, CSS). Part of `vite build`.
- `release/Vyoma.exe` — Windows executable. Requires `assets/icon.ico`.
- `apk/debug APK` — Android debug build. Requires Android Studio, JDK 17, and `npm run cap:sync` first.
- `vercel.json` — routes `/api/*` to serverless functions; everything else → SPA.
- `supabase_schema.sql` — turnkey DB schema. Run in fresh Supabase project to create tables, indexes, RLS policies, triggers (`trg_sync_customer_from_order`).

## Critical Workflow Order
**Always** follow this order when making changes that affect the build or runtime:
1. `npm run lint` (type-check) — `tsc --noEmit`
2. `npm run build` — `vite build && node build.js`
3. Verify `dist/server.cjs` exists and runs.
4. If frontend changes: `npm run dev` to test interactively.
5. If Capacitor/APK changes: `npm run cap:sync` → `npm run apk:build`.
6. If auth/password changes: rotate defaults in Supabase + update `DEFAULT_*` constants in `src/lib/authService.ts`.

## References (existing instruction sources)
- `README.md` — full project overview, features, deployment, integrations.
- `DESIGN.md` — design system, palette, typography, glassmorphism utilities.
- `supabase_schema.sql` — database schema + default passcodes.
- `.env.example` — environment variable template.
- `server/app.ts` — Express CORS, webhook, auth, order routes.
- `src/lib/apiConfig.ts` — API base URL resolution + emulator localhost fix.
- `src/lib/authService.ts` — password verification flow (4-layer: defaults → server → Supabase → fallback).
- `src/main.tsx` — Capacitor init, API interceptor, ErrorBoundary.
- `src/App.tsx` — auth gate, realtime (SSE + polling + visibilitychange), data fetching.
- `.github/workflows/build-apk.yml` — CI Android build pipeline.
- `vitest.config.ts` — test configuration (happy-dom, 2s timeouts).

## Questions? (only if repo can't answer)
- Undocumented team conventions
- Branch / PR / release expectations
- Missing setup or test prerequisites that are known but not written down