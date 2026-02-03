# Reference Documentation

Technical guides, best practices, and knowledge base.

---

## Critical Knowledge

### [Lessons Learned](lessons-learned.md) 🔥

Critical patterns extracted from real bugs. **Read before coding.**

**Top 5 Lessons:**

1. RLS + Triggers need `SECURITY DEFINER` (Session 69)
2. DATABASE_SCHEMA.md is source of truth (Session 65)
3. Server Components: Use Supabase, not fetch (Session 55)
4. Regenerate types after migrations (Session 67)
5. Check for duplicate Next.js processes (Session 55)

---

## Technical Guides

### Development

- [Testing Guide](testing.md) - Test strategies, coverage, E2E
- [GitHub Actions](github-actions.md) - CI/CD workflows
- [Skills Installed](skills-installed.md) - Available Claude Code skills

### Design & UX

- [Accessibility](accessibility.md) - WCAG compliance guide
- [Accessibility Audit](accessibility-audit.md) - Audit results
- [Design Tokens](design-tokens.md) - Color, spacing, typography system

### Performance & Security

- [Performance Baseline](performance-baseline.md) - Metrics and optimization targets
- [Security Headers](security-headers.md) - CSP, CORS, security configuration

---

## Quick Reference

| Topic          | File                                               | Description                         |
| -------------- | -------------------------------------------------- | ----------------------------------- |
| Bug Prevention | [lessons-learned.md](lessons-learned.md)           | 11 critical patterns from real bugs |
| Testing        | [testing.md](testing.md)                           | Jest, Vitest, E2E strategies        |
| Accessibility  | [accessibility.md](accessibility.md)               | WCAG AA compliance                  |
| Performance    | [performance-baseline.md](performance-baseline.md) | Load time, bundle size targets      |
| Security       | [security-headers.md](security-headers.md)         | Header configuration                |
| Design System  | [design-tokens.md](design-tokens.md)               | Design token reference              |

---

## Adding New References

When creating a new reference document:

1. **Save as:** `docs/reference/[topic-name].md`
2. **Update this index** with link and description
3. **Use lowercase-with-hyphens** naming convention
4. **Include these sections:**
   - Overview
   - Quick Start
   - Detailed Guide
   - Examples
   - Common Pitfalls
   - Related Documentation

---

## Related Documentation

- [../../DATABASE_SCHEMA.md](../../DATABASE_SCHEMA.md) - Database schema (source of truth)
- [../../DECISIONS.md](../../DECISIONS.md) - Architectural decisions
- [../planning/](../planning/) - Implementation plans
- [../specs/](../specs/) - Feature specifications
