# Project Progress

> Auto-updated by Claude. Read at session start for context.

## Project Info

- **Name:** BarberApp
- **Stack:** Next.js 16, React 19, TypeScript, Supabase, TailwindCSS, Framer Motion
- **Database:** PostgreSQL (Supabase project `zanywefnobtzhoeuoyuc`)
- **Last Updated:** 2026-02-25 (Session 186 — Smart Duration Per-Client + Gap-Based Slots)
- **Branch:** `main`
- **Version:** `0.9.13`
- **Phase:** Customer Discovery — solving real barber pains
- **Roadmap:** [`ROADMAP.md`](ROADMAP.md)

---

## What's Built

### Core Platform

- Sistema de reservas online + Dashboard administrativo
- Gamificacion (Client Loyalty + Barber + SaaS Referral)
- PWA + branding personalizable + Push Notifications
- RBAC (4 roles: admin, owner, barber, client)
- Super Admin Panel (6 pages + 11 API routes)

### Customer Discovery Features (Sessions 152–181)

- **Duration Tracking** — Iniciar→Timer→Completar→Pago (3 taps max)
- **Smart Duration (P1)** — ML-style duration prediction from historical data, per-business toggle
- **Smart Slots + Descuentos (Feature 2)** — Demand heatmap, promo rules config, booking discounts
- **Client Cancel/Reschedule (Feature 3 Part 1)** — Cancel/reschedule from tracking page, configurable policy, auto-notifications
- **SINPE Advance Payment (Feature 3 Part 2)** — Optional prepayment with configurable discount, proof upload/WhatsApp, owner verification
- **Payment Methods** — Owner-configurable (Efectivo/SINPE/Tarjeta), smart completion flow, in-app documentation
- **Push Notifications** — VAPID + SW + 4 event triggers (booking, check-in, complete, no-show)
- **WhatsApp Deep Links** — "Llega Antes" CTA, pre-filled messages
- **Client Dashboard** — `/mi-cuenta` with home, profile, loyalty, multi-business
- **Public Tracking** — Uber-style `/track/[token]` (5 states), cron reminders (24h + 1h)
- **Invite Barbers** — Email invitations with credentials

### UI/UX Polish (Sessions 133–174)

- **9 Olas** of UI Premium Simplification (all complete)
- **Desktop Premium Plan** (D0–D8 complete) — Command palette, sidebar redesign, hover actions, skeletons
- **Color Audit** (3 phases) — Brand tokens, gradient unification, `text-muted` migration
- **Configuracion** decomposed into 7 Next.js subroutes
- Mobile UX Audit (11 critical fixes), Motion Tokens, Gesture Hardening

### Infrastructure

- Security Hardening (IDOR fixed, rate limiting, referral RLS tightened)
- Performance (7 DB indices, N+1 fixed, 7-10x faster)
- Egress Optimization (migrated Supabase project)
- Migrations: 025–038 all executed
- E2E Audit: 12/13 findings resolved (Session 183)
- Notification Orchestrator (centralized send with dedup + audit logging)
- Barber Blocks (agenda blocks / vacations / breaks)
- CSV Exports (clients + appointments)
- Per-barber custom permissions
- Account Claim Token (IDOR security fix)

---

## UX Polish (all complete)

- [x] Charts mobile-first redesign (Gate E: DONE — Session 184)
- [x] Copy UX Spanish consistency (Gate F: DONE — Session 185)
- [x] Card padre / double inset removal (DONE — Session 185)
- [x] Header CTA Contract consistency (DONE — Session 185)

---

## Recent Sessions

### Session 185: UX Polish + Deploy v0.9.8 (2026-02-24)

**Status:** COMPLETE. All UX polish gates resolved, deployed as v0.9.8.

**What was done:**

