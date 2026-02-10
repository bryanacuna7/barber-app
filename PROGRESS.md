# Project Progress

> Este archivo se actualiza automáticamente con `/save-progress`.
> Claude lo lee al inicio de cada sesión para mantener contexto.

## Project Info

- **Name:** BarberApp
- **Stack:** Next.js 16, React 19, TypeScript, Supabase, TailwindCSS, Framer Motion
- **Database:** PostgreSQL (Supabase)
- **Last Updated:** 2026-02-10 (Session 175 - P0 Tracking Público + Reminders COMPLETE)
- **Current Branch:** `feature/customer-discovery-features` (from main)
- **Current Phase:** Customer Discovery — solving real barber pains
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

### Next Up (Customer Discovery Features)

- [x] Feature 1A: Duration tracking + payment method (Iniciar→Completar→Pago)
- [x] Email notification on public booking
- [x] Migration 025 executed in Supabase Dashboard
- [x] Migration 026: Fix barbers schema + seed test data
- [x] Feature 1 Playwright E2E verification with real data (full flow tested)
- [x] Mi Día accessible from "Más" menu for barber profiles
- [x] **Feature 0A: RBAC — Role detection + hide-based access + owner-configurable permissions**
- [x] **Feature 0B: Gestión de usuarios del dueño** (invitar barberos, activar/desactivar, email con credenciales)
- [x] **Settings: "Métodos de Pago Aceptados"** (toggles in Configuración + smart completion flow)
- [x] **Payment Methods Bug Fixes** (0-methods fallback, error handling in sheet + Mi Día, lint cleanup)
- [x] **Push Notifications (Feature 4A)** — VAPID + SW handlers + subscribe API + sender + UI toggle + 4 triggers
- [x] **WhatsApp Deep Links (Feature 4C + 1E)** — deep-link utility, WhatsApp button on cards, "Llegá Antes" CTA, timezone fix, code review fixes
- [x] **Client Dashboard (`/mi-cuenta`) v1** — route group, layout, home page, profile, bottom nav, RLS, role detection, E2E verified, code review + audit fixes applied
- [x] **Client Dashboard Audit Fixes** — RPC for secure profile update (migration 030), stale state fix, ThemeProvider branding fix, empty business guard
- [x] **P0: Tracking Público + Reminders (Uber-style)** — Migration 031 (tracking_token + tracking_expires_at), public `/track/[token]` page (5 states: valid/expired/completed/cancelled/not-found), public queue API with rate limiting, booking API returns tracking_token + sends client confirmation email, "Llegá Antes" WhatsApp includes tracking URL, push to next client on completion, cron reminders (24h + 1h) with push + email + dedup, appointment-reminder email template
- [x] **Ola 1: UI Premium Simplification** — Clientes (dropdown views, filter sheet, collapsible stats), Citas (single-row header, D/S/M switcher), Servicios (collapsible sidebar, simplified subtitle), preferences persistence, code review fixes (hydration, a11y, touch targets, validation)
- [x] **Ola 2: Configuración Subroutes + Barberos** — Decomposed 1806-line monolith into 7 real Next.js subroutes (/general, /horario, /branding, /avanzado, /equipo, /pagos), landing page with card grid, mobile-header titles + back nav, sidebar active state for subroutes, search modal navigates to subroutes, barberos spacing consistency, suscripción UX debt documented
- [x] **Ola 3: Data Readability** — Suscripcion (Button migration + text-muted + collapsible plans/history), Analiticas (preference persistence for period/chart + collapsible KPI stats), Referencias (collapsible milestones/badges/conversions), Admin Referencias (collapsible table/charts/timeline). New `CollapsibleSection` reusable component.
- [x] **Ola 4: Native PWA** — Manifest `id` + `shortcuts` + `categories`, statusBarStyle fix, offline page redesign (dark mode, Button, auto-retry, last-online), `useOnlineStatus` hook + `OfflineBanner`, `usePWAInstall` hook + `InstallPrompt` (Android native + iOS instructions modal). Lint fixes: ref-during-render → useState+event callback, setState-in-effect → lazy initializers, iPadOS detection (MacIntel+maxTouchPoints), dead code cleanup, `as any` → `Record<string, unknown>`.
- [x] **Ola 5: Pulido Maestro** — Semantic color token migration (`text-muted` replacing 50+ hardcoded `text-zinc-{500,600} dark:text-zinc-400` instances across all dashboard pages + shared components), `<Button>` component migration (citas nav/action buttons, clientes/servicios table sort headers + action buttons), visual QA at 360px + dark mode verified. Zero new TypeScript errors.
- [x] **Ola 6: Gesture Hardening** — SwipeableRow edge exclusion (24px zones), direction-aware drag, PullToRefresh container-aware scroll detection + vertical intent, AppointmentCard compact variant migrated from raw drag to SwipeableRow + visible MoreVertical fallback, gesture-config.ts declarative policy matrix, design-system swipeClose/swipeOpen spring presets.
- [x] **Ola 6.1: Gesture Contract Validation** — E2E test suite (`tests/e2e/gesture-navigation.spec.ts`) with 4 scenarios: browser back navigation, no horizontal overflow, visible action fallback, 44px touch targets. gesture-config.ts as declarative contract.
- [x] **Ola 7: Loading Skeletons + SWR** — Clientes loading skeleton (4 stats + search + 6 rows), Citas calendar skeleton (day header + 5 time slots). React Query SWR already optimal (5min stale, 10min cache).
- [x] **Ola 8: Motion Tokens + Reduced Motion** — Centralized `animations.spring.card` preset, replaced hardcoded springs in 6 components (card, KPICard, toast, quick-action-card, stats-card). `reducedMotion` export with card/swipeClose/swipeOpen fallbacks. `useReducedMotion` + conditional rendering for decorative mesh animations in clientes.
- [x] **Ola 9: Subtractive Premium Pass** — Audited 10 core daily-use routes. Citas mobile header restructured from 1 packed row → 2-row layout (Row1=nav+CTA, Row2=full-width Día/Semana/Mes segmented). Servicios mesh animations wrapped with reduced-motion guard. 8/10 routes already compliant.

### Paused (UX Polish Sprint — resume after customer discovery)

- [ ] Charts mobile-first redesign (Gate E: FAIL)
- [ ] Copy UX Spanish consistency (Gate F: PENDING)
- [ ] Card padre / double inset removal
- [ ] Header CTA Contract consistency

---

## Recent Sessions

### Session 175: P0 Tracking Público + Reminders al Cliente (2026-02-10)

**Status:** ALL 4 DELIVERABLES COMPLETE + 5 code review fixes + client confirmation email

**D1 — Migration 031:** `tracking_token UUID` + `tracking_expires_at TIMESTAMPTZ` on appointments. Unique index, backfill. Migration 031b backfills expiry for historical completed/cancelled/no_show.

**D2 — Public Tracking Route:**

- `src/app/api/public/queue/route.ts` — Token-based queue API (no auth), rate limited (30 req/min), blocks cancelled/no_show, expired returns businessSlug for rebook CTA
- `src/app/track/[token]/page.tsx` — 5 states (loading, valid, expired, completed, cancelled), 3 live phases (countdown >60min, live-queue <=60min, your-turn), branded with business colors, polling every 30s
- `src/app/api/public/[slug]/book/route.ts` — Sets `tracking_expires_at`, returns `tracking_token`, sends client confirmation email with tracking link

