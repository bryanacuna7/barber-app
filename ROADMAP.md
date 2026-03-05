# ROADMAP - BarberApp

**Version:** 0.9.28
**Updated:** 2026-03-05 (Session 200)
**Source of Truth:** This is the ONLY roadmap document. All others are archived.
**Philosophy:** [docs/PHILOSOPHY.md](docs/PHILOSOPHY.md)

---

## What's Built (Completed)

Everything below is DONE and in production on `main`:

### Core Platform

- Booking system, dashboard, client management, services, barber profiles
- Gamification (Client Loyalty + Barber Leaderboard + SaaS Referral)
- PWA mobile-first, installable, auto-update (iOS fix), custom barber pole icon
- Subscriptions: Basic ($12/mo) + Pro ($29/mo), SINPE payment, trial system
- Custom domain: `nexocr.pro` + wildcard subdomains (`slug.nexocr.pro`)

### Security & Infrastructure

- RBAC (4 roles: admin, owner, barber, client)
- IDOR fixes, rate limiting, XSS/CSRF protection, 28+ security tests
- 7 DB indexes, N+1 fixes (7-10x faster), WebSocket for Mi Dia
- Pino structured logging, Sentry error tracking, Redis rate limiting
- Supabase egress optimization (migrated project, caching, selective queries)
- TypeScript strict mode (0 errors), ESLint (0 errors)
- Notification Orchestrator (centralized send with dedup + audit logging)
- Barber blocks (agenda blocks / vacations / breaks)
- CSV exports (clients + appointments)
- Per-barber custom permissions
- Account claim token (IDOR security fix)
- E2E audit: 12/13 findings resolved

### Customer Discovery Features (Sessions 152-186)

- **Duration Tracking** — Iniciar > Timer > Completar > Pago (3 taps max)
- **Smart Duration** — ML-style 5-level cascade prediction, per-business toggle
- **Gap-Based Slots** — Occupied windows > gaps > precise slots with tail + dedup
- **Smart Slots + Descuentos** — Demand heatmap, promo rules config, booking discounts
- **Client Cancel/Reschedule** — From tracking page, configurable policy, auto-notifications
- **SINPE Advance Payment** — Optional prepayment with discount, proof upload/WhatsApp
- **Payment Methods** — Owner-configurable (Efectivo/SINPE/Tarjeta), smart completion flow
- **Push Notifications** — VAPID + SW + 4 event triggers
- **WhatsApp Deep Links** — "Llega Antes" CTA, pre-filled messages
- **Client Dashboard** — `/mi-cuenta` with home, profile, loyalty, multi-business
- **Public Tracking** — Uber-style `/track/[token]` (5 states), cron reminders (24h + 1h)
- **Invite Barbers** — Email invitations with credentials
- **In-App Guide** — 10 sections, search, TOC, contextual tips on 5 pages

### UI/UX (Sessions 133-199)

- 9 Olas of mobile UX premium simplification
- Desktop Premium — command palette (Cmd+K), sidebar, hover actions, skeletons
- Color Audit (3 phases) — brand tokens, gradient unification, data viz theming
- Motion tokens — unified design system for animations
- Animation audit — 14 items resolved, zero `transition-all` remaining
- Configuracion decomposed into 7 Next.js subroutes
- God-component splits: clientes, citas, servicios (5,368 > 1,682 lines)
- Mobile 2026 Redesign (5 waves) — Mercury dashboard, TimeTree calendar, Revolut feed, sparklines, Uber account menu
- Top-tier mobile polish — long-press context menu, swipe complete, status bars, header compression, citas badge, Next Up chip
- Citas mobile polish — KPI demotion, 7 filters, segmented control, bottom sheets, dynamic time blocks
- Clientes mobile polish — iOS Contacts layout, alphabet rail, swipe actions, detail sheets

### Admin & Ops

- Super Admin Panel (6 pages + 11 API routes)
- Discord deploys (GitHub Action sends release notes on push to main)

---

## Next Up: Rescued from Dashboard UX Playbook

High-value features from the archived FEATURES_PLAYBOOK.md that solve real user problems.

### Tab Title + Favicon Badge

**Problem:** Owner with 15 browser tabs can't see appointment count without switching.
**Solution:** Dynamic `document.title` per page + canvas-based favicon with numeric badge.
**Effort:** Small (2 hooks + 1 wrapper component). **Impact:** High for desktop users.

### Saved Filters (Presets)

**Problem:** Every day the barber opens the app and filters the same thing manually.
**Solution:** Persistent filter presets per page (localStorage). Built-in presets (VIP, En riesgo, Pendientes hoy) + user-created custom presets. Chip bar UI.
**Effort:** Medium. **Impact:** Daily time savings.

### Undo Toast (Delayed Commit)

**Problem:** "Are you sure?" confirmation dialogs add friction to every destructive action.
**Solution:** Gmail/Linear pattern — execute immediately in UI, show 5s undo toast, commit to server only after timeout. Pause-on-hover.
**Effort:** Medium. **Impact:** Faster workflows, less anxiety.

**Design patterns to preserve:**

- `delayed-commit` vs `immediate-compensate` vs `immediate` execution models
- Rollback policy by HTTP status (409=conflict, 403=perms, 404=gone, 500=retry)
- localStorage versioned keys (`_v1` suffix) with try/catch + fallback

### Optimistic Updates

**Problem:** Changing appointment status waits for server response. Feels sluggish on slow Costa Rican mobile networks.
**Solution:** Update UI immediately, rollback on error. Uses React Query `onMutate`/`onError`/`onSettled`.
**Effort:** Medium. **Impact:** Perceived performance improvement.

---

## Remaining UX Polish

