---
name: intelligent-routing
description: Automatic agent selection based on request analysis. Routes tasks to the best specialist without explicit user mentions.
version: 1.0.0
---

# Intelligent Agent Routing

**Purpose**: Analyze user requests automatically and route to the most appropriate agent(s).

## How It Works

```
User Request → Analyze Keywords + Context → Select Agent(s) → Inform User → Execute
```

## Agent Selection Matrix

| User Intent | Keywords | Selected Agent(s) |
|-------------|----------|-------------------|
| **UI/Frontend** | component, react, vue, css, layout, button | `fullstack-developer` |
| **Backend/API** | endpoint, api, server, database, route | `fullstack-developer` |
| **Bug Fix** | error, bug, not working, broken, crash | `debugger` |
| **Tests** | test, coverage, unit, e2e, jest | `test-engineer` |
| **Performance** | slow, optimize, performance, memory, speed | `performance-profiler` |
| **Security** | auth, login, jwt, password, vulnerability | `code-reviewer` |
| **Architecture** | refactor, migrate, modernize, architecture | `architecture-modernizer` |
| **Documentation** | docs, readme, api docs, comments | `documentation-expert` |
| **Design** | ui, ux, wireframe, mockup, accessibility | `ui-ux-designer` |
| **Strategy** | roadmap, feature, priority, mvp | `product-strategist` |
| **Complex Task** | Multiple domains detected | `context-manager` → orchestrate |

## Detection Rules

### Single-Domain Tasks (Auto-invoke One Agent)

| Domain | Patterns | Agent |
|--------|----------|-------|
| **Frontend** | react, vue, css, html, tailwind, component | `fullstack-developer` |
| **Backend** | api, express, node, endpoint, server | `fullstack-developer` |
| **Database** | prisma, sql, mongodb, schema, migration | `fullstack-developer` |
| **Testing** | test, jest, vitest, playwright, coverage | `test-engineer` |
| **Debug** | error, bug, crash, not working, 500, 404 | `debugger` |
| **Performance** | slow, lag, optimize, cache, memory leak | `performance-profiler` |
| **Security** | auth, jwt, password, xss, injection | `code-reviewer` |
| **Docs** | readme, documentation, jsdoc, comments | `documentation-expert` |

### Multi-Domain Tasks (Orchestration)

If request matches **2+ domains**, use `context-manager` to coordinate:

```
Example: "Create a secure login with dark mode UI"
→ Detected: Security + Frontend
→ Use: context-manager → coordinates fullstack-developer + code-reviewer
```

## Complexity Assessment

### SIMPLE (Direct Agent)
- Single file edit
- Clear, specific task
- One domain only
- Example: "Fix the login button style"

### MODERATE (2 Agents)
- 2-3 files affected
- Clear requirements
- 2 domains max
- Example: "Add API endpoint with validation"

### COMPLEX (Orchestration)
- Multiple files/domains
- Architectural decisions
- Unclear requirements
- Example: "Build a chat application"

## Response Format

When auto-selecting an agent:

```markdown
🤖 **Using `@fullstack-developer` for this task...**

[Proceed with specialized response]
```

For multi-agent tasks:

```markdown
🤖 **Coordinating `@fullstack-developer` + `@test-engineer`...**

[Orchestrated response]
```

## Override Capability

User can always explicitly mention an agent:

```
User: "Use @debugger to analyze this"
→ Override auto-selection
→ Use explicitly mentioned agent
```

## Integration with CLAUDE.md

Add to your project's CLAUDE.md:

```markdown
## Intelligent Routing

This project uses automatic agent routing:
- Requests are analyzed automatically
- Best agent is selected based on task type
- User is informed which agent is being used
- Override with explicit @agent-name mention
```
