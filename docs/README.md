# Documentation

All project documentation organized by purpose.

---

## 📂 Directory Structure

```
docs/
├── planning/         # Implementation plans and roadmaps
├── reference/        # Technical guides and knowledge base
├── specs/            # Feature specifications
└── archive/          # Historical documentation
```

---

## 🚀 Quick Start

### For New Developers

1. **Start here:** [../README.md](../README.md) - Project overview
2. **Read governance:** [../GUARDRAILS.md](../GUARDRAILS.md) - Non-negotiable rules
3. **Database work?** [../DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md) - **MUST READ** before DB changes
4. **Bug prevention:** [reference/lessons-learned.md](reference/lessons-learned.md) - Critical patterns
5. **Current state:** [../PROGRESS.md](../PROGRESS.md) - Session status

### For AI Agents

1. **Start here:** [../CLAUDE.md](../CLAUDE.md) - Agent instructions
2. **Database protocol:** [../DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md) - Mandatory verification
3. **Lessons learned:** [reference/lessons-learned.md](reference/lessons-learned.md) - Prevent repeated bugs
4. **Current context:** [../PROGRESS.md](../PROGRESS.md) - Session continuity

---

## 📋 Planning

Active implementation plans and roadmaps.

**→ [planning/README.md](planning/README.md)** - Full index

### Active Plans

- **[Implementation Plan v2.5](planning/implementation-v2.5.md)** - Major app transformation (154-200h)
  - Status: Área 0 Task 4 (80% complete)
  - Next: Área 1 - Client Subscription

---

## 📚 Reference

Technical guides, best practices, and knowledge base.

**→ [reference/README.md](reference/README.md)** - Full index

### Critical Reading

- **[Lessons Learned](reference/lessons-learned.md)** 🔥 - 11 critical patterns from real bugs
  - RLS + Triggers need `SECURITY DEFINER`
  - DATABASE_SCHEMA.md is source of truth
  - Server Components: Use Supabase, not fetch
  - Regenerate types after migrations
  - Check for duplicate Next.js processes

### Technical Guides

- [Testing](reference/testing.md) - Test strategies, coverage, E2E
- [Accessibility](reference/accessibility.md) - WCAG AA compliance
- [Performance Baseline](reference/performance-baseline.md) - Metrics and targets
- [Security Headers](reference/security-headers.md) - CSP, CORS configuration
- [Design Tokens](reference/design-tokens.md) - Design system reference

---

## 📐 Specifications

Feature specifications for implemented and planned features.

**→ [specs/README.md](specs/README.md)** - Full index

### Implemented

- **[Business Referral System](specs/referral-system.md)** - B2B referral program (6 phases complete)

### Planned

See [planning/implementation-v2.5.md](planning/implementation-v2.5.md) for upcoming features.

---

## 📦 Archive

Historical documentation and completed implementations.

**→ [archive/README.md](archive/README.md)** - Full index

### Progress Archives

- **[Sessions 54-65: Referral System](archive/progress/sessions-54-65.md)** - 12 sessions, ~3,500 lines code

### 2026-01 Archives

- Component refactoring guides
- UI improvement implementations
- Phase 1 completion notes

---

## 🗂️ File Organization

### Where to Put Documentation

| Type                    | Location            | Example                         |
| ----------------------- | ------------------- | ------------------------------- |
| **Governance**          | Root (UPPERCASE.md) | CLAUDE.md, GUARDRAILS.md        |
| **Critical Reference**  | Root                | DATABASE_SCHEMA.md, PROGRESS.md |
| **Implementation Plan** | docs/planning/      | implementation-v2.5.md          |
| **Feature Spec**        | docs/specs/         | referral-system.md              |
| **Technical Guide**     | docs/reference/     | lessons-learned.md, testing.md  |
| **Historical**          | docs/archive/       | sessions-54-65.md               |

### Naming Conventions

- **Root governance:** UPPERCASE.md (e.g., CLAUDE.md)
- **Technical docs:** lowercase-with-hyphens.md (e.g., lessons-learned.md)
- **Index files:** README.md in each directory

---

## 📖 Root Documentation

Project governance and critical references (stay in root):

| File                                        | Purpose                           |
| ------------------------------------------- | --------------------------------- |
| [README.md](../README.md)                   | Project overview and setup        |
| [CLAUDE.md](../CLAUDE.md)                   | AI agent instructions             |
| [DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md) | Database schema (source of truth) |
| [DECISIONS.md](../DECISIONS.md)             | Architectural decision records    |
| [GUARDRAILS.md](../GUARDRAILS.md)           | Non-negotiable rules              |
| [PROGRESS.md](../PROGRESS.md)               | Session history and current state |
| [CONTRIBUTING.md](../CONTRIBUTING.md)       | Contribution guidelines           |
| [CHANGELOG.md](../CHANGELOG.md)             | Release history                   |

---

## ✍️ Creating New Documentation

### Implementation Plan

1. Save as `docs/planning/[feature-name]-plan.md`
2. Update [planning/README.md](planning/README.md) index
3. Reference in [../PROGRESS.md](../PROGRESS.md)

### Feature Specification

1. Save as `docs/specs/[feature-name].md`
2. Update [specs/README.md](specs/README.md) index
3. Link from implementation plan

### Technical Guide

1. Save as `docs/reference/[topic-name].md`
2. Update [reference/README.md](reference/README.md) index
3. Use template from reference/README.md

### Archive Document

1. Move to `docs/archive/YYYY-MM/[filename].md`
2. Update [archive/README.md](archive/README.md) index
3. Add archive metadata header

---

## 🔍 Finding Documentation

### By Purpose

- **Starting project?** → README.md
- **Making DB changes?** → DATABASE_SCHEMA.md
- **Planning feature?** → docs/planning/
- **Writing code?** → docs/reference/lessons-learned.md
- **Understanding decisions?** → DECISIONS.md
- **Current progress?** → PROGRESS.md

### By Topic

| Topic           | File                                                                   |
| --------------- | ---------------------------------------------------------------------- |
| Bug Prevention  | [reference/lessons-learned.md](reference/lessons-learned.md)           |
| Database Schema | [../DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md)                         |
| Testing         | [reference/testing.md](reference/testing.md)                           |
| Accessibility   | [reference/accessibility.md](reference/accessibility.md)               |
| Performance     | [reference/performance-baseline.md](reference/performance-baseline.md) |
| Security        | [reference/security-headers.md](reference/security-headers.md)         |
| Roadmap         | [planning/implementation-v2.5.md](planning/implementation-v2.5.md)     |

---

**Last Updated:** 2026-02-03 (Session 70 - Documentation Reorganization)
