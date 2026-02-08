# Project Progress

> Este archivo se actualiza automáticamente con `/save-progress`.
> Claude lo lee al inicio de cada sesión para mantener contexto.

## Project Info

- **Name:** BarberShop Pro
- **Stack:** Next.js 16, React 19, TypeScript, Supabase, TailwindCSS, Framer Motion
- **Database:** PostgreSQL (Supabase)
- **Last Updated:** 2026-02-07 (Session 151 - PWA auto-update fix for iOS)
- **Current Branch:** `main` (feature/ui-ux-redesign squash-merged)
- **Current Phase:** Post-merge — UX polish sprint
- **Roadmap:** `ROADMAP.md` (single source of truth for what's next)
- **Color Audit:** COMPLETE (archived to `docs/archive/2026-02/color-audit.md`)
- **Supabase Project:** `zanywefnobtzhoeuoyuc`

---

## What's Built

### Completed Features

- [x] Sistema de reservas online + Dashboard administrativo
- [x] Sistema de Gamificación Completo (Client Loyalty + Barber + SaaS Referral)
- [x] PWA y branding personalizable + Notificaciones automáticas
- [x] **Security Hardening** ✅ (RBAC, IDOR fixed, rate limiting)
- [x] **Performance Optimization** ✅ (7 índices DB, N+1 queries fixed, 7-10x faster)
- [x] **Observability Infrastructure** ✅ (Pino logging, Sentry, Redis rate limiting)
- [x] **Phase 1 & 2:** All 5 Dashboard Pages Modernized
- [x] **Mobile UX Audit:** 11 critical fixes
- [x] **Supabase Migration:** New free-tier project
- [x] **Super Admin Panel** ✅ — 6 pages + 11 API routes
- [x] **Egress Optimization** ✅
- [x] **Motion Token Migration** ✅
- [x] **AUDIT.md Gap Remediation** ✅

---

## Roadmap

**See [`ROADMAP.md`](ROADMAP.md) for the full prioritized roadmap.**

### Next Up (UX Polish Sprint)

- [ ] Button migration — citas (22 manual), barberos (7 manual)
- [ ] Charts mobile-first redesign (Gate E: FAIL)
- [ ] Copy UX Spanish consistency (Gate F: PENDING)
- [ ] Card padre / double inset removal
- [ ] Header CTA Contract consistency
- [ ] 360px + dark mode full QA

---

## Recent Sessions

### Session 151: PWA Auto-Update Fix for iOS + Icon Refinements (2026-02-07)

**Status:** ✅ Complete

**Objective:** Fix iOS PWA not updating after Vercel deploys (required uninstall/reinstall), refine barber pole icon

**What was done:**

1. **SW: Removed `/` from precache** — Root HTML was cached at install time and never refreshed between deploys. Now only offline page + icons are precached. HTML served network-first (always fresh when online).

2. **SW: Added `SKIP_WAITING` message listener** — Registration component can tell a waiting SW to activate immediately.

3. **SW: Bumped cache names to v2** — Forces old v1 caches to be deleted on activate (one-time cleanup).

4. **Registration: Full rewrite** — Added `updateViaCache: 'none'` (bypass HTTP cache for SW checks), `controllerchange` → auto-reload, `visibilitychange` → `registration.update()` (crucial for iOS — checks for updates when user returns to app), proper `waiting`/`installing` state handling with SKIP_WAITING flow.

5. **next.config.ts: Cache-Control headers** — `no-cache, no-store, must-revalidate` for `/sw.js` and `/manifest.webmanifest` so Vercel never caches them.

6. **PWA Icon refinements** — Bigger barber pole (32% width, 80% height), rounded pill shape, white stripes on pure black, removed pole caps, 5 stripes with proper spacing. Updated static PNGs.

**Files:** `public/sw.js`, `src/components/pwa/service-worker-register.tsx`, `next.config.ts`, `src/app/api/pwa/icon/route.tsx`, `public/icon-192.png`, `public/icon-512.png`

---

### Session 150: Squash Merge to Main + Discord Deploy Notifications + PWA Icon (2026-02-07)

**Status:** ✅ Complete

**Objective:** Merge feature branch to main, set up Discord release notifications, redesign PWA default icon

**What was done:**

1. **Squash Merge to Main** — 138 commits from `feature/ui-ux-redesign` squash-merged into `main` as single clean commit. Branches deleted: `feature/comprehensive-audit`, `feature/gamification-system`, `feature/subscription-payments-rebranding`.

2. **Discord Deploy Notifications** — New GitHub Action (`.github/workflows/discord-deploy-notify.yml`) that triggers on push to main. Reads user-facing release notes from `RELEASE_NOTES.md`, builds JSON payload via Python3, sends embed to Discord webhook. Fixed initial JSON escaping bug (multi-step → single-step approach).

3. **RELEASE_NOTES.md** (NEW) — User-facing release notes file, written in non-technical language (App Store style). Discord workflow reads latest version from this file.

4. **PWA Icon Redesign** — Redesigned default barber pole icon in `src/app/api/pwa/icon/route.tsx`. New design: monochromatic negative-space barber pole — white diagonal stripes on pure black, pole shape defined by `borderRadius` clipping. No background fill on the pole itself; black space IS the design. User fine-tuned proportions directly.

**Git state:** On `main`, pushed. Discord webhook secret configured. Vercel auto-deploying from main.

**Files:** `.github/workflows/discord-deploy-notify.yml` (new), `RELEASE_NOTES.md` (new), `src/app/api/pwa/icon/route.tsx` (modified)

---

### Session 149: Chart Tooltips + Compact Currency + Responsive Stats (2026-02-07)

**Status:** ✅ Complete

**Objective:** Custom chart tooltips, compact currency formatting for dashboard stats, responsive stats card sizing

**What was done:**

1. **chart-tooltip.tsx** (NEW) — Shared `ChartTooltip` component with theme-aware `tone` props (bg/border/text via JS, not CSS vars — fixes SVG prop limitation).

2. **revenue-chart.tsx** — Replaced Recharts `contentStyle`/`labelStyle`/`itemStyle` with custom `RevenueTooltip` using `ChartTooltip`. Added tooltip color props to `useChartColors()`.

3. **services-chart.tsx** — Same tooltip migration. Bar fills now use brand-primary RGB with opacity scale (`0.72, 0.56, 0.42, 0.32`) instead of hardcoded grays. Winner badge gets dynamic `winnerRgb` + border. Added `toRgbChannels()` helper for hex→RGB conversion.

4. **format.ts** — Added `formatCurrencyCompactMillions()`: values < 1M use standard format, ≥1M show `₡1.3M` / `₡13M`. Exported via `index.ts`.

5. **dashboard-content.tsx** — Dashboard stats now use `formatCurrencyCompactMillions` instead of `formatCurrency` (prevents overflow on mobile).

6. **stats-card.tsx** — Responsive font scaling: `text-[26px]` default, `text-[22px]` for 10+ chars, `text-[20px]` for 13+ chars. Tighter mobile padding (`p-3.5`), smaller icon containers on mobile.

7. **format.test.ts** — 3 new tests for `formatCurrencyCompactMillions` (below 1M, millions with decimal, tens of millions without).

**Files:** chart-tooltip.tsx (new), revenue-chart.tsx, services-chart.tsx, dashboard-content.tsx, stats-card.tsx, format.ts, index.ts, format.test.ts

---

### Session 148: Color Audit Fase 3 — Data Viz & Contrast (2026-02-07)

**Status:** ✅ Complete

**Objective:** Chart theming (tooltips + palette), secondary text contrast, themeColor meta

**What was done:**

1. **globals.css** — Added chart tokens (`--chart-grid`, `--chart-axis`, `--chart-tooltip-bg/border/text`) for light and dark. Added `--color-muted` and `--color-subtle` to `@theme inline` (maps to `--text-2` / `--text-3`). Updated `app-page-subtitle` component class to use `text-muted`.

2. **revenue-chart.tsx** — Tooltip `contentStyle` uses CSS vars for theme-aware bg/border/text. SVG props (stroke, fill, gradient stops) use `useChartColors()` hook that reads computed CSS vars and listens for `prefers-color-scheme` changes. Line/area now uses brand-primary instead of hardcoded `#3b82f6`. Icon color brand-aware.

3. **services-chart.tsx** — Same tooltip + SVG theming. Bar fill uses brand-primary. Rank list uses brand-derived monochromatic opacity scale (`barOpacities`). Icon color brand-aware.

4. **66 active .tsx files** — Replaced 218 instances of `text-zinc-500 dark:text-zinc-400` → `text-muted` (single Tailwind class). Remaining 20 instances only in deprecated `page-old.tsx` files.

5. **layout.tsx** — `themeColor` light mode changed from `#0a0a0a` to `#ffffff`.

6. **TS fix** — `revenue-chart.tsx` `labelFormatter` payload type changed from `Array<>` to `readonly []` (pre-existing Recharts type mismatch).

**Contrast improvement:** `text-muted` renders `#5A6270` in light mode (6.2:1 on white, was borderline 4.88:1 with zinc-500). Dark mode `#A6B0BE` (8.76:1 on `#0a0a0a`).

**Files modified:** globals.css, layout.tsx, revenue-chart.tsx, services-chart.tsx, barbers-leaderboard.tsx, + 57 component/page files (text-muted migration)

---

### Session 147: Color Audit Fase 2 — Dashboard Unification (2026-02-07)

**Status:** ✅ Complete

**Objective:** Migrate all hardcoded violet/purple/blue gradients in dashboards to brand token system

**What was done:**

1. **globals.css** — Added 4 brand utility classes: `brand-gradient-text` (headers), `brand-tab-active` (tabs/pills), `brand-mesh-1`/`brand-mesh-2` (decorative blobs). All derive from `--brand-primary` / `--brand-primary-rgb`.

2. **GradientHeader.tsx** — Replaced hardcoded `from-violet-600 via-purple-600 to-blue-600` with `brand-gradient-text` CSS class that creates a subtle monochromatic gradient from brand-primary to 30% lighter (light mode) or 20% lighter (dark mode).

3. **All 5 page-v2 files** — Migrated ~30+ gradient instances:
   - 4 page headers: inline gradient → `brand-gradient-text`
   - 4 CTA buttons: inline gradient → `Button variant="gradient"`
   - ~10 tab/segment active states: gradient → solid `brand-tab-active`
   - 6 decorative mesh blobs: hardcoded colors → `brand-mesh-1`/`brand-mesh-2`

4. **Design system components** — KPICard hero default and BookingHeader share button migrated to brand tokens.

**Audit impact:** Reduced hardcoded gradient instances from 60+ to ~0 in dashboard chrome. Semantic colors (avatars, medals, stat card decoratives) intentionally preserved.

**Files modified:** globals.css, GradientHeader.tsx, citas/page-v2.tsx, servicios/page-v2.tsx, barberos/page-v2.tsx, clientes/page-v2.tsx, analiticas/page-v2.tsx, KPICard.tsx, BookingHeader.tsx

---

### Session 146: Color Audit Fase 1 — Foundations (2026-02-07)

**Status:** ✅ Complete

**Objective:** Apply `color-audit.md` Phase 1 recommendations

**What was done:**

1. **globals.css** — Added premium tokens (surface-0/1/2, text-1/2/3, accent-soft, semantic colors) for light and dark. Changed default `--brand-primary` from zinc-800 (`#27272a`) to indigo (`#4F46E5` light / `#6D7CFF` dark).

2. **premium-background.tsx** — Replaced saturated violet-400→blue-400 + purple-400→pink-400 mesh with brand-tinted subtle blobs at 7% opacity (was 15%). Uses `rgba(var(--brand-primary-rgb))`.

3. **bottom-nav.tsx** — All active states (text, indicator pill, + button, action sheet icons) migrated from hardcoded `blue-*` to `var(--brand-primary)` / `var(--brand-primary-rgb)`. Created `.nav-indicator` CSS class for the active pill.

4. **button.tsx** — `gradient` variant changed from `from-blue-600 to-purple-600` to solid `var(--brand-primary)` with brand shadow.

**Problem found:**

- The bottom-nav indicator pill in dark mode lost its premium glow effect. The original used specific Tailwind blue shades (blue-400/25 → blue-500/35) with 20px glow at 30% opacity. The brand-token version with CSS variables is less vibrant.
- User explicitly said: "el ovalo en el nav bar de elemento activo me encantaba" and "se perdio el diseno premium"
- **NEXT SESSION MUST FIX:** Increase `.nav-indicator` dark mode intensities or consider a hybrid approach that preserves the original glow quality.

**Files modified:**

- `src/app/globals.css` — tokens + `.nav-indicator` class
- `src/components/ui/premium-background.tsx` — brand-tinted subtle mesh
- `src/components/dashboard/bottom-nav.tsx` — brand tokens throughout
- `src/components/ui/button.tsx` — gradient variant brand-aware

**Git state:** Uncommitted changes (color audit + prior session changes)

---

### Session 145: Code Audit Verification (2026-02-07)

**Status:** ✅ Complete — 5 AUDIT.md items found already resolved in code, progress synced

### Session 143-144: Mobile De-Generic Pass (2026-02-06)

**Status:** ✅ Complete — barberos/servicios/clientes/lealtad UX polish

### Session 142: Citas + Barberos UX Polish (2026-02-06)

**Status:** ✅ Applied

### Sessions 133-141: Mobile UX Audit + Remediation

**Status:** ✅ Complete — Apple HIG, 15 issues fixed, motion tokens, egress optimization

---

## Current State

### Working ✅

- App running at http://localhost:3000
- All 5 dashboard pages modernized
- **Color Audit COMPLETE** (Fases 1+2+3) — brand tokens, gradient unification, data viz, contrast
- Charts fully theme-aware (tooltip + palette + axis via CSS vars + JS hook)
- Secondary text uses `text-muted` (6.2:1 contrast on white vs old 4.88:1)
- `themeColor` meta correct for light mode

### Issues ⚠️

1. ~~Bottom nav dark mode indicator~~ — FIXED by user
2. ~~60+ hardcoded gradient instances~~ — MIGRATED (Fase 2)
3. ~~203+ text-zinc-500/400~~ — MIGRATED to `text-muted` (Fase 3)
4. ~~Chart tooltips hardcoded white~~ — THEMED (Fase 3)
5. **Focus ring colors** (6 inputs) still use `focus:ring-violet-400` — low priority
6. **Pre-existing TS error** in `features-section.tsx` (framer-motion Variants type) — unrelated to audit

---

**Last Update:** Session 151 (2026-02-07)
**Status:** PWA auto-update fixed for iOS, icon refined
**Next:** Remaining audit items (button migration, charts mobile redesign, copy UX, dark mode QA)
