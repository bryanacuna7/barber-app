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

| Area     | Correct Behavior    |
| -------- | ------------------- |
| [AREA 1] | [EXPECTED BEHAVIOR] |
| [AREA 2] | [EXPECTED BEHAVIOR] |

## 3. High-Risk Zones

Changes here require full audit:

| Zone   | Files   | Why      |
| ------ | ------- | -------- |
| [ZONE] | [FILES] | [REASON] |

## 4. Design Constraints

### Do NOT:

- [ ] Change X without updating Y
- [ ] Remove Z - it's load-bearing
- [ ] Use deprecated pattern A

### Always:

- [ ] Validate inputs at boundaries
- [ ] Handle error states explicitly
- [ ] Test on target platform

## 5. Known Bugs (Never Repeat)

| Bug ID | Description   | Fix         | Date   |
| ------ | ------------- | ----------- | ------ |
| #001   | [DESCRIPTION] | [HOW FIXED] | [DATE] |

---

**Canonical cross-links:**

- CLAUDE.md (project instructions)
- DECISIONS.md (design rationale)
