# Design Decisions Log

**Purpose:** Record why things are the way they are.
**Audience:** Future maintainers wondering "why?"
**Format:** Newest first.

---

## Decisions

### PWA Auto-Update Strategy: No Precache for HTML

**Date:** 2026-02-07
**Status:** Active

**Context:**
iOS PWAs were not updating after Vercel deploys. Users had to uninstall and reinstall the app from the home screen to see new versions.

**Decision:**
Remove `/` (root HTML) from the Service Worker precache list. Only precache `/offline`, icons. HTML is served network-first (always fresh when online, cached fallback only offline). Added `Cache-Control: no-cache` headers for `sw.js` and `manifest.webmanifest` in `next.config.ts`. Registration component handles `visibilitychange` to check for SW updates when user returns to app, plus `controllerchange` → auto-reload.

**Rationale:**
Precaching HTML locks in a stale version that persists across deploys since the SW cache name doesn't change. Network-first for HTML ensures users always see the latest version when online. The tradeoff (slightly slower first paint) is negligible on modern connections.

**Alternatives Considered:**

1. Build-time SW versioning (inject hash into sw.js) — rejected, adds build complexity
2. Show "Update available" button — rejected, users shouldn't have to do anything

---

### Brand Color Token System Over Hardcoded Tailwind Colors

**Date:** 2026-02-07
**Status:** Active

**Context:**
60+ gradient instances used hardcoded `from-violet-600 via-purple-600 to-blue-600` across all dashboard pages. Changing the brand color required touching dozens of files.

**Decision:**
Implement CSS custom property system: `--brand-primary`, `--brand-primary-rgb`, plus utility classes (`brand-gradient-text`, `brand-tab-active`, `brand-mesh-1/2`). All dashboard chrome uses these tokens. SVG chart colors use `useChartColors()` hook that reads CSS vars at runtime.

**Rationale:**
Single point of change for brand identity. Enables future white-label/multi-tenant theming. CSS vars work in inline styles but NOT in SVG attributes (hence the JS hook).

**Alternatives Considered:**

1. Tailwind theme override — rejected, doesn't support per-business dynamic theming
2. CSS-in-JS (styled-components) — rejected, adds bundle weight and doesn't align with Tailwind approach

---

### Supabase Free Tier Egress Management

**Date:** 2026-02-05
**Status:** Active

**Context:**
Original Supabase project burned 112% egress (5.61/5 GB) in free tier. Realtime WebSocket was the biggest drain.

**Decision:**
Migrated to new Supabase project (`zanywefnobtzhoeuoyuc`). Disabled Realtime in dev. Cache subscription/notification checks with TTL in localStorage. Use specific `select('col1,col2')` instead of `select('*')`. Minimize Playwright visual test runs (each page load = egress).

**Rationale:**
Free tier has hard 5GB limit. Realtime WebSocket maintains persistent connections that accumulate egress rapidly. Selective queries reduce payload size significantly.

---

### App Router Only (No Pages Router)

**Date:** 2025-12-01
**Status:** Active

**Context:**
Next.js supports both App Router (`src/app/`) and Pages Router (`src/pages/`). Need to choose one.

**Decision:**
Use App Router exclusively. No `src/pages/` directory. All routes under `src/app/` with route groups `(dashboard)`, `(admin)`, `(auth)`.

**Rationale:**
App Router is the recommended approach for new Next.js projects. Server Components, nested layouts, and streaming are only available in App Router. Using both would create confusion about which router handles which routes.

---

### Mobile-First with Dual Render Strategy

**Date:** 2026-01-15
**Status:** Active

**Context:**
Complex layouts (calendars, data tables) require very different presentations on mobile vs desktop.

**Decision:**
Render BOTH mobile and desktop versions in the DOM. Toggle with Tailwind: `lg:hidden` (mobile) and `hidden lg:grid` (desktop). No JS `window.innerWidth` conditionals.

**Rationale:**
CSS-only responsive switching avoids hydration mismatches, SSR issues, and the flash of wrong layout. The extra DOM nodes are lightweight compared to the complexity of JS-based responsive logic.

---

### Apple HIG Over Material Design for Mobile

**Date:** 2026-01-20
**Status:** Active

**Context:**
Target users are primarily iPhone users. Need to choose mobile design language.

**Decision:**
Follow Apple Human Interface Guidelines: no FABs, sheets from bottom for forms, center + in tab bar for actions, 44x44px minimum touch targets, single tab bar only, `statusBarStyle: black-translucent`.

**Rationale:**
PWA on iOS should feel native. Android users are accustomed to both patterns. Apple HIG patterns feel more premium and consistent with the barbershop brand.

---

### RLS Self-Reference Prevention

**Date:** 2026-02-05
**Status:** Active

**Context:**
A Supabase RLS policy "Barbers can view business staff" caused infinite recursion because it queried the `barbers` table inside a policy ON the `barbers` table.

**Decision:**
Never create RLS policies that query the same table they're applied to. Use only owner-based (`auth.uid() = user_id`) and public policies on the `barbers` table. Always check for self-referencing before migrating schema.

**Rationale:**
PostgreSQL RLS evaluates policies for every row access, including rows accessed by the policy itself. A policy on `barbers` that SELECTs from `barbers` creates an infinite loop.

---

## Bug History (Reference)

| ID   | Description                         | Root Cause                            | Fix                                       | Lesson                                       |
| ---- | ----------------------------------- | ------------------------------------- | ----------------------------------------- | -------------------------------------------- |
| #001 | iOS PWA shows stale content         | HTML precached in SW, never refreshed | Remove `/` from precache                  | Never precache HTML in PWAs                  |
| #002 | RLS infinite recursion              | Self-referencing policy on barbers    | Drop policy, use owner-based only         | Never query same table in its own policy     |
| #003 | Egress exhausted (112%)             | Realtime WebSocket + select(\*)       | Migrate project, cache, selective queries | Monitor egress proactively                   |
| #004 | Chart colors wrong in SVG           | CSS vars don't work in SVG attributes | useChartColors() JS hook                  | Use JS runtime for SVG color props           |
| #005 | text-zinc-500 low contrast (4.88:1) | Tailwind default zinc too light       | Migrate to text-muted (6.2:1)             | Use semantic color tokens with verified WCAG |

---

## Architecture Decisions Records (ADRs)

| ADR | Title                                | Status | Date       |
| --- | ------------------------------------ | ------ | ---------- |
| 001 | App Router only, no Pages Router     | Active | 2025-12-01 |
| 002 | Apple HIG for mobile design          | Active | 2026-01-20 |
| 003 | Dual render strategy for responsive  | Active | 2026-01-15 |
| 004 | CSS custom property brand tokens     | Active | 2026-02-07 |
| 005 | No HTML precache in Service Worker   | Active | 2026-02-07 |
| 006 | Supabase free tier egress management | Active | 2026-02-05 |
| 007 | RLS self-reference prevention        | Active | 2026-02-05 |
