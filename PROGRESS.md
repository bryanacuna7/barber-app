# Project Progress

> Auto-updated by Claude. Read at session start for context.

## Project Info

- **Name:** BarberApp
- **Stack:** Next.js 16, React 19, TypeScript, Supabase, TailwindCSS, Framer Motion
- **Database:** PostgreSQL (Supabase project `zanywefnobtzhoeuoyuc`)
- **Last Updated:** 2026-02-23 (Session 182 — Feature 3 Part 2: SINPE Advance Payment)
- **Branch:** `feature/ui-ux-redesign`
- **Version:** `0.9.7` (LIVE on production)
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
- Migrations: 025–036 all executed

---

## Paused (resume after customer discovery)

- [ ] Charts mobile-first redesign (Gate E: FAIL)
- [ ] Copy UX Spanish consistency (Gate F: PENDING)
- [ ] Card padre / double inset removal
- [ ] Header CTA Contract consistency

---

## Recent Sessions

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

- v0.9.7 LIVE (SINPE Advance Payment + Cancel/Reschedule + Payment docs)
- Brand tokens, `text-muted`, `<Button>` component migrated
- Charts theme-aware, PWA native, gestures hardened

### Next Steps

1. **Customer Discovery Phase** — Next feature TBD
2. **UX Polish (paused)** — Button migration, charts mobile-first, card hierarchy, Spanish copy
