# 📚 Documentation Index

Complete guide to all project documentation.

---

## 📂 Documentation Organization

```
barber-app/
├── *.md                          # Root project docs
│   ├── CLAUDE.md                 # Claude Code instructions
│   ├── CONTRIBUTING.md           # Contribution guidelines
│   ├── DATABASE_SCHEMA.md        # DB schema (source of truth)
│   ├── DECISIONS.md              # Architectural decisions
│   ├── GUARDRAILS.md             # Non-negotiable behaviors
│   ├── PROGRESS.md               # Session continuity
│   └── README.md                 # Project overview
│
└── docs/
    ├── reference/                # Technical guides
    ├── planning/                 # Implementation plans
    ├── specs/                    # Feature specifications
    ├── security/                 # Security reports and summaries
    └── archive/                  # Historical documents
```

---

## 🎯 Quick Navigation

### 🚨 Start Here (Critical)

| Document                                                          | Purpose              | When to Read               |
| ----------------------------------------------------------------- | -------------------- | -------------------------- |
| [README.md](../README.md)                                         | Project overview     | First time setup           |
| [CLAUDE.md](../CLAUDE.md)                                         | Claude Code behavior | Before working with Claude |
| [DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md)                       | DB structure         | Before DB changes          |
| [GUARDRAILS.md](../GUARDRAILS.md)                                 | Non-negotiable rules | Before coding              |
| [docs/reference/lessons-learned.md](reference/lessons-learned.md) | Bug patterns         | Before implementing        |

---

## 📖 By Category

### Governance (Root Level)

| Document                                                        | Description                         |
| --------------------------------------------------------------- | ----------------------------------- |
| [CHANGELOG.md](../CHANGELOG.md)                                 | Version history and changes         |
| [CLAUDE.md](../CLAUDE.md)                                       | Claude Code configuration and rules |
| [CONTRIBUTING.md](../CONTRIBUTING.md)                           | How to contribute to the project    |
| [DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md)                     | Database schema (source of truth)   |
| [DECISIONS.md](../DECISIONS.md)                                 | Architectural decision records      |
| [GUARDRAILS.md](../GUARDRAILS.md)                               | Non-negotiable behaviors            |
| [PROGRESS.md](../PROGRESS.md)                                   | Current project state               |
| [README.md](../README.md)                                       | Project overview and setup          |
| [SECURITY_AUDIT_SUMMARY.md](security/SECURITY_AUDIT_SUMMARY.md) | Security status                     |

---

### Testing & QA

| Document                                                         | Description                          |
| ---------------------------------------------------------------- | ------------------------------------ |
| [TESTING.md](reference/TESTING.md)                               | Testing strategies and tools         |
| [TRACE_QUICK_START.md](reference/TRACE_QUICK_START.md)           | Playwright Trace Viewer (3 steps)    |
| [PLAYWRIGHT_TRACE_GUIDE.md](reference/PLAYWRIGHT_TRACE_GUIDE.md) | Complete trace viewer guide          |
| [UI_EXPLORATION_GUIDE.md](reference/UI_EXPLORATION_GUIDE.md)     | Manual testing & competitor analysis |
| [playwright-profiles.md](reference/playwright-profiles.md)       | Trace recording configurations       |
| [TESTING_CHECKLIST.md](reference/TESTING_CHECKLIST.md)           | Pre-deployment testing               |

---

### Security

| Document                                                                   | Description             |
| -------------------------------------------------------------------------- | ----------------------- |
| [SECURITY_AUDIT_SUMMARY.md](security/SECURITY_AUDIT_SUMMARY.md)            | Overall security status |
| [SECURITY_HEADERS.md](reference/SECURITY_HEADERS.md)                       | CSP, CORS configuration |
| [SECURITY_THREAT_MODEL_V2.5.md](reference/SECURITY_THREAT_MODEL_V2.5.md)   | Threat analysis         |
| [SECURITY_FIXES_STATUS.md](reference/SECURITY_FIXES_STATUS.md)             | Applied fixes           |
| [SECURITY_CHECKLIST_FASE_2.md](reference/SECURITY_CHECKLIST_FASE_2.md)     | Phase 2 security tasks  |
| [MANUAL_STEPS_SECURITY_FIXES.md](reference/MANUAL_STEPS_SECURITY_FIXES.md) | Manual security steps   |

---

### Performance

| Document                                                         | Description            |
| ---------------------------------------------------------------- | ---------------------- |
| [PERFORMANCE_BASELINE.md](reference/PERFORMANCE_BASELINE.md)     | Performance targets    |
| [PERFORMANCE_AUDIT_V2.5.md](reference/PERFORMANCE_AUDIT_V2.5.md) | Performance analysis   |
| [PERFORMANCE_CHECKLIST.md](reference/PERFORMANCE_CHECKLIST.md)   | Optimization checklist |

---

### Design & UX

| Document                                                             | Description                 |
| -------------------------------------------------------------------- | --------------------------- |
| [ACCESSIBILITY.md](reference/ACCESSIBILITY.md)                       | WCAG compliance guide       |
| [ACCESSIBILITY_AUDIT.md](reference/ACCESSIBILITY_AUDIT.md)           | Accessibility audit results |
| [DESIGN_TOKENS.md](reference/DESIGN_TOKENS.md)                       | Design system tokens        |
| [DESIGN_AUDIT_DIETER_RAMS.md](reference/DESIGN_AUDIT_DIETER_RAMS.md) | Design principles audit     |
| [DESIGN_AUDIT_SUMMARY.md](reference/DESIGN_AUDIT_SUMMARY.md)         | Design audit summary        |
| [UI_BEFORE_AFTER_MOCKUPS.md](reference/UI_BEFORE_AFTER_MOCKUPS.md)   | UI redesign mockups         |
| [UX_REFINEMENT_CHECKLIST.md](reference/UX_REFINEMENT_CHECKLIST.md)   | UX improvement tasks        |

