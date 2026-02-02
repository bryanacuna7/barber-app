---
description: Create implementation plan. Task breakdown and architecture planning.
---

# /plan - Create Implementation Plan

$ARGUMENTS

---

## Purpose

Create a detailed implementation plan before coding. Break down complex tasks into manageable steps.

---

## When to Use

- Starting a new feature
- Tackling complex changes
- Need to estimate effort
- Want to validate approach before coding

---

## Planning Protocol

### Step 1: Understand Requirements
- What is the goal?
- Who is the user?
- What are the constraints?

### Step 2: Research
- Check existing code
- Identify patterns to follow
- Find potential obstacles

### Step 3: Design
- Define architecture
- Plan data flow
- Identify components

### Step 4: Break Down
- Create task list
- Estimate complexity
- Identify dependencies

### Step 5: Validate
- Review with user
- Confirm approach
- Adjust as needed

---

## Output Format

```markdown
## 📋 Implementation Plan: [Feature]

### Overview
[Brief description of what we're building]

### Requirements
- [ ] [Requirement 1]
- [ ] [Requirement 2]
- [ ] [Requirement 3]

---

### Architecture

```
┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │
└─────────────┘     └─────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │   Database  │
                    └─────────────┘
```

### Components
| Component | Purpose | Complexity |
|-----------|---------|------------|
| [Name] | [Purpose] | Low/Med/High |

---

### Implementation Tasks

#### Phase 1: Foundation
- [ ] Task 1.1 - [Description]
- [ ] Task 1.2 - [Description]

#### Phase 2: Core Features
- [ ] Task 2.1 - [Description]
- [ ] Task 2.2 - [Description]

#### Phase 3: Polish
- [ ] Task 3.1 - [Description]
- [ ] Task 3.2 - [Description]

---

### Dependencies
- [Dependency 1] - Why needed
- [Dependency 2] - Why needed

### Risks
| Risk | Mitigation |
|------|------------|
| [Risk 1] | [How to handle] |

---

### Ready to Start?
[Confirmation or questions]
```

---

## Examples

```
/plan user authentication system
/plan e-commerce checkout flow
/plan dashboard with real-time updates
/plan API migration to v2
```
