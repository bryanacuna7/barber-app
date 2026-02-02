---
description: Coordinate multiple agents for complex tasks. Use for multi-perspective analysis or tasks requiring different domain expertise.
---

# /orchestrate - Multi-Agent Coordination

$ARGUMENTS

---

## Purpose

Coordinate specialized agents for complex problems that require multiple perspectives.

---

## When to Use

- Task touches multiple domains (frontend + backend + tests)
- Need comprehensive review from different angles
- Building full features end-to-end
- Complex debugging requiring multiple specialists

---

## Available Agents

| Agent | Domain | Use For |
|-------|--------|---------|
| `fullstack-developer` | Code | Implementation |
| `test-engineer` | Testing | Tests and coverage |
| `debugger` | Debug | Error analysis |
| `code-reviewer` | Quality | Security and best practices |
| `performance-profiler` | Performance | Optimization |
| `architecture-modernizer` | Architecture | Design decisions |
| `documentation-expert` | Docs | Documentation |
| `ui-ux-designer` | Design | UI/UX improvements |

---

## Orchestration Protocol

### Step 1: Analyze Task Domains

Identify ALL domains this task touches:

```
□ Frontend/UI  → fullstack-developer, ui-ux-designer
□ Backend/API  → fullstack-developer
□ Database     → fullstack-developer
□ Testing      → test-engineer
□ Debug        → debugger
□ Performance  → performance-profiler
□ Security     → code-reviewer
□ Architecture → architecture-modernizer
□ Documentation → documentation-expert
```

### Step 2: Plan Agent Sequence

**For Features:**
1. `fullstack-developer` → Core implementation
2. `test-engineer` → Tests
3. `code-reviewer` → Quality check

**For Bug Fixes:**
1. `debugger` → Root cause
2. `fullstack-developer` → Fix
3. `test-engineer` → Regression tests

**For Performance:**
1. `performance-profiler` → Analysis
2. `fullstack-developer` → Optimization
3. `test-engineer` → Verify improvement

### Step 3: Execute and Synthesize

Run each agent and combine insights.

---

## Output Format

```markdown
## 🎼 Orchestration Report

### Task
[Original task summary]

### Agents Invoked
| # | Agent | Focus Area | Status |
|---|-------|------------|--------|
| 1 | fullstack-developer | Implementation | ✅ |
| 2 | test-engineer | Tests | ✅ |
| 3 | code-reviewer | Quality | ✅ |

### Key Findings

**fullstack-developer:**
- [Finding 1]

**test-engineer:**
- [Finding 2]

**code-reviewer:**
- [Finding 3]

### Deliverables
- [ ] Code implemented
- [ ] Tests passing
- [ ] Quality verified

### Summary
[One paragraph synthesis]
```

---

## Examples

```
/orchestrate add user authentication with tests
/orchestrate review and optimize the checkout flow
/orchestrate debug and fix the payment integration
/orchestrate build dashboard with analytics
```