- **Gate F (Spanish Copy):** "Email" → "Correo" in booking form and notification preferences (3 labels)
- **Header CTA Contract:** Standardized 4 deviant pages (Configuración, Changelog, Suscripción, Lealtad) to use `app-page-title` + `brand-gradient-text`
- **Card Padre:** Removed double border/inset in loyalty-preview.tsx and client-status-card.tsx
- **Root Cleanup:** Archived AUDIT.md, P1_DYNAMIC_DURATION_SCHEDULING_PLAN.md, PLAN_CUSTOMER_DISCOVERY.md to docs/archive/2026-02/
- **Deploy:** Version bumped to v0.9.8 with CHANGELOG + RELEASE_NOTES

**Commits:** `9b33ba8` (session 184 features), `5107d43` (UX polish), release commit

---

### Session 184: Full Pending Plan Implementation (2026-02-24)

**Status:** COMPLETE. 6 sprints executed covering security, notifications, operations, client UX, and polish.

**What was done:**

- **Sprint 1 (Security + Foundation):**
  - CRITICAL: Fixed IDOR vulnerability in client account claim flow (claim_token server-side)
  - Created migration 038 (notification_log, barber_blocks, appointments.source, barbers.custom_permissions, clients.claim_token)
  - Built Notification Orchestrator (`src/lib/notifications/orchestrator.ts`) with dedup, preference checking, and audit logging
  - New API: `POST /api/public/claim-account` — secure token-based account creation

- **Sprint 2 (Notification Hardening):**
  - Migrated 4 API routes to use orchestrator: complete, reschedule, cancel, book
  - Replaced 15+ inline notification calls with centralized `notify()` calls
  - Created `GET /api/notifications/log` endpoint for owner audit dashboard

- **Sprint 3 (Operations):**
  - Barber blocks: CRUD hooks, API routes, availability integration (blocks filter slots)
  - Per-barber custom permissions: `mergePermissions()`, separate owner/barber Zod schemas, anti-self-escalation
  - Appointment source tracking: `source: 'owner_created'` in dashboard creation
  - CSV exports: `GET /api/exports/clients` and `GET /api/exports/appointments` (rate limited, owner-only)

- **Sprint 4 (Client UX):**
  - Added `<InstallPrompt />` to mi-cuenta page
  - Created barber onboarding checklist component (3 steps: photo, schedule, push)
  - Integrated onboarding into mi-dia with localStorage dismiss

- **Sprint 5 (UX Polish):**
  - Charts mobile-first: responsive height (200px/300px), touch-friendly tooltips, smaller axis text
  - Demand heatmap: horizontal scroll wrapper on mobile

- **Sprint 6 (Documentation):**
  - Updated DATABASE_SCHEMA.md with all migration 038 changes
  - Fixed notification_preferences documentation (business_id, not user_id)
  - Updated PROGRESS.md

**Files created (15):**

- `supabase/migrations/038_notifications_blocks_source_permissions.sql`
- `src/app/api/public/claim-account/route.ts`
- `src/lib/notifications/types.ts`, `dedup.ts`, `orchestrator.ts`, `index.ts`
- `src/app/api/notifications/log/route.ts`
- `src/app/api/barber-blocks/route.ts`, `[id]/route.ts`
- `src/app/api/exports/clients/route.ts`, `appointments/route.ts`
- `src/hooks/queries/useBarberBlocks.ts`
- `src/components/barber/onboarding-checklist.tsx`

**Files modified (15+):**

- `src/app/api/public/[slug]/book/route.ts` (claim tokens + source + orchestrator)
- `src/app/api/public/cancel/route.ts` (orchestrator)
- `src/app/api/public/reschedule/route.ts` (orchestrator)
- `src/app/api/appointments/[id]/complete/route.ts` (orchestrator)
- `src/app/api/appointments/route.ts` (source tracking)
- `src/app/api/barbers/[id]/route.ts` (custom_permissions, dual schemas)
- `src/app/api/public/[slug]/availability/route.ts` (blocks integration)
- `src/lib/auth/roles.ts` (mergePermissions, customPermissions param)
- `src/hooks/useBookingData.ts` (claimToken state)
- `src/app/(public)/reservar/[slug]/page.tsx` (pass claimToken)
- `src/components/reservar/BookingSuccess.tsx` (claimToken prop)
- `src/components/loyalty/client-account-modal.tsx` (complete rewrite)
- `src/app/(client)/mi-cuenta/page.tsx` (InstallPrompt)
- `src/app/(dashboard)/mi-dia/page-v2.tsx` (onboarding checklist)
- 3 chart components (mobile-first responsive)

