# Documentation Structure

This directory contains all project documentation organized by category.

## Directory Structure

```
docs/
├── reference/       # Technical reference documentation
├── archive/         # Completed implementation docs (historical)
└── specs/          # Feature specifications and proposals
```

## Reference Documentation

Technical documentation for developers:

- **ACCESSIBILITY.md** - WCAG AA compliance guidelines and patterns
- **ACCESSIBILITY_AUDIT.md** - Accessibility audit results and fixes
- **DESIGN_TOKENS.md** - Design system tokens and usage
- **PERFORMANCE_BASELINE.md** - Performance metrics and optimization
- **SECURITY_HEADERS.md** - Security headers configuration
- **TESTING.md** - Testing strategy and guidelines

## Archive

Historical implementation documentation:

- **PHASE1_IMPLEMENTATION.md** - Phase 1 implementation notes
- **REFACTORING_COMPLETE.md** - Refactoring completion report
- **DROPDOWN_REFACTOR_ANALYSIS.md** - Dropdown component analysis
- **REFACTOR_CANDIDATES.md** - Files identified for refactoring
- **COMPONENTS_MIGRATION_GUIDE.md** - Component migration guide
- **UI_PREMIUM_IMPROVEMENTS.md** - UI improvement implementation

## Root Documentation

Project governance docs remain in root:

- **CLAUDE.md** - Claude Code instructions and workflows
- **GUARDRAILS.md** - Non-negotiable development rules
- **DECISIONS.md** - Architectural decision records (ADR)
- **PROGRESS.md** - Current project progress and session history
- **README.md** - Project overview and setup
- **SKILLS_INSTALLED.md** - Installed Claude skills registry

## Usage

- **New features?** → Create spec in `docs/specs/`
- **Technical docs?** → Add to `docs/reference/`
- **Completed work?** → Archive in `docs/archive/`
- **Governance?** → Keep in project root (UPPERCASE.md)
