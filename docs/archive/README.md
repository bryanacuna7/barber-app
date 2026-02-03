# Documentation Archive

Historical documentation, completed implementations, and archived decisions.

---

## Organization

Archives are organized chronologically by month/year:

```
archive/
├── 2026-01/          ← January 2026 archives
├── progress/         ← Session archives
└── [older dates]     ← As needed
```

---

## Progress Archives

### [Sessions 54-65: Business Referral System](progress/sessions-54-65.md)

**Period:** February 1-3, 2026 (12 sessions)
**Theme:** Complete B2B referral system implementation
**Output:** ~3,500 lines of code across 25+ files

**Key Deliverables:**

- 8 API endpoints (referral management + admin analytics)
- 10 React components (business + admin dashboards)
- Signup flow integration with cookie tracking
- Migration 019: Business referral tables

**Critical Lessons:**

- Session 55: Server Component auth fix (direct Supabase, not fetch)
- Session 64-65: Security & performance sprint (4 vulns fixed, 7 indexes)

---

## Implementation Archives (2026-01)

### Completed Refactors

- [components-migration-guide.md](2026-01/components-migration-guide.md) - Component organization refactor
- [dropdown-refactor-analysis.md](2026-01/dropdown-refactor-analysis.md) - Dropdown component redesign
- [refactoring-complete.md](2026-01/refactoring-complete.md) - Refactoring summary
- [refactor-candidates.md](2026-01/refactor-candidates.md) - Components identified for refactor

### Phase Completions

- [phase1-implementation.md](2026-01/phase1-implementation.md) - Initial implementation phase
- [ui-premium-improvements.md](2026-01/ui-premium-improvements.md) - UI enhancement sprint

---

## Other Archives

- [skills-migration-notes-20260202.md](skills-migration-notes-20260202.md) - Claude Code skills migration

---

## Archive Policy

### When to Archive

Documents are moved to archive when:

1. **Implementation complete** - Feature fully shipped and stable
2. **Decision superseded** - Replaced by newer decision or approach
3. **Plan obsolete** - Plan completed or replaced by v2
4. **Age threshold** - Sessions > 90 days old (except critical lessons)

### What NOT to Archive

- **Active implementations** - Keep in docs/planning/
- **Current state** - Keep in PROGRESS.md
- **Critical lessons** - Keep in docs/reference/lessons-learned.md
- **Active decisions** - Keep in DECISIONS.md

### Archive Format

**Organize by date:**

- `YYYY-MM/` for monthly archives
- Include original filename (lowercase-with-hyphens)
- Add header with archive metadata:

  ```markdown
  # [Original Title]

  > **Archived:** YYYY-MM-DD
  > **Reason:** [Why archived]
  > **Status:** [Complete/Superseded/Historical]
  ```

---

## Searching Archives

### By Topic

| Topic       | Files                                                            |
| ----------- | ---------------------------------------------------------------- |
| Refactoring | `2026-01/refactor-*.md`, `2026-01/components-migration-guide.md` |
| UI/UX       | `2026-01/ui-premium-improvements.md`                             |
| Referrals   | `progress/sessions-54-65.md`                                     |
| Skills      | `skills-migration-notes-20260202.md`                             |

### By Date

- **Jan 2026:** Implementation refactors, UI improvements
- **Feb 2026:** Business referral system (sessions 54-65)

---

## Related Documentation

- [../../PROGRESS.md](../../PROGRESS.md) - Current session state
- [../planning/](../planning/) - Active implementation plans
- [../reference/lessons-learned.md](../reference/lessons-learned.md) - Critical patterns (never archive)