---

### Session 183: E2E Audit — Full Fix Pass (2026-02-23)

**Status:** COMPLETE. 12/13 issues resolved across 3 commits.

**What was done:**

- Reviewed `AUDITORIA_E2E_COMPLETA.md` (7 P0, 6 P1, 3 P2 findings)
- Verified all findings against actual codebase — all confirmed real
- **Ronda 1 (P0 quick wins):** Fixed broken auth CTAs (`/auth/signup`→`/register`), added post-booking navigation (calendar + "Volver a reservar"), added 429 rate limit guard in React Query
- **Ronda 2 (Test alignment):** Rewrote `mi-dia.spec.ts` with correct testids, fixed auth redirect regex in all E2E specs (`/dashboard` → `/(dashboard|mi-dia)/`), split duplicate testid, fixed ambiguous heading selector
- **Ronda 3-4 (UX polish):** Spanish field-level validation on booking form, disabled slot line-through + contrast, install prompt repositioned to top on mobile, service card price layout fix

**Commits:** `845a1c0` (P0 blockers), `2d06e35` (docs), `aa81b6c` (P1/P2 UX)

**Not fixed:** P2-BAR-01 (calendar timezone) — uses `new Date()` directly, not actionable without repro

### Session 182: Feature 3 Part 2 — SINPE Advance Payment (2026-02-23)

**Status:** COMPLETE. Deployed as v0.9.7.

**What was built:**

- **Advance Payment Config** — 5 business columns (enabled, discount %, deadline hours, SINPE phone, holder name)
- **Settings API** (`/api/settings/advance-payment`) — GET/PUT for owner config with validation
- **Public Info API** (`/api/public/advance-payment/[slug]`) — SINPE details + discount calculation for clients
- **Proof Submit API** (`/api/public/advance-payment/submit`) — Handles both file upload (Supabase Storage) and WhatsApp channel
- **Verify/Reject API** (`/api/appointments/[id]/verify-payment`) — Owner approves or rejects with audit trail
- **Payment Proof API** (`/api/appointments/[id]/payment-proof`) — Signed URL (1h expiry) for viewing proofs
- **Config UI** (`AdvancePaymentSection`) — Toggle + 4 fields in Configuracion > Pagos
- **Booking Success Banner** — Post-booking CTA with discount amount when business has advance payment enabled
- **Submit Component** (`advance-payment-submit.tsx`) — SINPE copy, WhatsApp deep link, file upload, 4-state flow
- **Owner Badge + Verification** — Amber "Pago pendiente" / Green "Pago verificado" badges on appointment cards + verification modal
- **Email Template** (`advance-payment-verified.tsx`) — Dual variant (verified/rejected)
- **Storage Cleanup** — 30-day auto-cleanup of verified/rejected proofs in cron
- **Migration 037** — 10 appointment columns + 5 business columns + CHECK constraints + partial index
- **Storage Bucket** — `deposit-proofs` (private, 5MB, images only)

### Session 181: Feature 3 Part 1 — Client Cancel/Reschedule (2026-02-23)

**Status:** COMPLETE. Deployed as v0.9.6.

**What was built:**

- **Cancellation Policy** — JSONB config on businesses table (`enabled`, `deadline_hours`, `allow_reschedule`)
- **Cancel API** (`/api/public/cancel`) — Token-auth, deadline enforcement, DB update, owner notification (push + email + in-app)
- **Reschedule API** (`/api/public/reschedule`) — Creates new appointment linked via `rescheduled_from`, cancels original, notifies owner
- **Cancel Policy API** (`/api/public/cancel-policy/[slug]`) — Public endpoint for tracking page to check policy
- **Settings API** (`/api/settings/cancellation-policy`) — GET/PUT for owner config
- **Track Page UI** — Cancel/reschedule buttons with deadline guard, confirmation modal, success states
- **Config UI** (`CancellationPolicySection`) — Toggle + deadline hours + allow reschedule in Configuracion > Pagos
- **Email Template** (`appointment-cancelled.tsx`) — React Email template for cancellation notifications
- **In-app Payment Docs** — "Como funciona?" info box explaining payment methods are for record-keeping
- **Migration 035** — Tighter RLS on referral_conversions
- **Migration 036** — cancellation_policy JSONB + appointment cancel metadata columns

