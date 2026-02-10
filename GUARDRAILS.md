# Product Guardrails

**Purpose:** Prevent accidental breakage and design drift.
**Audience:** Future maintainers (human or AI).
**Status:** Active

---

## 1. Audit Blocks

### Pre-Change Audit Gate (Required)

Before ANY significant change, verify which audit blocks apply:

| Block                           | Purpose                                      | Trigger                     |
| ------------------------------- | -------------------------------------------- | --------------------------- |
| **1 - System & States**         | Single source of truth; explicit transitions | Data models, state machines |
| **2 - Narrative & Flow**        | User always knows location + next step       | Navigation, onboarding      |
| **3 - Visual Hierarchy**        | Primary action unmistakable                  | Layout, CTAs                |
| **4 - Guardrails & Regression** | Known failure modes protected                | High-risk areas             |
| **5 - Data Integrity**          | Writes explicit, scoped, inspectable         | Persistence, bulk ops       |
| **6 - Motion & Accessibility**  | Motion purposeful + reduced-motion safe      | Animations                  |

### Merge Gate

**Merge is BLOCKED if:**

1. Required audit blocks not addressed
2. No clear reason for skipping a block
3. Change touches high-risk area without review

## 2. Baseline Declaration

The following behaviors define "correct" and must not regress:

| Area                 | Correct Behavior                                                      |
| -------------------- | --------------------------------------------------------------------- |
| PWA Update           | Opens app → sees latest version without reinstalling                  |
| Mobile Touch Targets | All interactive elements minimum 44x44px                              |
| Bottom Nav           | Single tab bar, center + for actions, no FABs                         |
| Forms                | Open in bottom sheets, not side drawers or new pages                  |
| Brand Colors         | Use `var(--brand-primary)` tokens, never hardcoded violet/purple/blue |
| Secondary Text       | Use `text-muted` class (6.2:1 contrast), not `text-zinc-500`          |
| Chart SVG Colors     | Use `useChartColors()` hook, not CSS vars in SVG attributes           |
| Database Queries     | Always verify columns exist in DATABASE_SCHEMA.md first               |
| Supabase Egress      | Selective `select('col1,col2')`, no `select('*')` in production       |
| Deploy               | Bump version + CHANGELOG.md + RELEASE_NOTES.md before push to main    |

## 3. High-Risk Zones

Changes here require full audit:

| Zone                 | Files                                          | Why                                            |
| -------------------- | ---------------------------------------------- | ---------------------------------------------- |
| Authentication/RLS   | `src/lib/supabase/middleware.ts`, RLS policies | Security critical, self-reference risk         |
| Service Worker       | `public/sw.js`, `service-worker-register.tsx`  | Breaks PWA update flow if misconfigured        |
| Database Migrations  | `supabase/migrations/`                         | Data integrity, verify against DATABASE_SCHEMA |
| Bottom Navigation    | `src/components/dashboard/bottom-nav.tsx`      | Core navigation, Apple HIG compliance          |
| Design System Tokens | `src/app/globals.css` (`:root` vars)           | Affects every page visually                    |
| Supabase Client      | `src/lib/supabase/`                            | Egress impact, auth flow                       |

## 4. Design Constraints

### Do NOT:

- [x] Cache HTML in Service Worker precache (causes stale PWA)
- [x] Use `select('*')` in Supabase queries (egress drain)
- [x] Create RLS policies that query the same table they're on (infinite recursion)
- [x] Use hardcoded color values for brand identity (use CSS tokens)
- [x] Use `text-zinc-500 dark:text-zinc-400` for secondary text (use `text-muted`)
- [x] Use CSS `var()` in SVG attribute props (doesn't work, use JS hook)
- [x] Use FABs, side drawers, or Material Design patterns on mobile (Apple HIG)
- [x] Assume database columns exist without checking DATABASE_SCHEMA.md
- [x] Push to main without updating version, CHANGELOG.md, RELEASE_NOTES.md

### Always:

- [x] Verify UI changes visually with Playwright screenshots
- [x] Use `text-muted` / `text-subtle` for secondary/tertiary text
- [x] Use `<Button>` component variants, not manual `<button>` tags
- [x] Use bottom sheets for mobile forms and create flows
- [x] Use `whileTap` only for touch feedback (no `whileHover` on mobile)
- [x] Monitor Supabase egress in dashboard proactively

## 5. Known Bugs (Never Repeat)

| Bug ID | Description                         | Fix                                       | Date       |
| ------ | ----------------------------------- | ----------------------------------------- | ---------- |
| #001   | iOS PWA shows stale content         | Remove `/` from SW precache               | 2026-02-07 |
| #002   | RLS infinite recursion on barbers   | Drop self-referencing policy              | 2026-02-05 |
| #003   | Supabase egress exhausted (112%)    | Migrate project, cache, selective queries | 2026-02-05 |
| #004   | Chart colors wrong in SVG           | Use `useChartColors()` JS hook            | 2026-02-07 |
| #005   | text-zinc-500 low contrast (4.88:1) | Migrate to `text-muted` (6.2:1)           | 2026-02-07 |
| #006   | nav-indicator lost premium glow     | Increase dark mode opacity intensities    | 2026-02-07 |

---

**Canonical cross-links:**

- CLAUDE.md (project instructions)
- DECISIONS.md (design rationale)
