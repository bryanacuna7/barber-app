# Project Progress

> Auto-updated by Claude. Read at session start for context.

## Project Info

- **Name:** BarberApp
- **Stack:** Next.js 16, React 19, TypeScript, Supabase, TailwindCSS, Framer Motion
- **Database:** PostgreSQL (Supabase project `zanywefnobtzhoeuoyuc`)
- **Last Updated:** 2026-02-23 (Session 180 — Feature 2: Smart Slots + Descuentos)
- **Branch:** `feature/ui-ux-redesign`
- **Version:** `0.9.4` (LIVE on production, Feature 2 not yet deployed)
- **Phase:** Customer Discovery — solving real barber pains
- **Roadmap:** [`ROADMAP.md`](ROADMAP.md)

---

## What's Built

### Core Platform

- Sistema de reservas online + Dashboard administrativo
- Gamificación (Client Loyalty + Barber + SaaS Referral)
- PWA + branding personalizable + Push Notifications
- RBAC (4 roles: admin, owner, barber, client)
- Super Admin Panel (6 pages + 11 API routes)

### Customer Discovery Features (Sessions 152–178)

- **Duration Tracking** — Iniciar→Timer→Completar→Pago (3 taps max)
- **Smart Duration (P1)** — ML-style duration prediction from historical data, per-business toggle
- **Smart Slots + Descuentos (Feature 2)** — Demand heatmap, promo rules config, booking discounts
- **Payment Methods** — Owner-configurable (Efectivo/SINPE/Tarjeta), smart completion flow
- **Push Notifications** — VAPID + SW + 4 event triggers (booking, check-in, complete, no-show)
- **WhatsApp Deep Links** — "Llegá Antes" CTA, pre-filled messages
- **Client Dashboard** — `/mi-cuenta` with home, profile, loyalty, multi-business
- **Public Tracking** — Uber-style `/track/[token]` (5 states), cron reminders (24h + 1h)
- **Invite Barbers** — Email invitations with credentials

### UI/UX Polish (Sessions 133–174)

- **9 Olas** of UI Premium Simplification (all complete)
- **Desktop Premium Plan** (D0–D8 complete) — Command palette, sidebar redesign, hover actions, skeletons
- **Color Audit** (3 phases) — Brand tokens, gradient unification, `text-muted` migration
- **Configuración** decomposed into 7 Next.js subroutes
- Mobile UX Audit (11 critical fixes), Motion Tokens, Gesture Hardening

### Infrastructure

- Security Hardening (IDOR fixed, rate limiting)
- Performance (7 DB indices, N+1 fixed, 7-10x faster)
- Egress Optimization (migrated Supabase project)
- Migrations: 025–034 all executed

---

## Paused (resume after customer discovery)

- [ ] Charts mobile-first redesign (Gate E: FAIL)
- [ ] Copy UX Spanish consistency (Gate F: PENDING)
- [ ] Card padre / double inset removal
- [ ] Header CTA Contract consistency

---

## Recent Sessions

### Session 180: Feature 2 — Smart Slots + Descuentos (2026-02-23)

**Status:** COMPLETE. Migration 034 executed. All phases implemented.

**What was built:**

- **Promo Engine** (`src/lib/promo-engine.ts`) — shared `evaluatePromo()`, `computeDiscountedPrice()`, `validatePromoRules()` used by both availability and booking APIs
- **Demand Heatmap** — analytics API (`/api/analytics/heatmap`) + React component with CSS grid (7 cols × operating hours)
- **Promo Config Page** (`/configuracion/promociones`) — rule CRUD with Modal, day/hour pickers, discount type/value, service filter, inline delete
- **Settings API** (`/api/settings/promotional-slots`) — GET/PUT with validation (max 20 rules, start<end, percent<=100)
- **Availability API enrichment** — returns `EnrichedTimeSlot[]` with `discount: SlotDiscount | null`
- **Book API transparent pricing** — accepts `promo_rule_id`, returns `BookingPricing` with original/final price + reason
- **Booking UI** — emerald discount badges on time slots, strikethrough prices, discount label in confirmation
- **Types** — `PromoRule`, `SlotDiscount`, `EnrichedTimeSlot`, `BookingPricing` in `src/types/`
- **Timezone utils** — DST-safe `getHourInTimezone()`, `getDayOfWeekInTimezone()` using `date-fns-tz`
- **Unit tests** — 10 test cases for promo-engine (boundaries, DST, overlaps, clamp)
- **Migration 034** — `promotional_slots JSONB DEFAULT '[]'` on businesses table

