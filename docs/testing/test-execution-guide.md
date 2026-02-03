# Mi Día Testing - Execution Guide

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test suites
npm run test:security        # Security tests (CRITICAL)
npm run test:unit            # Unit tests
npm run test:integration     # Integration tests
npm run test:e2e             # E2E tests with Playwright

# Run with coverage
npm run test:coverage

# Watch mode (for development)
npm run test:watch

# Update snapshots
npm run test:update-snapshots
```

---

## Test Environment Setup

### 1. Prerequisites

- Node.js 18+
- npm or yarn
- Docker (for integration tests with database)
- Playwright browsers installed

```bash
# Install Playwright browsers
npx playwright install
```

### 2. Environment Variables

Create `.env.test`:

```env
# Supabase Test Database
NEXT_PUBLIC_SUPABASE_URL=https://your-test-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-test-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-test-service-role-key

# Test Auth
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=test-password
TEST_BARBER_ID=test-barber-123
TEST_BUSINESS_ID=test-business-123

# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Test Database Setup

```bash
# Start test database with Docker
docker-compose -f docker-compose.test.yml up -d

# Run migrations
npm run supabase:migrate:test

# Seed test data
npm run supabase:seed:test
```

---

## Test Execution by Priority

### Phase 1: Security Tests (P0 - BLOCKING)

**Must pass before any deployment**

```bash
# Run all security tests
npm run test:security

# Or run specific security test files
npx vitest run src/app/api/barbers/[id]/appointments/today/__tests__/route.security.test.ts
npx vitest run src/app/api/appointments/[id]/check-in/__tests__/route.security.test.ts
npx vitest run src/app/api/appointments/[id]/complete/__tests__/route.security.test.ts
npx vitest run src/app/api/appointments/[id]/no-show/__tests__/route.security.test.ts
```

**Expected Results:**

- All IDOR tests pass ✅
- Business isolation verified ✅
- No data leaks ✅
- Authentication enforced ✅

**If ANY security test fails:**

1. ❌ STOP - Do not proceed
2. Fix the vulnerability immediately
3. Re-run all security tests
4. Document the fix in docs/security/

### Phase 2: Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run with coverage report
npm run test:unit:coverage

# Run specific hook tests
npx vitest run src/hooks/__tests__/use-barber-appointments.test.ts
npx vitest run src/hooks/__tests__/use-appointment-actions.test.ts

# Run API route tests
npx vitest run "src/app/api/**/__tests__/*.test.ts"

# Run component tests
npx vitest run "src/components/**/__tests__/*.test.tsx"
npx vitest run "src/app/**/__tests__/*.test.tsx"
```

**Coverage Requirements:**

- Overall: ≥80%
- Hooks: ≥90%
- API Routes: ≥95%
- Components: ≥85%

**If coverage is below target:**

```bash
# Generate detailed coverage report
npm run test:unit:coverage

# Open HTML report
open coverage/index.html

# Identify uncovered lines and add tests
```

### Phase 3: Integration Tests

```bash
# Ensure test database is running
docker-compose -f docker-compose.test.yml ps

# Run integration tests
npm run test:integration

# Run with verbose output
npm run test:integration -- --reporter=verbose
```

**Common Issues:**

- Database connection refused → Check Docker is running
- Migration errors → Run `npm run supabase:migrate:test`
- Seed data missing → Run `npm run supabase:seed:test`
- Port conflicts → Kill process on port 5433

### Phase 4: E2E Tests

```bash
# Run E2E tests in headless mode
npm run test:e2e

# Run with UI (for debugging)
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/e2e/mi-dia.spec.ts

# Run specific test
npx playwright test tests/e2e/mi-dia.spec.ts -g "should check-in appointment"

# Run on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Generate report
npm run test:e2e:report
```

**Before running E2E tests:**

1. Ensure dev server is running on port 3000
2. Ensure test database has seed data
3. Clear browser cache if needed

**If E2E tests fail:**

1. Check screenshots in `test-results/`
2. View trace in Playwright UI: `npx playwright show-trace trace.zip`
3. Run with `--headed` to see browser: `npx playwright test --headed`

### Phase 5: Performance Tests

```bash
# Run Lighthouse audit
npm run test:performance

# Or manually:
npx lighthouse http://localhost:3000/mi-dia \
  --only-categories=performance \
  --output=html \
  --output-path=./performance-report.html

