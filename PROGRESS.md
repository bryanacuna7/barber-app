# Project Progress

> Auto-updated by Claude. Read at session start for context.

## Project Info

- **Name:** BarberApp
- **Stack:** Next.js 16, React 19, TypeScript, Supabase, TailwindCSS, Framer Motion
- **Database:** PostgreSQL (Supabase project `zanywefnobtzhoeuoyuc`)
- **Last Updated:** 2026-02-27 (Session 191 — Animation Audit Execution)
- **Branch:** `main`
- **Version:** `0.9.20`
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

### Session 191: Animation Audit Execution (2026-02-27)

**Status:** COMPLETE. All 14 audit items resolved across 38+ files.

**What was done:**

- **P0 — dropdown.tsx complete rewrite:** AnimatePresence + exit animations, useReducedMotion, focus restore, design-system tokens (score 1.8→4.2)
- **P1 — command-palette.tsx:** Added useReducedMotion, scroll lock, replaced 3 hardcoded values with design-system tokens
- **P1 — drawer.tsx + sheet.tsx:** Added focus restore (previousFocusRef pattern) to both overlay components
- **P2 — RevealOnScroll:** Reduced displacement y:50→y:20 for subtler Apple-like animations
- **P2 — Dead code cleanup:** Removed duplicate StaggerContainer/StaggerItem from page-transition.tsx, deleted unused toast-refactored.tsx, updated index.ts exports
- **Performance — transition-all migration:** Replaced ALL 55+ `transition-all` occurrences across 38+ files with explicit CSS transition properties (e.g., `transition-[border-color,box-shadow]`). Zero `transition-all` or `transition: all` remaining in codebase.
- **CSS globals:** Fixed 4 `transition: all` patterns in globals.css (.interactive, .ios-segment-item, .ios-capsule, .touch-active)

**Verification:**

- `npx next build` — passed
- `npx eslint` — clean on changed files
- Visual smoke test on 6 pages (dashboard, citas, horario, clientes, reservar, configuracion, analiticas) — no regressions
- Grep confirms 0 remaining `transition-all` and 0 `transition: all`

**Files rewritten (1):** `src/components/ui/dropdown.tsx`
**Files modified (40+):** command-palette, drawer, sheet, page-transition, index.ts, globals.css, progress, radio-group, ios-date-picker, ios-time-picker, color-picker, appointment-card, appointment-filters, appointment-form, + 30 additional component files via parallel agent
**Files deleted (1):** `src/components/ui/toast-refactored.tsx`

### Session 190: Analytics Refactor + Dashboard Polish (2026-02-27)

**Status:** COMPLETE. Ready to deploy.

**What was done:**

- **Analytics 3-Tab Refactor:** Split monolithic analytics page into Negocio | Clientes | Equipo tabs with lazy-loaded components
- **Client Metrics Hook:** Extracted `useClientMetrics` + `useAllClients` for reusable KPIs (segment donut, churn/winback/upsell insights)
- **Client Segments Extraction:** Pure business logic in `client-segments.ts` + visual config in `segment-config.ts` (shared between Clientes page + Analytics)
- **Clientes Page Cleanup:** Removed inline Recharts, uses extracted segments/metrics hooks, WhatsApp deep links
- **Citas Stats Simplified:** Merged pending+confirmed into single "Agendadas" stat
- **Check-in Route Enhanced:** Now accepts `confirmed` appointments (without started_at) in addition to `pending`
- **Check-in Security Tests:** Extended test suite for confirmed status + already-started guard
- **More Menu iOS Redesign:** Section-grouped items with iOS-style colored icon squares
- **Barber Appointment Card:** Minor fix (import cleanup)
- **Realtime Subscriptions Hook:** New standalone hook for business subscription WebSocket changes

**Files created (8):** `clientes-tab.tsx`, `equipo-tab.tsx`, `negocio-tab.tsx`, `segment-config.ts`, `useAllClients.ts`, `useClientMetrics.ts`, `use-realtime-subscriptions.ts`, `client-segments.ts`
**Files modified (11):** `analiticas/page-v2.tsx`, `citas/page-v2.tsx`, `clientes/page-v2.tsx`, `mi-dia/page-v2.tsx`, `check-in/route.ts`, `check-in/route.security.test.ts`, `clients/route.ts`, `barber-appointment-card.tsx`, `more-menu-drawer.tsx`, `useAppointments.ts`, `clients.ts`

### Session 189: UX Polish + Booking Hardening (2026-02-26)

**Status:** COMPLETE. 4 commits ready to deploy.

**What was done:**