**D3 — Llegá Antes + Push:**

- `complete/route.ts` — After completing appointment, pushes "Tu barbero ya está disponible" to next client within 60 min
- `whatsapp/deep-link.ts` — `messageArriveEarly` includes tracking URL
- `barber-appointment-card.tsx` — Builds tracking URL from `nextAppointment.tracking_token`
- `today/route.ts` — Returns `tracking_token` in response

**D4 — Cron Reminders:**

- `src/lib/email/templates/appointment-reminder.tsx` — Email with details + "Seguir mi turno en vivo" CTA
- `src/app/api/cron/appointment-reminders/route.ts` — Runs every 15 min via Vercel Cron. 24h + 1h reminders, awaits push+email before marking `reminder_sent_at`, same-day bookings handled
- `vercel.json` — Added `*/15 * * * *` schedule
- `CRON_SECRET` configured in Vercel Dashboard

**Code Review Fixes:**

- P1: `reminder_sent_at` only set after confirmed send (not fire-and-forget)
- P1: Same-day bookings (<24h) now get 1h reminder (dual query: follow-up + new)
- P2: Historical tokens backfilled with expiry (migration 031b)
- P2: Public queue endpoint rate limited + blocks cancelled/no_show
- P3: Tracking page shows "Cita cancelada" state for cancelled/no_show

**New files (7):** `031_tracking_token.sql`, `031b_tracking_token_backfill_expiry.sql`, `api/public/queue/route.ts`, `track/[token]/page.tsx`, `appointment-reminder.tsx`, `api/cron/appointment-reminders/route.ts`
**Modified files (7):** `book/route.ts`, `complete/route.ts`, `today/route.ts`, `deep-link.ts`, `barber-appointment-card.tsx`, `new-appointment.tsx`, `vercel.json`

**Next:** Squash merge to main → deploy v0.9.3

### Session 174: Desktop Premium Plan D7-D8 — Subtractive Pass + Final QA (2026-02-10)

**Status:** D0-D8 ALL COMPLETE. Desktop Premium Plan finished. Ready for squash merge + deploy.

**D7 — Subtractive Pass:**

1. **stats-card.tsx** — Hide shine effect + decorative circle on desktop (`lg:hidden`), reduce hover lift
2. **referral-code-card.tsx** — Desktop 2-column grid (code/link left, buttons right), hide QR emoji placeholder
3. **clientes/page-v2.tsx** — Hide 4 decorative icons + 4 gradient blur circles on desktop

**D8 — QA Final Cross-Screen:**

- Audited 14 pages at 1440×900 via Playwright
- All pages pass Definition of Done contracts (legibility, task accessibility, keyboard, states, no regression)
- Zero new issues found — only pre-existing debt documented (hydration error, chart TS types)

**Next:** Squash merge `feature/customer-discovery-features` to main → deploy v0.9.3

### Session 173: Desktop Premium Plan D4-D6 + Code Reviews (2026-02-10)

**Status:** D0-D6 complete, D7-D8 pending. All uncommitted (46 modified files, last commit = D3).

**D4 (Configuración + Admin):** Headers → `app-page-title`, subtitles → `app-page-subtitle lg:hidden`, config general booking card neutralized, admin pages standardized. Settings subroute header component extracted.

**D5 (Motion & Feedback):** Motion tokens unified (12+ hardcoded → `animations.*`), `useReducedMotion()` added to 11 components, code review fixes (P1: spinner/empty-state reduced-motion bypass, P2: remaining hardcoded durations, P3: unused param).

**D6 (Performance Percibida):**

- **T1:** Removed duplicate `Skeleton` from `motion.tsx`, added `prefers-reduced-motion` for `.skeleton` CSS
- **T2:** Servicios skeleton — dual mobile/desktop layout
- **T3:** Suscripcion skeleton — replaced `<Loader2>` spinner
- **T4:** Standardized Clientes, Barberos, Citas to canonical `<Skeleton>`
- **T5 (code review fix):** Analiticas skeleton — replaced `animate-spin` + `animate-pulse` raw divs with canonical `<Skeleton>`
- **Key decision:** NO generic `loading.tsx` — React Query cache makes route-level Suspense counterproductive

**Files modified (8 in D6):** motion.tsx, globals.css, servicios/page-v2.tsx, suscripcion/page.tsx, clientes/page-v2.tsx, barberos/page-v2.tsx, citas/page-v2.tsx, analiticas/page-v2.tsx

**Next:** D7 (Subtractive premium pass) → D8 (QA final cross-screen) → squash merge to main → deploy v0.9.3

---

### Session 172: Desktop Premium Plan D5 — Motion & Feedback (2026-02-10)

**Status:** D0-D5 complete, D6-D8 pending

**Objective:** Unify motion tokens, audit prefers-reduced-motion, standardize hover/focus feedback.

**Changes:**