# Profile with Chrome DevTools
# 1. Open Chrome DevTools
# 2. Go to Performance tab
# 3. Record page load and interactions
# 4. Analyze for bottlenecks
```

**Performance Benchmarks:**

- FCP (First Contentful Paint): <1.5s on mobile
- LCP (Largest Contentful Paint): <2.5s on mobile
- TTI (Time to Interactive): <3.0s on mobile
- No layout shifts (CLS = 0)
- No memory leaks during auto-refresh

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/mi-dia-tests.yml
name: Mi Día Tests

on:
  push:
    branches: [main, develop, feature/mi-dia-*]
  pull_request:
    branches: [main]

jobs:
  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm run test:security
      # Fail the build if security tests don't pass
      - name: Check security test results
        run: |
          if [ $? -ne 0 ]; then
            echo "❌ SECURITY TESTS FAILED - BLOCKING DEPLOYMENT"
            exit 1
          fi

  unit-tests:
    runs-on: ubuntu-latest
    needs: security-tests
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm run test:unit:coverage
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Pre-commit Hook

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🧪 Running tests on changed files..."

# Get changed files
CHANGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$')

if [ -n "$CHANGED_FILES" ]; then
  # Run tests for changed files
  echo "$CHANGED_FILES" | xargs npx vitest related --run

  if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Commit aborted."
    exit 1
  fi
fi

echo "✅ Tests passed"
```

### Pre-push Hook

```bash
# .husky/pre-push
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔒 Running security tests before push..."

npm run test:security

if [ $? -ne 0 ]; then
  echo "❌ SECURITY TESTS FAILED - Push aborted"
  echo "Fix security issues before pushing"
  exit 1
fi

echo "✅ Security tests passed"
```

---

## Debugging Failed Tests

### Debug Unit Tests

```bash
# Run single test with debug output
npx vitest run path/to/test.test.ts --reporter=verbose

# Run with Node debugger
node --inspect-brk ./node_modules/.bin/vitest run path/to/test.test.ts

# In Chrome:
# Open chrome://inspect
# Click "inspect" on the Node process
```

### Debug E2E Tests

```bash
# Run with headed browser
npx playwright test --headed

# Debug mode (pause on failure)
npx playwright test --debug

# View trace
npx playwright show-trace trace.zip

# Generate trace on failure
npx playwright test --trace on-first-retry
```

### Common Test Failures

#### "Cannot find module"

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
```

#### "Database connection refused"

```bash
# Check Docker
docker-compose -f docker-compose.test.yml ps
docker-compose -f docker-compose.test.yml restart
```

#### "Port 3000 already in use"

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

#### "Test timeout"

```bash
# Increase timeout in vitest.config.ts
export default defineConfig({
  test: {
    testTimeout: 30000 // 30 seconds
  }
})
```

---

## Test Maintenance

### Weekly Tasks

1. Review flaky tests
2. Update snapshots if UI changed intentionally
3. Check test coverage trends
4. Remove obsolete tests

### Monthly Tasks

1. Update test dependencies
2. Review and refactor test code
3. Optimize slow tests
4. Document new test patterns

### After Each Feature Update

1. Add tests for new functionality
2. Update existing tests if behavior changed
3. Ensure coverage targets maintained
4. Update test documentation

---

## Test Data Management

### Creating Test Fixtures

```typescript
// src/test/fixtures/appointments.ts
export const testAppointments = {
  pending: createMockAppointment({ status: 'pending' }),
  confirmed: createMockAppointment({ status: 'confirmed' }),
  completed: createMockAppointment({ status: 'completed' }),
}
```

### Cleaning Test Database

```bash
# Reset test database
npm run supabase:db:reset:test

# Clear specific tables
psql -h localhost -p 5433 -U postgres -d test_db -c "TRUNCATE appointments CASCADE"
```

---

## Performance Benchmarking

### Baseline Metrics (Target)

- Unit tests: <5s for entire suite
- Integration tests: <30s for entire suite
- E2E tests: <2min for entire suite
- Test coverage generation: <10s

### Monitoring Test Performance

```bash
# Profile test execution time
npx vitest run --reporter=verbose

# Identify slow tests (>1s)
npx vitest run --reporter=verbose | grep "slow"

# Optimize slow tests by:
# 1. Mocking expensive operations
# 2. Reducing test data size
# 3. Parallelizing independent tests
# 4. Using test.concurrent() for independent tests
```

---

## Reporting

### Generate Test Report

```bash
# HTML report
npm run test:report

# JSON report (for CI/CD)
npm run test:report:json

# Coverage report
npm run test:coverage
open coverage/index.html
```

### Share Results

- Upload coverage to Codecov
- Post report to PR comments
- Send Slack notification on failures
- Track metrics in dashboard

---

## Production Deployment Checklist

Before deploying Mi Día to production:

- [ ] ✅ All security tests pass (CRITICAL)
- [ ] ✅ Unit test coverage ≥80%
- [ ] ✅ All integration tests pass
- [ ] ✅ All E2E tests pass on all browsers
- [ ] ✅ Performance benchmarks met (<1s load time)
- [ ] ✅ No console errors in browser
- [ ] ✅ Mobile testing completed
- [ ] ✅ Manual QA sign-off
- [ ] ✅ Stakeholder approval
- [ ] ✅ Rollback plan documented

**Only proceed if ALL items are checked.**

---

## Support

For test-related questions:

- Check docs/testing/mi-dia-testing-strategy.md
- Review test examples in src/test/
- Contact test engineering team

**Remember: Security tests are non-negotiable. If they fail, deployment is blocked.**