**Bug fixed:** Heatmap crashed when `operatingHours` had `null` entries — added null guard in `demand-heatmap.tsx`

**Files created:** `src/types/promo.ts`, `src/lib/utils/timezone.ts`, `src/lib/promo-engine.ts`, `src/lib/__tests__/promo-engine.test.ts`, `src/app/api/analytics/heatmap/route.ts`, `src/app/api/settings/promotional-slots/route.ts`, `src/components/analytics/demand-heatmap.tsx`, `src/app/(dashboard)/configuracion/promociones/page.tsx`, `supabase/migrations/034_promotional_slots.sql`

**Files modified:** `src/types/api.ts`, `src/types/index.ts`, `src/hooks/queries/useAnalytics.ts`, `src/lib/react-query/config.ts`, `src/app/(dashboard)/configuracion/page.tsx`, `src/components/dashboard/mobile-header.tsx`, `src/app/api/public/[slug]/availability/route.ts`, `src/app/api/public/[slug]/book/route.ts`, `src/hooks/useBookingData.ts`, `src/components/reservar/DateTimeSelection.tsx`, `src/components/reservar/ClientInfoForm.tsx`, `src/app/(public)/reservar/[slug]/page.tsx`, `DATABASE_SCHEMA.md`

### Session 179: Bug Fixes from User Feedback (2026-02-23)

**Status:** 3 fixes applied, TypeScript clean.

1. **Configuración back navigation** — `router.back()` replaced with `router.push(fallback)` in mobile-header.tsx. `document.referrer` doesn't update in SPA navigation, causing reloads.
2. **Clientes duplicated in "Más"** — Added `barberMenuOnly` flag to Clientes menu item. Owners have it in bottom nav already; barbers still see it via permission.
3. **Clientes cards cut off** — Removed `min-h-screen` from page wrapper (layout already provides min-height). Last cards were hidden behind bottom nav.

**Files:** `mobile-header.tsx`, `more-menu-drawer.tsx`, `clientes/page-v2.tsx`

### Session 178: P1 Smart Duration Committed (2026-02-10)

**Status:** COMMITTED (`427ba13`). Migrations 032+033 executed + backfill.

- Duration predictor: barber+service (≥5 samples) → service-wide (≥3) → default
- Availability + booking APIs use predicted duration when flag ON
- Analytics card with KPIs (recovered time, avg duration)
- Feature toggle in Configuración > Avanzado (OFF by default)

### Session 176: Deploy v0.9.3 (2026-02-10)

- Fixed duplicate function in format.ts, deleted stale page-old.tsx
- Vercel Hobby cron limit: changed from `*/15 * * * *` to `0 8 * * *` (1h reminders degraded)
- `vercel --prod` manual deploy successful

---

## Current State

### Working

- v0.9.4 LIVE (Smart Duration + bug fixes + docs cleanup)
- Feature 2: Smart Slots + Descuentos COMPLETE (not yet deployed)
- Brand tokens, `text-muted`, `<Button>` component migrated
- Charts theme-aware, PWA native, gestures hardened

### Next Steps

1. **Deploy Feature 2** — Bump version, update CHANGELOG + RELEASE_NOTES, deploy
2. **Customer Discovery Phase C–F** — SINPE deposits, client cancel/reschedule, notifications
3. **UX Polish (paused)** — Button migration, charts mobile-first, card hierarchy, Spanish copy