- **Motion token unification** (9 files) — Replaced 12+ hardcoded durations/springs/easings with `animations.*` design system tokens
- **Reduced motion audit** — Added `useReducedMotion()` to 11 components that were missing it (HoverLift, ScaleOnHover, SlideInRight, AnimatedNumber, SuccessCheckmark, SheetContent, Drawer, Spinner, StatsCard, EmptyState, CollapsibleSection)
- **D4 variant fix** — `'default'` → `'primary'` in 3 files (Button component doesn't have `'default'` variant)
- **Clientes revalidation** — Dropdown animation tokenized, desktop controls verified

**Files modified (12):** motion.tsx, sheet.tsx, drawer.tsx, spinner.tsx, empty-state.tsx, query-error.tsx, stats-card.tsx, collapsible-section.tsx, clientes/page-v2.tsx, admin/negocios, admin/pagos

---

### Session 171: Desktop Premium Plan D4 (2026-02-10)

**Status:** ✅ Complete (D0-D4 done, D5-D8 pending)

**Objective:** Execute D4 wave — Configuración subroutes + Admin pages. Standardize headers, remove one-off gradients, migrate raw buttons to `<Button>` component.

**Changes:**

- **Config headers** (5 pages) — `text-[28px] font-bold` → `app-page-title`, subtitles → `app-page-subtitle lg:hidden`
- **Config general** — Booking link card: violet gradient → neutral card with dark accent bar, buttons standardized
- **Admin headers** (6 pages) — `text-2xl font-bold` → `app-page-title`, subtitles hidden on desktop
- **Admin buttons** — ~20 raw `<button>` → `<Button>` component in negocios (filters + pagination) and pagos (filters + approve/reject + pagination)
- **Admin referencias** — "Volver al Dashboard" link: `bg-blue-600` → design system `bg-zinc-900 dark:bg-white`

**Files modified (11):** 5 config subroutes + 6 admin pages

**Next:** D5 (Motion & feedback premium) → D6-D8 → squash merge to main → deploy v0.9.3

---

### Session 170: Desktop Premium Plan D3 (2026-02-10)

**Status:** ✅ Complete (D0-D3 done, D4-D8 pending)

**Objective:** Execute D3 wave — data-heavy pages at 1440px. Sequence: estado actual → acción recomendada → detalle y contexto.

**Commits:**

1. `32f64a0` — D0-D2 desktop premium (shell, navigation, core pages) — lint fixes for command-palette + clientes
2. `6c63caa` — D3 data-heavy pages desktop premium
3. `f9fc0ff` — D3 completion report in UI_DESKTOP_PREMIUM_PLAN.md

**D3 Changes per page:**

- **Analíticas** — Compact KPI cards (p-4 lg:p-5, text-xs labels, text-xl values, p-2.5 icons), completion rate context ("51 de 279"), subtitle hidden on desktop
- **Suscripción** — Header standardized to `app-page-title`, subtitle hidden on desktop
- **Referencias** — Removed `min-h-screen bg-gradient-to-br` background, standardized header, 2-col desktop layout for no-code state with milestones preview panel
- **Lealtad/Configuración** — Header standardized to `app-page-title`, `text-muted-foreground` → `text-muted` (5 instances)

**Lint fixes (from D0-D2 commit):**

- Removed unused `Shield` import from command-palette.tsx
- Replaced `useEffect` setState with React render-time state adjustment pattern (prevPathname ref) in command-palette.tsx
- Removed unused `prefersReducedMotion`/`useReducedMotion` from clientes

**Next:** D4 (Configuración + Admin), D5-D8 remaining waves

---

### Session 169: Desktop Premium Plan D0-D2 (2026-02-10)

**Status:** ✅ Complete (D0-D2 done, D3-D8 pending)

**Objective:** Execute `UI_DESKTOP_PREMIUM_PLAN.md` waves D0-D2: Baseline screenshots + Shell/Navigation redesign + Core Operative page improvements at 1440px. North star: "Power with calm" (Linear/Notion/Slack benchmark).

**D0 — Baseline:**

- Took 1440px screenshots of all 9 core routes
- Documented per-route findings with severity levels
- Identified 5 shell-level issues (S1-S5) + per-route bugs

**D1 — Shell & Navigation:**

1. **Sidebar redesign** — Active state changed to solid black (`bg-zinc-900 text-white dark:bg-white dark:text-zinc-900`), Linear-style. Icons 18px with opacity transitions. Header h-14, nav space-y-0.5.
2. **Command Palette** — NEW `src/components/dashboard/command-palette.tsx`: `Cmd/Ctrl+K` global shortcut, 22 commands across 3 categories (create/navigate/settings), fuzzy search, keyboard navigation (↑↓ Enter Esc). Context pattern via `useCommandPalette()` hook.
3. **Search trigger** in sidebar — Button with ⌘K hint opens command palette.
4. **Layout integration** — `CommandPaletteProvider` wraps dashboard content.

**D2 — Core Operative Pages:**

1. **Servicios** — Table rows: hover-only actions (`group` + `opacity-0 group-hover:opacity-100`). "Acciones" header sr-only. "Insights" text label on icon button.
2. **Barberos** — Desktop table view (`hidden lg:block`) with columns (Barbero, Email, Rol, Estado, Acciones). Mobile list preserved (`lg:hidden`). Hover-only chevron.
3. **Clientes** — Table hover-only actions. Removed animated mesh background. Desktop cards redesigned: complex multi-indicator cards → compact rows (avatar, name, visits/spent, segment badge, hover chevron). Detail panel: collapsible grid (full-width when no client, 2/5+3/5 when selected). Empty state placeholder removed. Fixed Sheet overlay on desktop (removed `setIsMobileDetailOpen` from desktop handler).
4. **Citas** — Gap indicators: green dashed Zap → subtle gray dashed Plus with time range. Quick actions: colored card → inline bar ("6 pendientes" + outline "Confirmar todas"). Block headers: `text-lg` → `text-sm uppercase tracking-wide`. Removed animated mesh background.

**New files (1):** `src/components/dashboard/command-palette.tsx`

**Modified files (6):** `sidebar.tsx`, `layout.tsx`, `servicios/page-v2.tsx`, `barberos/page-v2.tsx`, `clientes/page-v2.tsx`, `citas/page-v2.tsx`

**Updated docs (1):** `UI_DESKTOP_PREMIUM_PLAN.md` (D0 baseline + D1 + D2 completion reports)

**Bug fixed:** Clientes detail Sheet overlay on desktop — onClick handler called both `setSelectedCardClient` and `setIsMobileDetailOpen(true)`, causing Sheet backdrop on all screen sizes. Removed mobile setter from desktop card handler.

**Code review fixes (5 items):**

1. **[Medium] Hover-only actions keyboard a11y** — Added `group-focus-within:opacity-100` to servicios, clientes, barberos table action containers so Tab-focused buttons become visible.
2. **[Medium] Barberos table keyboard a11y** — Added `tabIndex={0}`, `role="button"`, `onKeyDown` (Enter/Space), `aria-label`, `focus-visible:ring` to `<tr>` rows.
3. **[Medium] Command palette role filtering** — Added `useBusiness()` + `canBarberAccessPath()` to filter commands by role. Barbers only see routes their permissions allow.
4. **[Low] Arrow nav NaN guard** — Guard clause when `flatList.length === 0` prevents `% 0` = NaN.
5. **[Low] Dead code** — Removed unused `handleFillGap` from citas.

**Next:** D3-D8 waves (analytics, config, secondary pages, responsiveness, motion, final audit)

---

### Session 168: Olas 6-9 Complete (2026-02-10)

**Status:** ✅ Complete

**Objective:** Finish all remaining olas from UI_PREMIUM_SIMPLIFICATION_PLAN.md with pragmatic scope.

**Commits:**

1. `dff6b13` — **Ola 6: Gesture Hardening** — SwipeableRow edge exclusion, direction-aware drag, PullToRefresh container-aware scroll, AppointmentCard compact→SwipeableRow migration, gesture-config.ts
2. `7ffec61` — **Ola 6.1 + 7** — Gesture E2E tests (4 scenarios) + loading skeletons (clientes + citas)
3. `6f894b3` — **Ola 8** — Motion tokens centralized (card preset, 6 components), reducedMotion fallbacks, decorative mesh conditionals
4. `766a837` — **Ola 9** — Citas 2-row mobile header, servicios reduced-motion mesh guard, plan updated

**All 9 olas now marked ✅ DONE in UI_PREMIUM_SIMPLIFICATION_PLAN.md.**

**Next:** Squash merge `feature/customer-discovery-features` to main → deploy v0.9.3

---

### Session 167: Ola 5 — Pulido Maestro (2026-02-09)

**Status:** Complete

**Objective:** QA visual transversal — semantic color tokens + Button component migration across all dashboard pages.

**Changes:**

- **Color token migration** — 50+ instances of hardcoded `text-zinc-600 dark:text-zinc-400` and `text-zinc-500 dark:text-zinc-400` replaced with `text-muted` across: citas, clientes, servicios, analiticas, barberos, mi-dia, changelog, onboarding, configuracion subroutes, client dashboard, layout, error, shared components (stats-card, more-menu-drawer, mi-dia-header, barber-appointment-card, mi-dia-timeline)
- **Button component migration** — Raw `<button>` elements converted to `<Button variant="ghost">`: citas (8 nav/action buttons), clientes (9 sort/close/action buttons), servicios (7 sort/action buttons)
- **Intentional exceptions** — Empty state icons kept at `text-zinc-300 dark:text-zinc-600` (decorative), loyalty tier colors kept semantic, segmented controls + picker buttons left as specialized UI

**Verification:** TypeScript 0 new errors. Playwright 360px + dark mode: citas, servicios, clientes all verified clean.

---

### Session 166: Ola 4 Lint Fixes (2026-02-09)

**Status:** Complete

**Objective:** Fix 3 blocking lint errors + 2 additional issues from code review on Ola 4 files.

**Fixes applied:**

1. **`use-online-status.ts`** — [Alta] `wasOfflineRef.current` read during render → converted to `useState` + event callback pattern. [Baja] Duplicate cache writes → merged into single `setCache` call. Removed dead `prevOnlineRef` code and unused `useRef` import.

2. **`use-pwa-install.ts`** — [Alta] `setIsInstalled(detectStandalone())` in useEffect → linter moved to lazy `useState` initializer with SSR guard. [Media] iPadOS detection incomplete → added `navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1` check. [Warning] `(navigator as any)` → `(navigator as Record<string, unknown>)`.

3. **`offline/page.tsx`** — [Alta] `setLastOnline(cached.data)` in useEffect → linter moved to lazy `useState` initializer with SSR guard.

**Verification:** TypeScript: 0 errors in modified files (48 pre-existing in unrelated files).

---

### Session 165: Ola 4 — Native PWA (2026-02-09)

**Status:** ✅ Complete

**Objective:** Elevate PWA experience to feel native — stable manifest identity, home screen shortcuts, offline awareness, and contextual install prompt.

**What was done:**

1. **Manifest enhancements** — Added `id: '/?source=pwa'` (stable PWA identity), `categories: ['business', 'lifestyle']`, and 3 `shortcuts` (Nueva Cita, Clientes, Servicios with icons). Applied to both dynamic (`/api/pwa/manifest`) and static (`manifest.ts`) manifests.

2. **statusBarStyle fix** — Changed from `'default'` to `'black-translucent'` in root layout (Apple HIG compliance).

3. **Offline page redesign** — Dark mode support, `<Button>` component, `WifiOff` lucide icon, Framer Motion floating animation, auto-retry on `online` event, "last online" timestamp from cache, "Reconectando..." transition state.

4. **Online/offline detection** — New `useOnlineStatus()` hook using `useSyncExternalStore` (SSR-safe). New `OfflineBanner` component with amber warning bar + `AnimatePresence`. Toast notifications on offline/online transitions. Integrated into dashboard layout.

5. **Install prompt** — New `usePWAInstall()` hook with `beforeinstallprompt` (Android/Chrome), iOS detection, standalone detection, visit threshold (3), dismissal persistence. New `InstallPrompt` component: Android gets native install prompt, iOS gets 3-step modal instructions. Integrated into dashboard layout.

**New files (4):** `src/hooks/use-online-status.ts`, `src/components/dashboard/offline-banner.tsx`, `src/hooks/use-pwa-install.ts`, `src/components/pwa/install-prompt.tsx`

**Modified files (4):** `src/app/api/pwa/manifest/route.ts`, `src/app/manifest.ts`, `src/app/layout.tsx`, `src/app/(dashboard)/layout.tsx`

**Updated docs (1):** `UI_PREMIUM_SIMPLIFICATION_PLAN.md` (Ola 4 marked DONE)

**Verification:** ✅ Manifest JSON: id, shortcuts, categories present. ✅ Offline page: light + dark mode screenshots. ✅ Dashboard: no errors, components invisible when appropriate. ✅ TypeScript: 0 new errors.

---

### Session 164: Ola 3 — Data Readability (2026-02-09)

**Status:** ✅ Complete

**Objective:** Apply S1-S4 design principles to 4 data-heavy pages, reducing mobile cognitive load with collapsible sections and preference persistence. No functionality removed.

**What was done:**

1. **Suscripcion** — Replaced all raw `<button>` with `<Button>` component (primary, outline, danger variants). Migrated `text-zinc-500/600 dark:text-zinc-400` → `text-muted`. Collapsible "Planes Disponibles" and "Historial de Pagos" sections on mobile (hidden by default, always visible on desktop).

2. **Analiticas** — Period selector persists via `usePreference('analytics_period')`. Active chart tab persists via `usePreference('analytics_chart')`. Collapsible "Métricas Resumen" KPI stats on mobile. Desktop layout unchanged.

3. **Referencias** — Referral Code card stays always visible (primary action). Collapsible "Progreso de Hitos" (with remaining count), "Insignias Ganadas" (with count), "Conversiones" (with count) on mobile. Desktop layout unchanged.

4. **Admin Referencias** — 6 Global Stats KPI cards stay always visible. Collapsible "Ranking de Referrers" (with count), "Analytics y Tendencias", "Conversiones Recientes" (with count) on mobile. Desktop layout unchanged.

5. **New shared component** — `src/components/ui/collapsible-section.tsx`: Reusable mobile-only collapsible section with ChevronDown toggle, `hidden lg:block` pattern, aria-expanded, optional count badge. Works in both server and client components.

**New files (1):** `src/components/ui/collapsible-section.tsx`

**Modified files (4):** `suscripcion/page.tsx`, `analiticas/page-v2.tsx`, `referencias/page.tsx`, `admin/referencias/page.tsx`

**Updated docs (1):** `UI_PREMIUM_SIMPLIFICATION_PLAN.md` (Ola 3 marked DONE)

**Verification:** ✅ Mobile (390x844): ≤3 decisions in first viewport on all 4 pages. ✅ Desktop (1440x900): All sections visible, no toggles. ✅ TypeScript: 0 new errors. ✅ Collapsible toggles expand/collapse correctly with chevron rotation.

---

### Session 163: Ola 2 — Configuración Subroutes + Barberos (2026-02-09)

**Status:** ✅ Complete

**Objective:** Decompose monolithic Configuración page (1806 lines, 6 inline sheets) into real Next.js subroutes for native back navigation, code splitting, and deep linking. Minor barberos spacing fix. Document suscripción UX debt.

**What was done:**

1. **Configuración Landing Page** (`/configuracion/page.tsx`) — 6 navigation cards with colored icons, `<Link>` to subroutes, Cmd+K search modal, staggered animations.

2. **6 Subroute Pages:**
   - `/configuracion/general` — Business info form (name, phone, whatsapp, address) + booking link card with copy/open
   - `/configuracion/horario` — 7-day operating hours grid with IOSToggle + IOSTimePicker, collapsible advanced config (buffer time, advance booking days)
   - `/configuracion/branding` — Color picker + logo upload/delete + dual-mode live preview (light/dark)
   - `/configuracion/avanzado` — Notification preferences, push toggle, loyalty link, logout card
   - `/configuracion/equipo` — Staff permissions (5 view + 2 action permissions) with IOSToggle rows
   - `/configuracion/pagos` — Payment method toggles (cash/sinpe/card) with dynamic info note

3. **Navigation Updates:**
   - `mobile-header.tsx` — 6 new subroute titles in `titleByExactPath`, back button works via prefix matching
   - `sidebar.tsx` — Active state detection: `pathname.startsWith(\`${item.href}/\`)` for subroute highlighting
   - `settings-search-modal.tsx` — `router.push()` fallback navigates to subroutes

4. **Barberos Consistency** — 3 spacing fixes: `space-y-5`→`space-y-4 sm:space-y-6`, removed `space-y-1`, `mt-0.5`→`mt-1`

5. **Spanish Accents Fix** — Fixed ~60 missing accents across all 6 subroute pages (Información, teléfono, dirección, Atención, Página, etc.)

6. **Suscripción UX Debt** — Documented in `UI_PREMIUM_SIMPLIFICATION_PLAN.md` (raw buttons, old text patterns, no hierarchy)

**New files (7):**

- `src/app/(dashboard)/configuracion/page.tsx` (landing)
- `src/app/(dashboard)/configuracion/general/page.tsx`
- `src/app/(dashboard)/configuracion/horario/page.tsx`
- `src/app/(dashboard)/configuracion/branding/page.tsx`
- `src/app/(dashboard)/configuracion/avanzado/page.tsx`
- `src/app/(dashboard)/configuracion/equipo/page.tsx`
- `src/app/(dashboard)/configuracion/pagos/page.tsx`

**Deleted files (2):** `configuracion/page-v2.tsx` (1806 lines), `configuracion/page-old.tsx`

**Modified files (3):** `mobile-header.tsx`, `sidebar.tsx`, `settings-search-modal.tsx`

**Verification:** ✅ Desktop landing (card grid), ✅ Desktop subroute (form renders), ✅ Mobile landing (stacked cards), ✅ Mobile subroute (back arrow + title), ✅ Sidebar active state, ✅ TypeScript passes (no new errors)

---

### Session 162: Ola 1 — UI Premium Simplification (2026-02-09)

**Status:** ✅ Complete

**Objective:** Reduce decision density on 3 operational pages following rules S1-S4 from `UI_PREMIUM_SIMPLIFICATION_PLAN.md`.

**What was done:**

1. **Clientes** — View tabs (4 buttons) → inline dropdown with AnimatePresence. Segment chips (5 buttons) → bottom Sheet with rich rows. Stats collapsed by default on mobile (disclosure toggle below controls). Notifications default hidden. Bell removed from controls row. View preference persists via localStorage.

2. **Citas** — 2-row mobile header (~160px) → single compact row (~56px). Removed "Citas" title + NotificationBell (redundant with bottom nav). View switcher is ultra-compact D/S/M segmented control. Removed redundant large date display on desktop. View preference persists. Fixed pre-existing `intentHandled` ref bug.

3. **Servicios** — Subtitle simplified to "{N} servicios". Desktop insights sidebar → collapsible (default collapsed, toggle icon button). CRUD gets full width by default. Removed unused `_loading` variable.

4. **Shared** — New `src/lib/preferences.ts` (localStorage with `bsp_pref_` prefix, SSR-safe, optional validValues).

5. **Code review fixes** — Hydration mismatch (useEffect hydration instead of lazy initializer). D/S/M touch targets increased to 44px minimum. Dropdown accessibility (aria-expanded, aria-haspopup, Escape key). Preference validation against allowed values. First viewport reduced to ≤3 decisions.

**New files (1):** `src/lib/preferences.ts`

**Modified files (3):** `clientes/page-v2.tsx` (+268/-205), `citas/page-v2.tsx`, `servicios/page-v2.tsx`

**Gate 1 checklist:** ✅ ≤3 decisions in first viewport, ✅ all views/filters accessible (≤2 taps), ✅ no functionality removed, ✅ preferences persist, ✅ desktop unbroken, ✅ 0 hydration errors, ✅ 0 TypeScript errors

---

### Session 161: Client Dashboard Audit Fixes (2026-02-09)

**Status:** ✅ Complete

**Objective:** Fix 4 audit findings from code review of the client dashboard.

**What was done:**

1. **[High] RLS Security Fix** — Migration 029's UPDATE policy allowed ANY column. Created migration 030: dropped open UPDATE policy, replaced with `update_client_profile` SECURITY DEFINER RPC that only mutates `name` and `email`. Hook now uses `.rpc()` instead of `.update()`. Migration 030 executed in Supabase Dashboard.

2. **[Medium] Stale Profile State** — After saving profile, `clientName`/`clientEmail` in context stayed stale (fetched by server layout). Added `router.refresh()` after successful save to re-run server layout and refresh context props.

3. **[Medium] ThemeProvider Branding** — `ThemeProvider` was hardcoded to `businesses[0]?.brandColor`. Moved ThemeProvider inside `ClientProvider` so it reads `activeBusiness.brandColor`, updating dynamically when client switches business.

4. **[Medium] Empty Business Guard** — If `businessRows` was empty (business deleted/deactivated), `businessSlug` was `''` → CTA linked to invalid `/reservar/`. Added guard in layout: shows "Negocio No Disponible" blocked state if businesses array is empty.

**E2E verification:** Client login as `maria@test-client.dev` → `/mi-cuenta` renders correctly with all fixes. Owner login still works (no regressions).

**New files (1):** `030_client_update_rpc.sql`

**Modified files (4):** `useClientDashboard.ts`, `perfil/page.tsx`, `client-context.tsx`, `(client)/layout.tsx`

**Test accounts:**

- Client: `maria@test-client.dev` / `ClientTest123!` (linked to "Juan Pérez" in Test Barbería)

---

### Session 160: Client Dashboard /mi-cuenta v1 (2026-02-09)

**Status:** ✅ Complete

**Objective:** Build the 4th user role's UI — client dashboard at `/mi-cuenta` with home (next appointment + history), profile editing, loyalty display, and multi-business support.

**What was done:**

1. **Migration 029** — `supabase/migrations/029_client_dashboard_rls.sql`: 3 RLS policies (clients SELECT + UPDATE by user_id, appointments SELECT via client_id→clients.user_id). Index on `clients.user_id` WHERE NOT NULL. Services/barbers/businesses already have public SELECT policies.

2. **Role detection extended** — `src/lib/auth/roles.ts`: Added `'client'` to `UserRole` type. New `ClientRecord` interface + `isClient` boolean on `UserRoleInfo`. `detectUserRole()` now checks `clients` table by `user_id` AFTER admin/owner/barber checks fail (zero impact on existing users).

3. **Middleware update** — `/mi-cuenta` added to protected routes.

4. **Dashboard layout redirect** — If `detectUserRole()` returns `role: 'client'` → `redirect('/mi-cuenta')`. Prevents clients from accessing business dashboard.

5. **ClientProvider context** — `src/contexts/client-context.tsx`: Provides userId, clientId, clientName, clientEmail, clientPhone, businessId, businessName, businessSlug, businesses list, isMultiBusiness, switchBusiness(). Selected business persisted in localStorage.

6. **React Query hooks** — `src/hooks/queries/useClientDashboard.ts`: `useClientUpcoming(clientId)`, `useClientHistory(clientId)`, `useClientLoyalty(clientId, businessId)`, `useUpdateClientProfile()`. All use specific `select()` columns for egress optimization.

7. **Client layout** — `src/app/(client)/layout.tsx`: Server component with auth check, client record fetch, business info fetch, ClientProvider wrapper, ThemeProvider (brand-aware), bottom nav. Shows "Sin Cuenta de Cliente" fallback if no client records.

8. **Client bottom nav** — `src/components/client/client-bottom-nav.tsx`: 3 tabs [Inicio, Reservar, Perfil]. Follows Apple HIG (44px targets, indicator pill, same glass blur style as dashboard nav).

9. **Home page** — `src/app/(client)/mi-cuenta/page.tsx`: Greeting with first name, next upcoming appointment card (date/time/service/barber/status), "Reservar Cita" gradient button (→ /reservar/{slug}), appointment history list (past 20), loyalty card (tier/points/visits). Loading skeletons for all sections.

10. **Profile page** — `src/app/(client)/mi-cuenta/perfil/page.tsx`: Edit name + email (phone readonly), loyalty info (tier/points/visits/referral code), business switcher (multi-business), logout button. Save shows inline confirmation.

11. **TypeScript fixes** — Fixed `UserRole` type propagation in `bottom-nav.tsx` and `more-menu-drawer.tsx`. Used `as any` bypass for `payment_method` column in history hook.

**New files (7):** `029_client_dashboard_rls.sql`, `client-context.tsx`, `(client)/layout.tsx`, `mi-cuenta/page.tsx`, `mi-cuenta/perfil/page.tsx`, `client-bottom-nav.tsx`, `useClientDashboard.ts`

**Modified files (5):** `roles.ts`, `middleware.ts`, `(dashboard)/layout.tsx`, `bottom-nav.tsx`, `more-menu-drawer.tsx`, `DATABASE_SCHEMA.md`

**Playwright verified:** "Sin Cuenta de Cliente" fallback renders. Owner dashboard still works (no regressions).

**BLOCKER:** Migration 029 must be executed in Supabase Dashboard before testing with real client data.

**Next:** Execute migration 029, create test client auth account, full E2E verification with data.

---

### Session 159: WhatsApp Deep Links + Llegá Antes (2026-02-09)

**Status:** ✅ Complete

**Objective:** Add WhatsApp deep links to appointment cards in Mi Día, plus "Llegá Antes" feature that lets barbers notify next client via WhatsApp when they finish early.

**What was done:**

1. **WhatsApp deep-link utility** — `src/lib/whatsapp/deep-link.ts`: Normalizes CR phone numbers (8-digit, +506 prefix, international), builds `wa.me` links with optional pre-filled messages. Templates: confirmation, reminder, arrive-early (Costa Rican Spanish).

2. **WhatsApp button on cards** — `barber-appointment-card.tsx`: Green WhatsApp icon (MessageCircle) next to phone number. Opens `wa.me/{phone}` in new tab. Cached `buildWhatsAppLink()` result to avoid double call.

3. **"Llegá Antes" CTA** — On completed appointments, if next eligible appointment is within 60 min and has a phone: shows green banner "Avisar a {nombre} que llegue antes" → opens WhatsApp with pre-filled arrive-early message.

4. **Timezone fix** — `mi-dia-header.tsx`: `new Date("2026-02-09")` parsed as UTC midnight → in CR (UTC-6) showed Feb 8. Fixed: `new Date(\`${dateString}T12:00:00\`)` uses local noon.

5. **Code review fixes (3 items):**
   - [Media] `businessName` was empty string → now fetched from `businesses.name` in Mi Día page, passed through timeline to card. Fallback: "Tu barbería".
   - [Media] `nextAppointment` used `sortedAppointments[index + 1]` which could hit finalized appointments → now uses `.slice(index+1).find()` to skip completed/cancelled/no_show.
   - [Baja] `buildWhatsAppLink()` called twice in JSX → cached in `whatsAppLink` const.

**New files (1):** `src/lib/whatsapp/deep-link.ts`

**Modified files (4):** `barber-appointment-card.tsx`, `mi-dia-timeline.tsx`, `mi-dia/page-v2.tsx`, `mi-dia-header.tsx`

**Next:** Client Dashboard (`/mi-cuenta`) — auth, home, history, live tracking

---

### Session 158: Push Notifications + Payment Methods Fixes (2026-02-09)

**Status:** ✅ Complete

**Objective:** Fix payment methods bugs from code review feedback, then implement Web Push Notifications (Feature 4A) for owner/barber.

**Part 1 — Payment Methods Bug Fixes (4 issues):**

1. **[Alta] 0-methods fallback** — `barber-appointment-card.tsx:86`: Empty array `[]` has `.length === 0` (falsy), so it fell to the fallback showing ALL payment methods. Fixed: `acceptedPaymentMethods == null` distinguishes null/undefined (legacy, show all) from `[]` (0 methods, skip payment).

2. **[Media] PaymentMethodsSheet error handling** — `configuracion/page-v2.tsx`: Added `loadError` state. If query fails: toast error + "No se pudo cargar" UI + Save button hidden (prevents overwriting real config).

3. **[Media] Mi Día error handling** — `mi-dia/page-v2.tsx`: Changed initial state from `[]` to `null`. If query fails, keeps `null` → card falls back to showing all methods (safer than skipping). Added `console.error` for debugging.

4. **[Baja] Lint `as any` cleanup** — Removed `as any` from Mi Día (2 instances) and Configuración (select + update) by using `Record<string, unknown>` casts.

**Part 2 — Push Notifications (Feature 4A):**

1. **Dependencies** — Installed `web-push` + `@types/web-push`. Generated VAPID keys with `scripts/generate-vapid-keys.mjs`. Keys added to `.env.local` + Vercel.

2. **Migration 028** — `push_subscriptions` table: user_id, endpoint (unique), p256dh, auth, is_active, failed_count. RLS for user insert/select/delete. Auto-update trigger. Executed in Supabase Dashboard.

3. **Service Worker** — `public/sw.js`: Added `push` event listener (showNotification with title/body/icon/badge/tag) + `notificationclick` handler (navigate to URL or focus existing window). Cache bumped to v4.

4. **Push sender** — `src/lib/push/sender.ts`: `sendPushToUser(userId, payload)` sends to all active devices, handles 410 Gone (deactivates), deactivates after 5 consecutive failures, resets count on success. `sendPushToBusinessOwner(businessId, payload)` looks up owner_id. Uses service client (bypasses RLS).

5. **Subscribe API** — `src/app/api/push/subscribe/route.ts`: POST upserts subscription (reactivates if endpoint exists). DELETE soft-deactivates. Both require auth.

6. **Client hook** — `src/hooks/use-push-subscription.ts`: `usePushSubscription()` returns isSupported, permission, isSubscribed, subscribe(), unsubscribe(), loading. Handles iOS detection, VAPID key conversion, existing subscription check on mount.

7. **UI toggle** — `src/components/settings/push-notification-toggle.tsx` in Configuración > Avanzada. Three states: unsupported (disabled gray), denied (red "Bloqueado"), normal (blue toggle). Uses IOSToggle + toast feedback.

8. **4 triggers integrated** (all async .catch(), never block):
   - Public booking → push to owner ("Nueva cita agendada")
   - Check-in → push to owner ("Cita iniciada")
   - Complete → push to owner ("Cita completada · 12min · Efectivo")
   - No-show → push to owner ("No show · Cliente no se presentó")

**New files (6):** generate-vapid-keys.mjs, 028_push_subscriptions.sql, push/sender.ts, push/subscribe/route.ts, use-push-subscription.ts, push-notification-toggle.tsx

**Modified files (11):** barber-appointment-card.tsx, configuracion/page-v2.tsx, mi-dia/page-v2.tsx, sw.js, book/route.ts, check-in/route.ts, complete/route.ts, no-show/route.ts, .env.example, DATABASE_SCHEMA.md

**Playwright verified:** Toggle visible in Configuración > Avanzada, correct styling and placement.

**Part 3 — Push Notifications Code Review Fixes (4 issues):**

1. **[Alta] RLS missing UPDATE policy** — Migration 028 only had INSERT/SELECT/DELETE. Upsert on conflict and soft-delete both require UPDATE. Added UPDATE policy (`user_id = auth.uid()` for USING + WITH CHECK). User executed SQL patch in Supabase Dashboard.

2. **[Media] Hook doesn't check res.ok on DELETE** — `unsubscribe()` reported success even if server failed (browser unsubscribed but DB still had active record). Fixed: check `res.ok` before calling `subscription.unsubscribe()`.

3. **[Baja] ESLint react-hooks set-state-in-effect** — `setIsSupported(supported)` inside `useEffect`. Fixed by using lazy initializer pattern: `useState(() => checkPushSupport())` for both `isSupported` and `permission`.

4. **[Baja] Invalid JSON returns 500** — `request.json()` parse error was caught by outer catch block → returned 500. Fixed: separate try/catch for JSON parse → returns 400 with "JSON inválido".

**Next:** WhatsApp deep links + buttons in appointment cards → Client Dashboard (/mi-cuenta)

---

### Session 157: Settings — Métodos de Pago Aceptados (2026-02-09)

**Status:** ✅ Complete

**Objective:** Add payment method configuration to Configuración so owners can choose which payment methods their barbers offer at completion.

**What was done:**

1. **New card in Configuración** — 6th card "Métodos de Pago" (emerald theme, Banknote icon) added to the settings grid in `configuracion/page-v2.tsx`.

2. **PaymentMethodsSheet component** — Bottom sheet with 3 IOSToggle rows (Efectivo, SINPE Móvil, Tarjeta), each with icon + description. Dynamic info text explains behavior based on active count. Reads/writes `businesses.accepted_payment_methods` JSONB (column from migration 025).

3. **Smart completion flow in BarberAppointmentCard** — New `acceptedPaymentMethods` prop filters payment options:
   - 0 methods → complete without asking payment (legacy 2-tap)
   - 1 method → auto-select, skip sheet (2 taps)
   - 2+ methods → show picker sheet (3 taps)

4. **Data pipeline** — Mi Día page fetches `accepted_payment_methods` from business table → passes through `MiDiaTimeline` → `BarberAppointmentCard`.

5. **Playwright verified** — Desktop 2-column grid, mobile single-column, sheet toggles, data persistence round-trip, dynamic info text updates.

**Files modified:**

- `src/app/(dashboard)/configuracion/page-v2.tsx` — new card + PaymentMethodsSheet component
- `src/components/barber/barber-appointment-card.tsx` — acceptedPaymentMethods prop + smart flow
- `src/components/barber/mi-dia-timeline.tsx` — pass-through prop
- `src/app/(dashboard)/mi-dia/page-v2.tsx` — fetch payment methods from business

**Next:** Push Notifications (Feature 4A — VAPID + service worker + subscribe API)

---

### Session 155: RBAC Testing + Citas Bug Fixes (2026-02-09)

**Status:** ✅ Complete

**Objective:** Test RBAC system end-to-end with real barber login, fix citas page bugs discovered during testing.

**What was done:**

1. **Barber test user created** — Created Supabase auth user `carlos@test-barbershop.dev` / `BarberTest123!` (user_id: `9049b562-8631-40b2-9ed6-cc3f16af0aa1`). Linked to existing barber record "Carlos Test" in Test Barbería.

2. **Migration 027 executed** — `staff_permissions` column was missing from businesses table (user had run it on wrong Supabase project). Re-executed on correct project `zanywefnobtzhoeuoyuc`.

3. **RBAC tests all passed:**
   - Barber login → redirect to `/mi-dia` ✅
   - Bottom nav: [Mi Día, Citas, +, Servicios, Más] ✅
   - `/barberos` (owner-only) → AccessDenied ✅
   - `/clientes` (nav_clientes=false) → AccessDenied ✅
   - Menú "Más": only Novedades + Cerrar Sesión ✅
   - Owner toggles permission → barber access updated ✅
   - Equipo y Accesos sheet with 7 toggles + save ✅
   - Citas barber_id filtering logic verified ✅

4. **Bug fix: citas page crash** — `searchParams` imported from next/navigation but `useSearchParams()` never called → `ReferenceError`. Also `today` variable used but never declared. Fixed both in `page-v2.tsx`.

5. **Mobile header enhancement** — Added back navigation, router support, and expanded path-based titles (pre-existing uncommitted change included in commit).

**Files modified:** `src/app/(dashboard)/citas/page-v2.tsx`, `src/components/dashboard/mobile-header.tsx`

**Test accounts:**

- Owner: `test@barbershop.dev` / `TestPass123!` (Test Barbería)
- Barber: `carlos@test-barbershop.dev` / `BarberTest123!` (Carlos Test)

**Next:** Feature 0B (invite/manage barbers) → Push Notifications

---

### Session 154: Feature 0A — RBAC + Role Detection + Owner-Configurable Permissions (2026-02-09)

**Status:** Code complete. Migration 027 executed.

**Objective:** Implement role-based access control so barbers see a tailored experience (hide-based, not redirect-based) and owners can configure what their staff sees/does.

**What was done:**

1. **Migration 027** — `supabase/migrations/027_staff_permissions.sql`: Added `staff_permissions` JSONB column to businesses table with 7 boolean keys (nav_citas, nav_servicios, nav_clientes, nav_analiticas, nav_changelog, can_create_citas, can_view_all_citas).

2. **Role detection module** — `src/lib/auth/roles.ts` (NEW): `UserRole` type, `StaffPermissions` interface, `DEFAULT_STAFF_PERMISSIONS`, `detectUserRole()` (admin > owner > barber priority), `canBarberAccessPath()`, `getStaffPermissions()` (merges DB value with defaults).

3. **Layout refactor** — `src/app/(dashboard)/layout.tsx`: Replaced separate isAdmin/isBarber/business queries with unified `detectUserRole()`. Barbers now get their business via `barbers.business_id` (not owner_id). Added inline `<AccessDenied />` component for restricted pages (not redirect). Barber `/dashboard` redirects to `/mi-dia`.

4. **Business context extended** — `src/contexts/business-context.tsx`: Added `userRole`, `isOwner`, `isBarber`, `isAdmin`, `barberId`, `staffPermissions` to context. All client components can now use `useBusiness()` for role-aware rendering.

5. **Role-aware bottom nav** — `src/components/dashboard/bottom-nav.tsx`: Owner: unchanged [Citas, Clientes, +, Servicios, Más]. Barber: [Mi Día, Citas?, +, Servicios?, Más] based on staff_permissions. + button: barber goes directly to create cita (skips action sheet). Plus button hidden if can_create_citas = false.

6. **Role-aware more menu** — `src/components/dashboard/more-menu-drawer.tsx`: Each menu item tagged with `ownerOnly` or `barberPermission`. Barbers only see items their owner has enabled. Always hidden for barbers: Inicio, Barberos, Suscripción, Lealtad, Configuración.

7. **Owner settings UI** — `src/app/(dashboard)/configuracion/page-v2.tsx`: New 5th card "Equipo y Accesos" with teal Users icon. Opens sheet with IOSToggle for each permission key, grouped by VER (what barbers see) and HACER (what barbers can do). Saves to businesses.staff_permissions via Supabase update.

8. **Middleware update** — Added `/mi-dia`, `/analiticas`, `/lealtad`, `/suscripcion`, `/changelog` to protected routes.

9. **DATABASE_SCHEMA.md** updated with new column.

**Architecture:**

- Hide, don't redirect (primary UX = items not rendered, fallback = inline AccessDenied)
- Owner-configurable permissions via JSONB on businesses (same pattern as notification_settings)
- All barbers in same business share permissions (per-barber = future Phase 2)
- Sensible defaults: Mi Día ON, own citas ON, servicios ON, create walk-ins ON, everything else OFF

**Files modified:** 10 files (2 new, 8 modified)

10. **Citas page barber filtering** — `src/app/(dashboard)/citas/page-v2.tsx`: Added `roleFilteredAppointments` memo that filters by `barber_id` when role=barber and `can_view_all_citas`=false. All downstream computations (day/week/month, stats, sidebar, detail modal) use filtered list. Barber picker hidden in create form (auto-assigned). Form reset preserves barberId.

**Next:** Test with barber login, Feature 0B (invite/manage barbers)

---

### Session 153: Testing + Mi Día Navigation + Bug Fixes (2026-02-08)

**Status:** Completed

**Objective:** Execute pending migrations, test full Iniciar→Timer→Completar→Payment flow with real data, fix UI bugs found during testing, add Mi Día to navigation.

**What was done:**

1. **Migration 025 executed** — User ran smart scheduling features migration in Supabase Dashboard. No longer a blocker.

2. **Migration 026 created + executed** — `supabase/migrations/026_fix_barbers_and_seed_test.sql`: Fixed barbers table (added `phone`, `role`, `avatar_url`, `role_id` columns). Seeded test barber "Carlos Test", client "María Prueba", and 2 appointments for test business.

3. **Bug fix: useBarbers 400 error** — `useBarbers.ts` selected `role_id` which doesn't exist in the new Supabase project schema. Removed `role_id` from all 4 `.select()` queries.

4. **Bug fix: useAppointments missing columns** — `useBarberDayAppointments` didn't include `started_at`, `actual_duration_minutes`, `payment_method` in `.select()`. LiveTimer never showed, payment method was always null. Fixed by adding the 3 columns.

5. **Bug fix: $ symbol in price** — `barber-appointment-card.tsx` had `DollarSign` icon + `Intl.NumberFormat` CRC = double symbol `$ ₡5 000`. Removed `DollarSign` icon. Now shows `₡5 000` correctly.

6. **Mi Día in navigation** — Added `isBarber` detection in `layout.tsx` (queries barbers table for user_id). Passed through `BottomNav` → `MoreMenuDrawer`. Mi Día appears as first item in "Más" menu with teal CalendarClock icon. `/mi-dia` added to `morePages` for active indicator.

7. **UI fixes** — Sheet z-index bumped to z-[70]/z-[71] (above bottom nav). iOS date/time pickers repositioned above bottom nav. Citas picker sheet repositioned with proper safe area offset.

8. **Full flow tested with Playwright** — Iniciar → LiveTimer (mm:ss) → Completar → Payment Sheet → Efectivo → "1 min · Efectivo" badge. All verified with screenshots.

**Files modified:** layout.tsx, bottom-nav.tsx, more-menu-drawer.tsx, barber-appointment-card.tsx, useBarbers.ts, useAppointments.ts, sheet.tsx, ios-date-picker.tsx, ios-time-picker.tsx, citas/page-v2.tsx, migration 026

---

### Session 152: Customer Discovery Feature 1 — Duration Tracking + Payment Method (2026-02-08)

**Status:** ✅ Code complete (migration pending execution)

**Objective:** Implement Feature 1 from customer discovery plan — dynamic duration tracking and smart completion flow with payment method selection. This is the critical demo for Tuesday's meeting with Barbero 1.

**What was done:**

1. **Plan created** — `PLAN_CUSTOMER_DISCOVERY.md` in root, detailed plan at `.claude/plans/declarative-soaring-thunder.md`. Covers 5 features from barber interviews: Duration Tracking (P1), Smart Slots (P2), SINPE Deposits (P3), Notifications (P4), Client Dashboard (P5). 4 user role architecture.

2. **Branch created** — `feature/customer-discovery-features` from main.

3. **Migration 025** — `supabase/migrations/025_smart_scheduling_features.sql`: Added `started_at` (TIMESTAMPTZ), `actual_duration_minutes` (INT), `payment_method` (TEXT w/ CHECK) to appointments. Added `accepted_payment_methods` (JSONB), `notification_settings` (JSONB) to businesses. Indexes for started_at and payment_method. **USER MUST EXECUTE IN SUPABASE DASHBOARD.**

4. **Check-in API** — `/api/appointments/[id]/check-in/route.ts` now saves `started_at = NOW()` when checking in (renamed to "Iniciar" in UI).

5. **Complete API** — `/api/appointments/[id]/complete/route.ts` now accepts `payment_method` in request body, calculates `actual_duration_minutes` from `started_at`, saves both with completion. Sanity check: negative or >8h durations set to null.

6. **Today API** — `/api/barbers/[id]/appointments/today/route.ts` now returns `started_at`, `actual_duration_minutes`, `payment_method` in response.

7. **Hook updated** — `use-appointment-actions.ts`: `complete()` accepts optional `PaymentMethod` parameter, passes it in request body.

8. **BarberAppointmentCard rewrite** — New features:
   - `LiveTimer` component (client-side mm:ss counter from DB `started_at`)
   - "Iniciar" button (was "Check-in")
   - Payment method bottom sheet (Efectivo / SINPE Móvil / Tarjeta)
   - Completion badge (green: "12 min · Efectivo")
   - 44px+ touch targets on all buttons
   - Haptic feedback (tap on Iniciar, success on payment select)
   - In-progress: Completar button spans 2 columns

9. **Email on booking** — Public booking route (`/api/public/[slug]/book`) now sends email + in-app notification to business owner async (non-blocking). Uses existing Resend infra + NewAppointmentEmail template. Respects notification preferences.

10. **Types updated** — `TodayAppointment` in `src/types/custom.ts` + API route interfaces include new fields. Mock data in `mi-dia-demo.tsx` updated.

**Flow (3 taps max):**

```
[Iniciar] → timer starts → [Completar] → sheet: [Efectivo] [SINPE] [Tarjeta] → done
```

**BLOCKER:** Migration 025 must be executed in Supabase Dashboard before testing with real data. Until then, `@ts-expect-error` / `as any` casts bypass Supabase type errors.

**Files modified:** 12 files (3 API routes, 1 hook, 2 components, 1 types file, 1 booking route, 1 migration, 1 schema doc, 1 plan, 1 demo)

---

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

**Last Update:** Session 171 (2026-02-10)
**Status:** Desktop Premium Plan D0-D4 complete. D5-D8 pending.
**Next:** D5 (Motion & feedback premium) → D6-D8 → squash merge to main → deploy v0.9.3
