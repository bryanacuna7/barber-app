# ROADMAP - BarberApp

**Version:** 0.9.2
**Updated:** 2026-02-10 (Session 168)
**Source of Truth:** This is the ONLY roadmap document. All others are archived.

---

## What's Built (Completed)

Everything below is DONE and in production on `main`:

- **Core Platform:** Booking system, dashboard, client management, services, barber profiles
- **Gamification:** Client loyalty + barber leaderboard + SaaS referral system
- **PWA:** Mobile-first, installable, auto-update (iOS fix), custom barber pole icon
- **Subscriptions:** Basic ($12/mo) + Pro ($29/mo), SINPE payment, trial system
- **Security:** RBAC, IDOR fixes, rate limiting, XSS/CSRF protection, 28+ security tests
- **Performance:** 7 DB indexes, N+1 fixes (7-10x faster), WebSocket for Mi Dia
- **Observability:** Pino structured logging, Sentry error tracking, Redis rate limiting
- **UI/UX Redesign:** All 5 dashboard pages modernized (squash-merged 138 commits)
- **Color Audit:** 3 phases complete — brand tokens, gradient unification, data viz theming, contrast fixes
- **Super Admin Panel:** 6 pages + 11 API routes
- **Egress Optimization:** Migrated Supabase project, caching, selective queries
- **Motion Tokens:** Unified design system for animations
- **Discord Deploys:** GitHub Action sends release notes to Discord on push to main
- **TypeScript:** 0 errors, strict mode
- **ESLint:** 0 errors

---

## Current Sprint: UX Polish (from AUDIT.md)

These items come from the mobile UX audit and are the immediate next work.

> Update de estado: las Olas 1-9 del plan mobile/PWA fueron cerradas en alcance pragmático.
> Ver detalle y criterios: `UI_PREMIUM_SIMPLIFICATION_PLAN.md`.

### P0 — Must Fix

| #   | Item                             | Status  | Details                                                               |
| --- | -------------------------------- | ------- | --------------------------------------------------------------------- |
| 1   | **Button migration**             | Pending | citas: ~22 manual `<button>` → `<Button>`, barberos: ~7 manual        |
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

### Release Gates (from AUDIT.md)

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

## Post-Launch Features (Future)

Features not yet started, ordered by business priority.

### Tier 1 — High Priority (estimated Month 2)

| Feature                                      | Hours | ROI                   | Notes                                                  |
| -------------------------------------------- | ----- | --------------------- | ------------------------------------------------------ |
| **Appointment reminders**                    | 4-6h  | 30-50% fewer no-shows | Email cron 24h before, needs `reminder_sent_at` column |
| **Calendar mobile refinement**               | 8-10h | Better field staff UX | Week view swipeable days, Month view dot indicators    |
| **Settings search + progressive disclosure** | 6h    | 10x faster settings   | Fuse.js fuzzy search, Cmd+K shortcut                   |
| **Navigation accessibility**                 | 2h    | WCAG compliance       | Focus rings, skip links, aria-labels                   |

### Tier 2 — Medium Priority (Months 3-4)

| Feature                      | Hours  | ROI                  | Notes                                           |
| ---------------------------- | ------ | -------------------- | ----------------------------------------------- |
| **Advance payments (SINPE)** | 12-16h | Deposit verification | Needs `deposit_paid` column + verification flow |
| **Push notifications**       | 12-16h | Real-time alerts     | Browser push for appointments                   |
| **Client referrals**         | 8-10h  | Organic growth       | Tracking + rewards system                       |
| **RBAC system**              | 22-30h | Multi-role access    | Owner / Manager / Staff roles                   |
| **Business types + Kash**    | 24-29h | Multi-vertical       | Support beyond barber shops + Kash payments     |

### Tier 3 — Lower Priority (Months 5-6)

| Feature                    | Hours  | ROI              | Notes                                                    |
| -------------------------- | ------ | ---------------- | -------------------------------------------------------- |
| **Retention / CRM Lite**   | 30-44h | Client retention | Rebooking automation, WhatsApp links, variable durations |
| **Extended test coverage** | 43-55h | Code quality     | From current coverage to comprehensive suite             |
| **UX refinement sprint**   | 12-16h | Polish           | Dieter Rams-level attention to detail                    |

### Tier 4 — Strategic (Months 7-9)

| Feature                         | Hours  | ROI            | Notes                                        |
| ------------------------------- | ------ | -------------- | -------------------------------------------- |
| **Complete rebranding**         | 40-60h | Multi-vertical | barber → staff migration throughout codebase |
| **Performance optimizations**   | 15-20h | Scale          | Redis caching, CDN, advanced optimizations   |
| **Security Phase 2**            | 16-19h | Hardening      | Advanced threat protection                   |
| **Accessibility certification** | 12-16h | Compliance     | WCAG AA full certification                   |
| **Public API + integrations**   | 60-84h | Platform play  | REST API, Zapier, webhooks                   |

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

The 12 non-negotiable contracts from AUDIT.md. These define the quality bar:

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

The following documents have been moved to `docs/archive/2026-02/` because they are outdated or completed:

| Document                                               | Reason                                           |
| ------------------------------------------------------ | ------------------------------------------------ |
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
- `AUDIT.md` — UX contracts and release gates (reference)
- `ROADMAP.md` — This file (single source of truth for what's next)
- `DATABASE_SCHEMA.md` — Database structure
- `DECISIONS.md` — Architectural decisions
- `docs/reference/*` — Technical reference docs
- `docs/security/*` — Security documentation

---

**Last Updated:** Session 168 (2026-02-10)
