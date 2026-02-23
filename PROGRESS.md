# Project Progress

> Auto-updated by Claude. Read at session start for context.

## Project Info

- **Name:** BarberApp
- **Stack:** Next.js 16, React 19, TypeScript, Supabase, TailwindCSS, Framer Motion
- **Database:** PostgreSQL (Supabase project `zanywefnobtzhoeuoyuc`)
- **Last Updated:** 2026-02-23 (Session 179 — Bug fixes)
- **Branch:** `feature/ui-ux-redesign`
- **Version:** `0.9.3` (LIVE on production)
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
- Migrations: 025–033 all executed

---

## Paused (resume after customer discovery)

- [ ] Charts mobile-first redesign (Gate E: FAIL)
- [ ] Copy UX Spanish consistency (Gate F: PENDING)
- [ ] Card padre / double inset removal
- [ ] Header CTA Contract consistency

---

## Recent Sessions

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

- v0.9.3 LIVE, all dashboard pages modernized
- Brand tokens, `text-muted`, `<Button>` component migrated
- Charts theme-aware, PWA native, gestures hardened

### Next Steps

1. **Deploy v0.9.4** — P1 Smart Duration + bug fixes (this session)
2. **Customer Discovery Phase B–F** — Client cancel/reschedule, notification orchestrator, SINPE deposits, smart demand
3. **UX Polish (paused)** — Charts, Spanish copy, card hierarchy