---

### Architecture & Planning

| Document                                                           | Description              |
| ------------------------------------------------------------------ | ------------------------ |
| [DECISIONS.md](../DECISIONS.md)                                    | Architectural decisions  |
| [ARCHITECTURE_AUDIT_V2.5.md](reference/ARCHITECTURE_AUDIT_V2.5.md) | Architecture review      |
| [implementation-v2.5.md](planning/implementation-v2.5.md)          | v2.5 implementation plan |

---

### Feature Documentation

| Document                                                                       | Description             |
| ------------------------------------------------------------------------------ | ----------------------- |
| [FEATURES_PLAYBOOK.md](FEATURES_PLAYBOOK.md)                                   | Comercial por perfil    |
| [MI_DIA_SUMMARY.md](reference/MI_DIA_SUMMARY.md)                               | Mi Día feature overview |
| [ORCHESTRATION_REPORT_AREA_6.md](reference/ORCHESTRATION_REPORT_AREA_6.md)     | Área 6 implementation   |
| [RATE_LIMITING_FLOW.md](reference/RATE_LIMITING_FLOW.md)                       | Rate limiting system    |
| [RATE_LIMITING_SUMMARY.md](reference/RATE_LIMITING_SUMMARY.md)                 | Rate limiting overview  |
| [RATE_LIMITING_QUICK_REFERENCE.md](reference/RATE_LIMITING_QUICK_REFERENCE.md) | Rate limiting quick ref |

---

### Development Tools

| Document                                             | Description           |
| ---------------------------------------------------- | --------------------- |
| [GITHUB_ACTIONS.md](reference/GITHUB_ACTIONS.md)     | CI/CD workflows       |
| [SKILLS_INSTALLED.md](reference/SKILLS_INSTALLED.md) | Claude Code skills    |
| [lessons-learned.md](reference/lessons-learned.md)   | Critical bug patterns |

---

## 🔍 Finding Documentation

### By Task

| I want to...               | Read this                                                       |
| -------------------------- | --------------------------------------------------------------- |
| Set up the project         | [README.md](../README.md)                                       |
| Understand Claude behavior | [CLAUDE.md](../CLAUDE.md)                                       |
| Modify database            | [DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md)                     |
| Avoid common bugs          | [lessons-learned.md](reference/lessons-learned.md)              |
| Write tests                | [TESTING.md](reference/TESTING.md)                              |
| Debug with trace viewer    | [TRACE_QUICK_START.md](reference/TRACE_QUICK_START.md)          |
| Analyze competitor         | [UI_EXPLORATION_GUIDE.md](reference/UI_EXPLORATION_GUIDE.md)    |
| Improve performance        | [PERFORMANCE_BASELINE.md](reference/PERFORMANCE_BASELINE.md)    |
| Fix security issue         | [SECURITY_AUDIT_SUMMARY.md](security/SECURITY_AUDIT_SUMMARY.md) |
| Make design changes        | [DESIGN_TOKENS.md](reference/DESIGN_TOKENS.md)                  |
| Understand decisions       | [DECISIONS.md](../DECISIONS.md)                                 |

---

## 📝 Documentation Guidelines

### File Location Rules

| Type             | Location            | Example                          |
| ---------------- | ------------------- | -------------------------------- |
| Governance       | Root (UPPERCASE.md) | `CLAUDE.md`, `README.md`         |
| Technical guides | `docs/reference/`   | `TESTING.md`, `ACCESSIBILITY.md` |
| Specifications   | `docs/specs/`       | Feature specs                    |
| Planning         | `docs/planning/`    | Implementation plans             |
| Archive          | `docs/archive/`     | Historical docs                  |

### Naming Conventions

- **Governance:** UPPERCASE.md (e.g., `CLAUDE.md`)
- **Technical:** UPPERCASE.md or lowercase-with-hyphens.md
- **Be descriptive:** `PLAYWRIGHT_TRACE_GUIDE.md` not `GUIDE.md`

### When Creating New Docs

1. ✅ Choose correct location (governance vs technical)
2. ✅ Use appropriate naming convention
3. ✅ Update this index
4. ✅ Add to [docs/reference/README.md](reference/README.md) if technical
5. ✅ Link from related documents

---

## 🔄 Documentation Maintenance

### Regular Updates

- [x] **Weekly:** Update PROGRESS.md
- [x] **After features:** Update implementation plans
- [x] **After user-facing features:** Update `src/content/feature-catalog.json` and run `npm run docs:features`
- [x] **After bugs:** Update lessons-learned.md
- [x] **After DB changes:** Update DATABASE_SCHEMA.md
- [x] **After decisions:** Update DECISIONS.md

### Cleanup

**When to archive:**

- Document is outdated
- Feature has been completed
- Historical reference only

**How to archive:**

```bash
mv docs/reference/OLD_DOC.md docs/archive/
```

---

## 🤝 Contributing to Docs

See [CONTRIBUTING.md](../CONTRIBUTING.md) for:

- Documentation standards
- Review process
- Style guide

---

**Last Updated:** 2026-02-24

**Maintainer:** @documentation-expert
