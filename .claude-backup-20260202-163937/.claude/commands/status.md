---
description: Display project status. Git status, running processes, and health overview.
---

# /status - Show Project Status

$ARGUMENTS

---

## Purpose

Show current project and development status at a glance.

---

## What It Shows

1. **Project Info**
   - Project name and path
   - Tech stack detected
   - Package versions

2. **Git Status**
   - Current branch
   - Uncommitted changes
   - Recent commits

3. **Dev Server Status**
   - Is server running?
   - What port?
   - Health check

4. **Dependencies**
   - Outdated packages
   - Security vulnerabilities

---

## Output Format

```markdown
## 📊 Project Status

### Project
- **Name:** my-app
- **Path:** /Users/dev/my-app
- **Framework:** Next.js 14.0.0
- **Node:** v20.10.0

---

### Git
- **Branch:** feature/auth
- **Status:** 3 files modified, 1 untracked
- **Last Commit:** "feat: add login form" (2 hours ago)

---

### Dev Server
- **Status:** 🟢 Running
- **URL:** http://localhost:3000
- **PID:** 12345

---

### Dependencies
- **Total:** 45 packages
- **Outdated:** 3 packages
- **Vulnerabilities:** 0

---

### Quick Actions
- `npm run dev` - Start server
- `npm test` - Run tests
- `git status` - See changes
```

---

## Detailed Sections

### With `--git` flag

```markdown
### Git Details

**Modified Files:**
- src/components/Login.tsx
- src/api/auth.ts
- package.json

**Recent Commits:**
1. feat: add login form (2h ago)
2. fix: resolve build error (1d ago)
3. chore: update deps (2d ago)
```

### With `--deps` flag

```markdown
### Dependencies Details

**Outdated:**
| Package | Current | Latest |
|---------|---------|--------|
| react | 18.2.0 | 18.3.0 |
| next | 14.0.0 | 14.1.0 |

**Audit:**
✅ No vulnerabilities found
```

---

## Examples

```
/status
/status --git
/status --deps
/status --all
```
