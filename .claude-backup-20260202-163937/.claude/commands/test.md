---
description: Run tests and generate test reports. Coverage analysis and test recommendations.
---

# /test - Run Tests

$ARGUMENTS

---

## Purpose

Run tests, analyze coverage, and generate recommendations for test improvements.

---

## Sub-commands

```
/test              - Run all tests
/test unit         - Run unit tests only
/test e2e          - Run E2E tests only
/test coverage     - Run with coverage report
/test watch        - Run in watch mode
/test [file]       - Run specific test file
```

---

## What It Does

1. **Detect Test Framework**
   - Jest, Vitest, Mocha, pytest, etc.
   - Read configuration

2. **Run Tests**
   - Execute test command
   - Capture output

3. **Analyze Results**
   - Parse failures
   - Calculate coverage
   - Identify flaky tests

4. **Generate Report**
   - Summary of results
   - Coverage breakdown
   - Recommendations

---

## Output Format

### All Tests Pass

```markdown
## ✅ Test Results

### Summary
- **Total:** 45 tests
- **Passed:** 45
- **Failed:** 0
- **Duration:** 3.2s

### Coverage
| File | Statements | Branches | Functions |
|------|------------|----------|-----------|
| src/api/auth.ts | 95% | 90% | 100% |
| src/utils/token.ts | 88% | 75% | 100% |
| **Total** | **92%** | **85%** | **98%** |

### Status
🎉 All tests passing!
```

### Some Tests Fail

```markdown
## ❌ Test Results

### Summary
- **Total:** 45 tests
- **Passed:** 42
- **Failed:** 3
- **Duration:** 4.1s

### Failures

#### 1. `should authenticate user`
- **File:** src/api/__tests__/auth.test.ts:25
- **Error:** `Expected 200, received 401`
- **Likely Cause:** Token validation changed

#### 2. `should render dashboard`
- **File:** src/components/__tests__/Dashboard.test.tsx:15
- **Error:** `Element not found: .dashboard-header`
- **Likely Cause:** Component structure changed

### Recommendations
1. Update auth test to use new token format
2. Update Dashboard test selectors
```

---

## Coverage Analysis

```markdown
## 📊 Coverage Report

### Overall: 78%

### By Category
| Category | Coverage | Target | Status |
|----------|----------|--------|--------|
| Statements | 82% | 80% | ✅ |
| Branches | 71% | 75% | ❌ |
| Functions | 85% | 80% | ✅ |
| Lines | 80% | 80% | ✅ |

### Uncovered Files
| File | Coverage | Missing |
|------|----------|---------|
| src/api/payment.ts | 45% | Lines 23-45, 67-89 |
| src/utils/date.ts | 60% | Lines 12-18 |

### Recommendations
1. Add tests for payment error handling
2. Add edge case tests for date parsing
```

---

## Examples

```
/test
/test unit
/test coverage
/test src/api/__tests__/auth.test.ts
/test watch
```
