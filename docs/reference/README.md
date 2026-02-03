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

- [Testing Guide](TESTING.md) - Test strategies, coverage, E2E
- [Playwright Trace Viewer](PLAYWRIGHT_TRACE_GUIDE.md) - Complete trace viewer guide
- [Trace Quick Start](TRACE_QUICK_START.md) - 3-step trace viewer guide
- [UI Exploration](UI_EXPLORATION_GUIDE.md) - Manual testing & competitor analysis
- [Playwright Profiles](playwright-profiles.md) - Trace recording configurations
- [GitHub Actions](GITHUB_ACTIONS.md) - CI/CD workflows
- [Skills Installed](SKILLS_INSTALLED.md) - Available Claude Code skills

### Design & UX

- [Accessibility](accessibility.md) - WCAG compliance guide
- [Accessibility Audit](accessibility-audit.md) - Audit results
- [Design Tokens](design-tokens.md) - Color, spacing, typography system

### Performance & Security

- [Performance Baseline](performance-baseline.md) - Metrics and optimization targets
- [Security Headers](security-headers.md) - CSP, CORS, security configuration

---

## Quick Reference

| Topic          | File                                                   | Description                            |
| -------------- | ------------------------------------------------------ | -------------------------------------- |
| Bug Prevention | [lessons-learned.md](lessons-learned.md)               | 11 critical patterns from real bugs    |
| Testing        | [TESTING.md](TESTING.md)                               | Jest, Vitest, E2E strategies           |
| Trace Viewer   | [TRACE_QUICK_START.md](TRACE_QUICK_START.md)           | Playwright trace viewer (3-step guide) |
| Trace Guide    | [PLAYWRIGHT_TRACE_GUIDE.md](PLAYWRIGHT_TRACE_GUIDE.md) | Complete trace viewer documentation    |
| UI Exploration | [UI_EXPLORATION_GUIDE.md](UI_EXPLORATION_GUIDE.md)     | Manual testing & competitor analysis   |
| Trace Profiles | [playwright-profiles.md](playwright-profiles.md)       | Recording configurations               |
| Accessibility  | [ACCESSIBILITY.md](ACCESSIBILITY.md)                   | WCAG AA compliance                     |
| Performance    | [PERFORMANCE_BASELINE.md](PERFORMANCE_BASELINE.md)     | Load time, bundle size targets         |
| Security       | [SECURITY_HEADERS.md](SECURITY_HEADERS.md)             | Header configuration                   |
| Design System  | [DESIGN_TOKENS.md](DESIGN_TOKENS.md)                   | Design token reference                 |

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
