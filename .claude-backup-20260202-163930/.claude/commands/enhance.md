---
description: Improve existing code. Refactoring, optimization, and quality improvements.
---

# /enhance - Improve Existing Code

$ARGUMENTS

---

## Purpose

Systematically improve existing code quality, performance, or maintainability.

---

## Enhancement Categories

### 1. Code Quality
- Clean up code style
- Improve naming
- Reduce complexity
- Add error handling

### 2. Performance
- Optimize algorithms
- Reduce bundle size
- Improve load time
- Cache effectively

### 3. Maintainability
- Add documentation
- Improve structure
- Reduce duplication
- Better abstractions

### 4. Security
- Fix vulnerabilities
- Improve validation
- Secure endpoints
- Update dependencies

---

## Enhancement Protocol

1. **Analyze Current State**
   - Read the code
   - Identify issues
   - Prioritize by impact

2. **Plan Improvements**
   - List specific changes
   - Estimate effort
   - Check for risks

3. **Implement**
   - Make changes incrementally
   - Preserve behavior
   - Document changes

4. **Verify**
   - Run tests
   - Check no regressions
   - Measure improvement

---

## Output Format

```markdown
## ✨ Enhancement Report: [Target]

### Current State
- **File(s):** [affected files]
- **Issues Found:** [count]

---

### Improvements Made

#### Code Quality
| Issue | Fix | Impact |
|-------|-----|--------|
| Inconsistent naming | Renamed variables | Medium |
| Missing error handling | Added try/catch | High |

#### Performance
| Issue | Fix | Improvement |
|-------|-----|-------------|
| N+1 query | Batch fetch | -50ms |

---

### Before/After

**Before:**
```javascript
// Old code
```

**After:**
```javascript
// New improved code
```

---

### Verification
- [x] All tests pass
- [x] No behavior changes
- [x] Performance improved
```

---

## Examples

```
/enhance src/components/Dashboard.tsx
/enhance the API response handling
/enhance performance of the search function
/enhance security of authentication flow
```
