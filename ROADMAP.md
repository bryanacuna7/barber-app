# ROADMAP - BarberApp

**Version:** 0.9.7
**Updated:** 2026-02-23 (Session 182)
**Source of Truth:** This is the ONLY roadmap document. All others are archived.

---

## What's Built (Completed)

Everything below is DONE and in production on `main`:

### Core Platform

- Booking system, dashboard, client management, services, barber profiles
- Gamification (Client Loyalty + Barber Leaderboard + SaaS Referral)
- PWA mobile-first, installable, auto-update (iOS fix), custom barber pole icon
- Subscriptions: Basic ($12/mo) + Pro ($29/mo), SINPE payment, trial system

### Security & Infrastructure

- RBAC (4 roles: admin, owner, barber, client)
- IDOR fixes, rate limiting, XSS/CSRF protection, 28+ security tests
- 7 DB indexes, N+1 fixes (7-10x faster), WebSocket for Mi Dia
- Pino structured logging, Sentry error tracking, Redis rate limiting
- Supabase egress optimization (migrated project, caching, selective queries)
- TypeScript strict mode (0 errors), ESLint (0 errors)

### UI/UX

- All 5 dashboard pages modernized (squash-merged 138 commits)
- Color Audit (3 phases) — brand tokens, gradient unification, data viz theming
- Motion Tokens — unified design system for animations
- Desktop Premium — command palette (Cmd+K), sidebar, hover actions, skeletons
- 9 Olas of mobile UX premium simplification
- Configuracion decomposed into 7 Next.js subroutes

### Customer Discovery Features (Sessions 152-182)

- **Duration Tracking** — Iniciar > Timer > Completar > Pago (3 taps max)
- **Smart Duration (P1)** — ML-style duration prediction, per-business toggle
- **Smart Slots + Descuentos** — Demand heatmap, promo rules config, booking discounts
- **Client Cancel/Reschedule** — From tracking page, configurable policy, auto-notifications
- **SINPE Advance Payment** — Optional prepayment with discount, proof upload/WhatsApp, owner verification
- **Payment Methods** — Owner-configurable (Efectivo/SINPE/Tarjeta), smart completion flow
- **Push Notifications** — VAPID + SW + 4 event triggers
- **WhatsApp Deep Links** — "Llega Antes" CTA, pre-filled messages
- **Client Dashboard** — `/mi-cuenta` with home, profile, loyalty, multi-business
- **Public Tracking** — Uber-style `/track/[token]` (5 states), cron reminders (24h + 1h)
- **Invite Barbers** — Email invitations with credentials

### Admin & Ops

- Super Admin Panel (6 pages + 11 API routes)
- Discord Deploys (GitHub Action sends release notes on push to main)

---

## Paused: UX Polish (from Mobile UX Audit)

Items from `docs/reference/MOBILE_UX_AUDIT.md`, paused during customer discovery phase.

### P0 — Must Fix

| #   | Item                             | Status  | Details                                                               |
| --- | -------------------------------- | ------- | --------------------------------------------------------------------- |
| 1   | **Button migration**             | Pending | citas: ~22 manual `<button>` > `<Button>`, barberos: ~7 manual        |
| 2   | **Charts mobile-first** (Gate E) | FAIL    | Touch-first redesign, readable at 360/375/390, tactile interaction    |
| 3   | **Card padre / double inset**    | Pending | Remove wrapper containers in citas/servicios that create "boxed" feel |
| 4   | **Create Modal Contract**        | Pending | Unify Nueva Cita / Nuevo Cliente / Nuevo Servicio visual parity       |

### P1 — Should Fix

| #   | Item                                | Status  | Details                                                    |
| --- | ----------------------------------- | ------- | ---------------------------------------------------------- |
| 5   | **Copy UX Spanish audit** (Gate F)  | Pending | Eliminate ES/EN mix, consistent tone across modules        |
| 6   | **Header CTA Contract**             | Pending | Same position/scale/hierarchy for + button across modules  |
| 7   | **360px + dark mode QA**            | Pending | Full visual verification at smallest viewport + dark theme |
| 8   | **Action Contract standardization** | Pending | Minimize manual `button` in core flows, unified action API |
| 9   | **Typography Contract**             | Pending | Converge all active screens to fixed semantic scale        |
| 10  | **"Ver todas" CTA no-wrap**         | Pending | Fix line break on small viewports in dashboard             |

### P2 — Nice to Have

| #   | Item                             | Status  | Details                                                   |
| --- | -------------------------------- | ------- | --------------------------------------------------------- |
| 11  | **Interaction OS**               | Pending | Unified motion/gesture/feedback system across all modules |
| 12  | **Admin Context Switch**         | Pending | Explicit mobile toggle between Business and Super Admin   |
| 13  | **Header contextual** (Option B) | Pending | Replace global branding header with task-focused headers  |
| 14  | **Focus ring colors**            | Low     | 6 inputs still use `focus:ring-violet-400`                |
| 15  | **Safe Area matrix**             | Pending | Hardware testing on notch/dynamic island/cutout devices   |

### Release Gates (from Mobile UX Audit)

