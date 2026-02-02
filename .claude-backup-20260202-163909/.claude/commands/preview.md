---
description: Preview changes locally. Start dev server and verify changes work.
---

# /preview - Preview Changes

$ARGUMENTS

---

## Purpose

Start local development server and preview changes before committing.

---

## What It Does

1. **Detect Project Type**
   - Check for package.json, requirements.txt, etc.
   - Identify framework (Next.js, React, Vue, etc.)

2. **Start Dev Server**
   - Run appropriate dev command
   - Wait for server to be ready

3. **Open Preview**
   - Provide local URL
   - Optionally use Playwright to verify

4. **Health Check**
   - Verify server responds
   - Check for console errors

---

## Auto-Detection

| Framework | Files | Command |
|-----------|-------|---------|
| Next.js | next.config.* | `npm run dev` |
| React (Vite) | vite.config.* | `npm run dev` |
| React (CRA) | react-scripts | `npm start` |
| Vue | vue.config.* | `npm run dev` |
| Node/Express | server.js | `npm run dev` or `node server.js` |
| Python/Flask | app.py | `flask run` |
| Python/Django | manage.py | `python manage.py runserver` |

---

## Output Format

```markdown
## 👁️ Preview Started

### Server
- **Framework:** Next.js
- **Command:** `npm run dev`
- **URL:** http://localhost:3000

### Status
✅ Server started successfully
✅ No console errors
✅ Page loads correctly

### Quick Actions
- Open in browser: http://localhost:3000
- Stop server: Ctrl+C
- Check logs: See terminal output
```

---

## With Playwright Verification

If Playwright MCP is available:

```markdown
## 👁️ Preview with Verification

### Server
- **URL:** http://localhost:3000

### Automated Checks
✅ Homepage loads (200 OK)
✅ No JavaScript errors
✅ Key elements visible:
   - Header: ✅
   - Navigation: ✅
   - Main content: ✅

### Screenshot
[Screenshot captured]
```

---

## Examples

```
/preview
/preview http://localhost:3000
/preview --port 8080
```
