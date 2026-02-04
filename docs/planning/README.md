# Planning Documents

Implementation plans and project roadmaps.

---

## 📋 Roadmap Hierarchy (Which to Use When)

### 1. [MVP_ROADMAP.md](MVP_ROADMAP.md) - PRIMARY for MVP Launch 🎯

**Use for:** Getting to production with core business features
**Status:** Active - Pre-launch
**Scope:** Essential barbershop operations (appointments, clients, services, payments)
**Timeline:** Launch-critical features only

### 2. [POST_MVP_ROADMAP.md](POST_MVP_ROADMAP.md) - Post-Launch Features 🚀

**Use for:** Features to build AFTER MVP is live
**Status:** Planned - Post-launch
**Scope:** Advanced features (analytics, marketing, advanced automation)
**Timeline:** After stable production deployment

### 3. [UI/UX Redesign Roadmap](../ui-ux-redesign/UI_UX_REDESIGN_ROADMAP.md) - Visual Transformation 🎨

**Use for:** Awwwards-level UI/UX improvements (9.3/10 target)
**Status:** Design phase complete (7/7 modules decided)
**Scope:** Visual redesign of all 7 main modules
**Timeline:** Can run in parallel with Post-MVP Tier 1 OR after MVP launch
**See also:** [UI/UX Redesign README](../ui-ux-redesign/README.md) for all 7 winning demos

---

## Active Implementation Plans

### [Implementation Plan v2.5](implementation-v2.5.md)

**Status:** Active - Technical Debt Cleanup
**Scope:** Major app transformation (Audited & Improved)
**Estimated:** 154-200 hours (8-10 weeks)
**Score:** 6.0/10 → 8.5/10 projected

**Current Progress:** Área 0 - Technical Debt Cleanup (80% complete)

**Key Areas:**

1. ✅ Task 1: Security Fixes (4 vulnerabilities)
2. ✅ Task 2: DB Performance (7 indexes, N+1 fix)
3. ✅ Task 3: Observability (Pino, Sentry, Redis)
4. 🔄 Task 4: TypeScript Strict Mode (15 errors remaining)

**Next:** Área 1 - Client Subscription & Basic Plan

---

## Completed Plans

See [archive](../archive/) for historical implementation plans.

---

## Creating New Plans

When creating a new implementation plan:

1. **Use this template:**

   ```markdown
   # [Feature Name] Implementation Plan

   ## Overview

   - Goal: [What we're building]
   - Estimated: [Hours/weeks]
   - Status: [Planning/Active/Complete]

   ## Tasks

   1. Task 1 (estimated time)
   2. Task 2 (estimated time)

   ## Dependencies

   - What needs to be done first

   ## Risks

   - What could go wrong
   ```

2. **Save as:** `docs/planning/[feature-name]-plan.md`
3. **Update this index** with link and summary
4. **Reference in PROGRESS.md** under "In Progress"

---

## Related Documentation

- [PROGRESS.md](../../PROGRESS.md) - Current session state
- [DECISIONS.md](../../DECISIONS.md) - Architectural decisions
- [docs/specs/](../specs/) - Feature specifications