**Bugs fixed during development:**

1. Status guard used non-existent `scheduled` — changed to `pending`/`confirmed`
2. Cancel/reschedule APIs selected non-existent `client_name/phone/email` columns — fixed with Supabase join `client:clients(name, phone, email)`
3. Reschedule insert used non-existent columns — fixed to use `client_id`

**Files created:** `src/app/api/public/cancel/route.ts`, `src/app/api/public/reschedule/route.ts`, `src/app/api/public/cancel-policy/[slug]/route.ts`, `src/app/api/settings/cancellation-policy/route.ts`, `src/components/settings/cancellation-policy-section.tsx`, `src/components/track/cancel-reschedule-actions.tsx`, `src/lib/email/templates/appointment-cancelled.tsx`, `supabase/migrations/035_*.sql`, `supabase/migrations/036_*.sql`

### Session 180: Feature 2 — Smart Slots + Descuentos (2026-02-23)

**Status:** COMPLETE. Deployed as v0.9.5.

- Promo Engine, Demand Heatmap, Promo Config Page, Booking discounts
- Migration 034 executed

### Session 179: Bug Fixes from User Feedback (2026-02-23)

**Status:** 3 fixes applied (config back nav, clientes duplicate, cards cut off)

### Session 178: P1 Smart Duration Committed (2026-02-10)

**Status:** COMMITTED. Migrations 032+033 executed + backfill.

---

## Current State

### Working

- v0.9.8 (Session 184+185: security, orchestrator, blocks, permissions, exports, UX polish)
- All UX polish gates complete (E + F + card hierarchy + header CTA)
- Brand tokens, `text-muted`, `<Button>` component migrated
- Charts theme-aware, PWA native, gestures hardened

### Session 186: Smart Duration Per-Client + Gap-Based Slots (2026-02-25)

**Status:** COMPLETE — All 8 steps implemented + migration 043 executed + 22 tests passing.

**What was done:**

- **5-level cascade prediction**: Client+Barber+Service → Client+Service → Barber stats → Service stats → Default
- **Gap-based slot algorithm**: Occupied windows → gaps → precise slots with tail + dedup + past guards
- **Server-side client resolution**: Shared `resolveClientForBusiness()` in both availability + book routes
- **Phone normalization**: CR 8-digit format with collision-safe gradual migration
- **UI**: `~N min` estimate display with tilde prefix when prediction differs from default
- **Auto-refresh**: Only when `meta.autoRefresh=true` AND today (timezone-safe)
- **Test data**: 5 test clients with varying durations seeded for visual verification
- **Tests**: 20 new gap-based unit tests (22 total, all passing)

**Files created (3):** `src/lib/utils/phone.ts`, `src/lib/utils/resolve-client.ts`, `supabase/migrations/043_client_duration_index.sql`
**Files modified (7):** `duration-predictor.ts` (5-level cascade), `availability.ts` (gap-based), `availability/route.ts` (server-side client + gapBased + predictedDuration meta), `book/route.ts` (phone normalization + predictorClientId split), `useBookingData.ts` (slotMeta export + reset), `DateTimeSelection.tsx` (~N min estimate), `page.tsx` (pass predictedDuration prop)
**Tests added:** `availability.test.ts` — 20 new tests across 6 describe blocks (gap basics, effective windows, buffers, tail slots, dedup, edge cases)
**DATABASE_SCHEMA.md** updated with new index. Migration 043 executed.

---

### Next Steps

1. **Button migration** (~30 remaining raw buttons across dashboard pages)
2. Push 6 unpushed commits + deploy