| Gate | Description               | Status                  |
| ---- | ------------------------- | ----------------------- |
| A    | Consistencia estructural  | PARCIAL                 |
| B    | Tipografia y acciones     | PARCIAL ALTA            |
| C    | Interaccion               | PARCIAL ALTA            |
| D    | Performance perceptual    | PENDIENTE DE MEDICION   |
| E    | Data Viz mobile           | **FAIL**                |
| F    | Copy UX                   | PENDIENTE DE VALIDACION |
| G    | Accesibilidad operacional | PENDIENTE DE PRUEBAS    |
| H    | Safe Area / Cutout        | PARCIAL                 |
| I    | Formularios en overlays   | PARCIAL ALTA            |

---

## Next Up: Remaining Features

Features not yet started, ordered by business priority.

### Tier 1 — High Priority

| Feature                                      | ROI                   | Notes                                               |
| -------------------------------------------- | --------------------- | --------------------------------------------------- |
| **Calendar mobile refinement**               | Better field staff UX | Week view swipeable days, Month view dot indicators |
| **Settings search + progressive disclosure** | 10x faster settings   | Fuse.js fuzzy search, Cmd+K integration             |
| **Navigation accessibility**                 | WCAG compliance       | Focus rings, skip links, aria-labels                |
| **E2E test alignment**                       | Release confidence    | Fix P0 findings from AUDITORIA_E2E_COMPLETA.md      |

### Tier 2 — Medium Priority

| Feature                    | ROI              | Notes                                                 |
| -------------------------- | ---------------- | ----------------------------------------------------- |
| **Business types + Kash**  | Multi-vertical   | Support beyond barber shops + Kash payments           |
| **Notification hardening** | Delivery quality | Orchestrator unico, dedup, retries, trazabilidad      |
| **Granular permissions**   | Enterprise       | Per-barber permission toggles (0C from customer plan) |
| **Agenda blocks**          | Operational      | Break/vacation blocking without fake appointments     |

### Tier 3 — Lower Priority

| Feature                    | ROI          | Notes                                         |
| -------------------------- | ------------ | --------------------------------------------- |
| **Extended test coverage** | Code quality | From current coverage to comprehensive suite  |
| **CSV exports**            | Operational  | Basic client/appointment data export          |
| **appointment_source**     | Analytics    | Track origin (public, walk-in, owner, barber) |

### Tier 4 — Strategic

| Feature                         | ROI            | Notes                                        |
| ------------------------------- | -------------- | -------------------------------------------- |
| **Complete rebranding**         | Multi-vertical | barber > staff migration throughout codebase |
| **Performance optimizations**   | Scale          | Redis caching, CDN, advanced optimizations   |
| **Security Phase 2**            | Hardening      | Advanced threat protection                   |
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

| Document                                               | Reason                                           |
| ------------------------------------------------------ | ------------------------------------------------ |
| `docs/archive/P1_DYNAMIC_DURATION_SCHEDULING_PLAN.md`  | All phases mostly complete (Sessions 178-182)    |
| `docs/archive/PLAN_CUSTOMER_DISCOVERY.md`              | Features 0-5 implemented (Sessions 152-182)      |
| `docs/planning/MVP_ROADMAP.md`                         | MVP scope exceeded; all items done or superseded |
| `docs/planning/POST_MVP_ROADMAP.md`                    | Consolidated into this file                      |
| `docs/planning/IMPLEMENTATION_ROADMAP_FINAL.md`        | Outdated; references completed work as pending   |
| `docs/planning/implementation-v2.5.md`                 | Explicitly deprecated since Session 75           |
| `docs/ui-ux-redesign/UI_UX_REDESIGN_ROADMAP.md`        | Fully implemented and merged                     |
| `docs/ui-ux-redesign/FRONTEND_MODERNIZATION_PLAN.md`   | Fully implemented                                |
| `docs/ui-ux-redesign/DEMOS_REGISTRY.md`                | Historical reference                             |
| `docs/ui-ux-redesign/DESIGN_AUDIT_ALL_DEMOS.md`        | Historical reference                             |
| `docs/planning/CITAS_PAGE_SIMPLIFICATION.md`           | Superseded by UI/UX redesign                     |
| `docs/planning/MI_DIA_CHECKLIST.md`                    | Historical                                       |
| `docs/planning/MI_DIA_IMPLEMENTATION.md`               | Historical                                       |
| `docs/planning/QUICK_WINS_IMPLEMENTED.md`              | Already done                                     |
| `docs/planning/REFACTORING_SESSION_SUMMARY.md`         | Historical                                       |
| `docs/planning/VERBOSITY_AUDIT_REPORT.md`              | Historical                                       |
| `docs/planning/ARCHITECTURE_MODERNIZATION_ANALYSIS.md` | Historical                                       |
| `color-audit.md`                                       | All 3 phases complete                            |

**Documents that remain active:**

- `PROGRESS.md` — Session state and history
- `docs/reference/MOBILE_UX_AUDIT.md` — UX contracts and release gates
- `AUDITORIA_E2E_COMPLETA.md` — E2E test findings and fixes needed
- `ROADMAP.md` — This file (single source of truth for what's next)
- `DATABASE_SCHEMA.md` — Database structure
- `DECISIONS.md` — Architectural decisions
- `GUARDRAILS.md` — Non-negotiable behavior rules
- `docs/reference/*` — Technical reference docs
- `docs/security/*` — Security documentation

---

**Last Updated:** Session 182 (2026-02-23)
