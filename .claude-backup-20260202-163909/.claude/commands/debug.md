---
description: Systematic debugging workflow. Root cause analysis and fix verification.
---

# /debug - Systematic Debugging

$ARGUMENTS

---

## Purpose

Apply systematic debugging methodology to identify root cause and verify fixes.

---

## Debugging Protocol

### Step 1: Reproduce
- Understand the error
- Get exact steps to reproduce
- Identify error messages/logs

### Step 2: Isolate
- Narrow down the scope
- Identify affected files
- Check recent changes

### Step 3: Analyze
- Read error messages carefully
- Check stack traces
- Review related code

### Step 4: Hypothesize
- Form theories about root cause
- Rank by likelihood
- Plan verification approach

### Step 5: Test
- Verify hypothesis
- Add logging if needed
- Test fix thoroughly

### Step 6: Fix
- Implement minimal fix
- Avoid side effects
- Document the issue

### Step 7: Verify
- Confirm fix works
- Check for regressions
- Add test to prevent recurrence

---

## Output Format

```markdown
## 🔍 Debug Report: [Issue]

### Error Summary
- **Type:** [Runtime/Build/Type/etc.]
- **Message:** `[error message]`
- **Location:** [file:line]

---

### Reproduction Steps
1. [Step 1]
2. [Step 2]
3. [Error occurs]

---

### Root Cause Analysis

**Hypothesis 1:** [Most likely cause]
- Evidence: [supporting evidence]
- Confidence: High/Medium/Low

**Hypothesis 2:** [Alternative cause]
- Evidence: [supporting evidence]
- Confidence: High/Medium/Low

---

### Investigation

**Files Examined:**
- `src/api/auth.ts` - ✅ Checked
- `src/utils/token.ts` - 🔴 Issue found

**Findings:**
[Detailed explanation of what was found]

---

### Solution

**Root Cause:** [Confirmed root cause]

**Fix:**
```diff
- const token = getToken()
+ const token = getToken() ?? ''
```

**Files Changed:**
- `src/utils/token.ts`

---

### Verification

- [ ] Error no longer occurs
- [ ] Existing tests pass
- [ ] New test added for this case
- [ ] No regressions introduced
```

---

## Examples

```
/debug login returns 401 error
/debug build failing with type error
/debug page not loading after deploy
/debug memory leak in dashboard
```

---

## Key Principles

- **Minimal changes** - Fix only what's broken
- **Evidence-based** - Don't guess, verify
- **Document** - Leave trail for future reference
- **Test** - Add regression test