- **Touch Targets (a11y):** Enforced 44x44px minimum on all icon buttons (modal/sheet close, dropdowns, password toggle, dismiss)
- **Mobile Responsive:** Switched action button grids to single-column on mobile (barber cards, install prompt, cancel/reschedule)
- **Button Overflow:** Added `text-ellipsis` + `whitespace-nowrap` to `<Button>` base styles
- **Booking Loading:** New skeleton component (`BookingLoadingState`) matching real layout + Next.js `loading.tsx` route
- **Booking Retry:** Error screen now shows contextual message + "Reintentar" button; slow-loading hint after 8s
- **Timezone Fix:** Availability slot filtering now uses `toZonedTime()` with business timezone (was using server local time)
- **SEO/PWA:** OpenGraph + Twitter card metadata on booking pages; manifest gains maskable icons, orientation, scope, branded splash bg
- **Barber Edit:** Inline name/email editing in barber detail modal (pencil button → edit mode → save/cancel)
- **Proper Logout:** Replaced `<Link href="/login">` with `<LogoutButton>` that calls `supabase.auth.signOut()` before redirect
- **Share Name:** Stats API returns both `name` (display-normalized) and `shareName` (original) for booking links
- **i18n:** "Revenue" → "Ingresos" in citas stats panel

**Commits:** `c99e684` (touch targets), `b0c8fd1` (booking), `4629b6e` (barberos edit), `9acfc05` (dashboard fixes)

### Session 188: Client Booking Bridge + Auto-Fill (2026-02-25)

**Status:** COMPLETE. Deployed as v0.9.17.

**What was done:**

- **Login Smart Redirect:** Clients go to `/mi-cuenta`, owners/barbers to `/dashboard` (login + middleware)
- **Open Redirect Prevention:** Safe redirect validation blocks `//`, `/login`, `/register` loops
- **BookingHeader Pill:** "Mi Cuenta" link visible only for authenticated clients (not owners/barbers)
- **Booking Banner:** Dismissible "Tienes citas programadas" banner for clients
- **BookingSuccess CTA:** "Ver mis citas" button after completing a booking (clients only)
- **Track Page Link:** "Ver todas mis citas" in footer for authenticated clients
- **Owner/Barber Exclusion:** isClient gate checks `businesses.owner_id` + `barbers.user_id` to exclude staff
- **Form Auto-Fill:** Pre-fills name, phone, email from `clients` table for returning clients (step 4)
- **Deterministic Query:** `.order('created_at', { ascending: false })` for duplicate-safe client lookup

**Files modified (5):** `login/page.tsx`, `middleware.ts`, `reservar/[slug]/page.tsx`, `BookingSuccess.tsx`, `track/[token]/page.tsx`
**Files unchanged but verified:** `BookingHeader.tsx` (already had local changes)

### Session 187: In-App Guide + Dead Links Fix + Contextual Tips (2026-02-25)

**Status:** COMPLETE. Deployed as v0.9.15.

**What was done:**

- **In-App Guide (`/guia`):** 10 comprehensive sections covering all app features, with search (Fuse.js), desktop TOC sidebar (IntersectionObserver), mobile floating "Índice" pill
- **Dead Links Fixed:** "Documentación" → "Guía de Uso" (`/guia`), "Soporte" → WhatsApp (`wa.me/50688888888`)
- **Contextual Tips:** Dismissible blue info boxes on 5 key pages (dashboard, citas, servicios, clientes, configuración) linking to relevant guide sections
- **Route Protection:** Added `/guia` to barber-allowed paths, middleware, mobile-header topLevelRoutes, bottom-nav, command-palette, sidebar
- **Anchor Navigation:** Hash-based scroll after React hydration for deep links like `/guia#citas`
- **Content Fix:** Removed "Creá tu cuenta" from Primeros Pasos (owners already have accounts)

**Files created (7):** `src/lib/guide/guide-content.ts`, `src/components/guide/guide-section.tsx`, `src/components/guide/guide-search.tsx`, `src/components/guide/guide-toc-sidebar.tsx`, `src/components/guide/guide-toc-sheet.tsx`, `src/components/guide/guide-contextual-tip.tsx`, `src/app/(dashboard)/guia/page.tsx`

**Files modified (12):** `roles.ts`, `middleware.ts`, `mobile-header.tsx`, `sidebar.tsx`, `bottom-nav.tsx`, `command-palette.tsx`, `more-menu-drawer.tsx`, `dashboard-content.tsx`, `configuracion/page.tsx`, `servicios/page-v2.tsx`, `clientes/page-v2.tsx`, `citas/page-v2.tsx`

---

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

### Sessions 178–182 (archived)

---

## Current State

### Working

- v0.9.20 (Session 190: Analytics Refactor + Dashboard Polish)
- All UX polish gates complete (E + F + card hierarchy + header CTA)
- In-app guide with 10 sections, search, TOC, contextual tips
- Zero dead links in mobile drawer menu
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
2. Comprehensive testing before sharing with first real barber client
3. Landing page review
