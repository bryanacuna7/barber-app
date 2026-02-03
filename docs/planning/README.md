# Planning Documents

Implementation plans and project roadmaps.

---

## Active Plans

### [Implementation Plan v2.5](implementation-v2.5.md)

**Status:** Active
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