From `docs/reference/MOBILE_UX_AUDIT.md`, still pending:

| #   | Item                               | Priority | Notes                                            |
| --- | ---------------------------------- | -------- | ------------------------------------------------ |
| 1   | Button migration (~30 raw buttons) | P0       | Dashboard pages still have manual `<button>`     |
| 2   | Create Modal Contract              | P1       | Unify Nueva Cita/Cliente/Servicio visual parity  |
| 3   | 360px + dark mode QA               | P1       | Full visual verification at smallest viewport    |
| 4   | Typography Contract                | P1       | Converge screens to fixed semantic scale         |
| 5   | Focus ring colors                  | P2       | 6 inputs still use `focus:ring-violet-400`       |
| 6   | Safe Area matrix                   | P2       | Hardware testing on notch/dynamic island devices |

---

## Remaining Features

### Tier 1 — High Priority

| Feature                                      | ROI                 | Notes                                        |
| -------------------------------------------- | ------------------- | -------------------------------------------- |
| **Settings search + progressive disclosure** | 10x faster settings | Fuse.js fuzzy search, Cmd+K integration      |
| **Navigation accessibility**                 | WCAG compliance     | Focus rings, skip links, aria-labels         |
| **Dashboard detail sheets migration**        | Consistency         | Apply Session 198 principles to `/dashboard` |
| **Mi Dia detail views migration**            | Consistency         | Timeline detail views need sheet treatment   |

### Tier 2 — Medium Priority

| Feature                      | ROI            | Notes                                       |
| ---------------------------- | -------------- | ------------------------------------------- |
| **Business types + Kash**    | Multi-vertical | Support beyond barber shops + Kash payments |
| **Card.tsx evolution**       | DX             | Add Card.Button, Card.Link sub-components   |
| **Semantic token migration** | Consistency    | ~315 hardcoded color occurrences            |

### Tier 3 — Strategic

| Feature                         | ROI            | Notes                                        |
| ------------------------------- | -------------- | -------------------------------------------- |
| **Complete rebranding**         | Multi-vertical | barber > staff migration throughout codebase |
| **Performance optimizations**   | Scale          | Redis caching, CDN, advanced optimizations   |
| **Accessibility certification** | Compliance     | WCAG AA full certification                   |
| **Public API + integrations**   | Platform play  | REST API, Zapier, webhooks                   |

---

## Platform / Admin Improvements

| Item                               | Priority | Notes                                            |
| ---------------------------------- | -------- | ------------------------------------------------ |
| Admin user management UI           | Medium   | Currently Bryan is only admin (inserted via API) |
| Multi-tenant dashboard view        | Medium   | SaaS metrics, business overview                  |
| Cache subscription checks with TTL | Medium   | Reduce egress, use localStorage                  |
| Egress monitoring/alerts           | Medium   | Proactive Supabase free tier management          |

---

## UX Contracts (Reference)

The 12 non-negotiable contracts from `docs/reference/MOBILE_UX_AUDIT.md`:

1. **Navigation Contract** — Single tab bar, consistent active states
2. **Page Shell Contract** — No double insets, edge-to-edge feel
3. **Typography Contract** — Semantic scale, no arbitrary sizes
4. **Action Contract** — `<Button>` component only, no manual `<button>`
5. **Overlay Contract** — Bottom sheets for create/edit, consistent dismiss
6. **Motion + Feedback Contract** — Unified tokens, haptic feedback
7. **Data Viz Contract** — Touch-first charts, readable at 360px
8. **State Contract** — Loading/empty/error states everywhere
9. **Accessibility Contract** — 44x44 targets, labels, reduced motion
10. **Safe Area Contract** — No overlap with notch/home indicator
11. **Form Controls in Overlay Contract** — Pickers work in sheets
12. **Promo Banner Contract** — Consistent trial/subscription banners

---

## Archived Documents

| Document                                                      | Reason                                                                   |
| ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `docs/archive/2026-03/FEATURES_PLAYBOOK.md`                   | ~85% superseded by organic evolution; 4 features rescued to this roadmap |
| `docs/archive/2026-02/P1_DYNAMIC_DURATION_SCHEDULING_PLAN.md` | All phases complete (Sessions 178-186)                                   |
| `docs/archive/2026-02/PLAN_CUSTOMER_DISCOVERY.md`             | Features 0-5 implemented (Sessions 152-182)                              |
| `docs/archive/2026-02/color-audit.md`                         | All 3 phases complete                                                    |
| `docs/planning/MVP_ROADMAP.md`                                | MVP scope exceeded                                                       |
| `docs/planning/POST_MVP_ROADMAP.md`                           | Consolidated into this file                                              |
| `docs/planning/IMPLEMENTATION_ROADMAP_FINAL.md`               | Outdated                                                                 |
| `docs/planning/implementation-v2.5.md`                        | Deprecated since Session 75                                              |
| `docs/ui-ux-redesign/UI_UX_REDESIGN_ROADMAP.md`               | Fully implemented                                                        |
| `docs/ui-ux-redesign/FRONTEND_MODERNIZATION_PLAN.md`          | Fully implemented                                                        |

**Documents that remain active:**

- `PROGRESS.md` — Session state and history
- `ROADMAP.md` — This file (single source of truth for what's next)
- `DATABASE_SCHEMA.md` — Database structure
- `DECISIONS.md` — Architectural decisions
- `GUARDRAILS.md` — Non-negotiable behavior rules
- `docs/PHILOSOPHY.md` — Product philosophy and principles
- `docs/reference/*` — Technical reference docs
- `docs/security/*` — Security documentation

---

**Last Updated:** Session 200 (2026-03-05)
