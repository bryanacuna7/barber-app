---
description: Create new application or feature. Triggers planning and interactive dialogue.
---

# /create - Create Application or Feature

$ARGUMENTS

---

## Task

Start a new application or feature creation process.

### Steps:

1. **Request Analysis**
   - Understand what the user wants
   - If information is missing, ask clarifying questions

2. **Project Planning**
   - Determine tech stack
   - Plan file structure
   - Create implementation plan

3. **Application Building**
   - Coordinate agents as needed:
     - `fullstack-developer` → Core implementation
     - `test-engineer` → Tests
     - `code-reviewer` → Quality check

4. **Verification**
   - Run tests
   - Check build passes
   - Present result to user

---

## Usage Examples

```
/create blog site
/create e-commerce app with product listing and cart
/create todo app with authentication
/create dashboard with charts
/create landing page with hero section
```

---

## Before Starting

If request is unclear, ask these questions:
- What type of application/feature?
- What are the basic features?
- Who will use it?
- Any tech stack preferences?

Use sensible defaults, add details later.

---

## Output Format

```markdown
## 🚀 Creating: [Name]

### Understanding
[What I understood from the request]

### Tech Stack
- Framework: [choice]
- Database: [choice]
- Styling: [choice]

### Implementation Plan
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Ready to Start?
[Confirmation or questions]
```
