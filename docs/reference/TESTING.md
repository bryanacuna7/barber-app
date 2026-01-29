# Testing Guide

This project uses a comprehensive testing strategy with both E2E and unit tests.

## Test Stack

- **E2E Tests:** Playwright
- **Unit Tests:** Vitest + Testing Library
- **Coverage:** V8

## Running Tests

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm run test:unit

# Run in watch mode (interactive)
npm run test:unit:watch

# Run with coverage report
npm run test:unit:coverage
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# View last test report
npm run test:e2e:report
```

### Run All Tests

```bash
# Unit tests
npm run test:unit

# E2E tests (requires dev server running)
npm run test:e2e
```

## Test Structure

### Unit Tests

Location: `src/__tests__/`

```
src/
  __tests__/
    utils/
      format.test.ts          # Format utilities (currency, dates, phone)
```

**Current Coverage:**

- ✅ formatDate, formatTime, formatDateTime
- ✅ formatCurrency, formatCurrencyCompact
- ✅ formatPhone

### E2E Tests

Location: `e2e/`

```
e2e/
  auth.spec.ts                # Authentication flow tests
  clients.spec.ts             # Client management CRUD tests
  appointments.spec.ts        # Appointment booking tests
```

**Test Scenarios:**

**Auth Flow:**

- Login page display
- Invalid credentials error
- Successful login and redirect
- Protected route access
- Logout functionality

**Client Management:**

- List clients
- Create new client
- Search clients
- Pagination (Load More)
- Empty search results

**Appointments:**

- Public booking flow (service → barber → date → time → confirm)
- Dashboard appointments list
- Filter by status
- Create appointment from dashboard

## Environment Setup

### E2E Tests

Create `.env.test` for test credentials:

```bash
cp .env.test.example .env.test
```

Required variables:

```
TEST_USER_EMAIL=test@barbershop.com
TEST_USER_PASSWORD=testpassword123
TEST_BUSINESS_SLUG=test-barbershop
```

**Important:** Use a separate test database/instance to avoid affecting production data.

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { formatCurrency } from '@/lib/utils/format'

describe('formatCurrency', () => {
  it('should format currency with CRC symbol', () => {
    const formatted = formatCurrency(10000)
    expect(formatted).toContain('10')
  })
})
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test'

test('should display login page', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible()
})
```

## Coverage Goals

- **Unit Tests:** 80%+ coverage for utilities and business logic
- **E2E Tests:** Cover all critical user flows
- **Integration:** All API routes should have E2E coverage

## CI/CD Integration

Tests run automatically on:

- Pre-commit: Unit tests (via Husky)
- Pull Requests: Full test suite
- Deployment: E2E smoke tests

## Debugging

### Unit Tests

```bash
# Run specific test file
npm run test:unit format.test.ts

# Run with debugging
npm run test:unit -- --reporter=verbose
```

### E2E Tests

```bash
# Run in headed mode
npm run test:e2e -- --headed

# Run specific test
npm run test:e2e auth.spec.ts

# Debug mode
npm run test:e2e -- --debug
```

## Best Practices

1. **Unit Tests:**
   - Test pure functions and utilities
   - Mock external dependencies
   - Focus on business logic

2. **E2E Tests:**
   - Test critical user journeys
   - Use data-testid for stable selectors
   - Clean up test data after runs

3. **Performance:**
   - Keep unit tests fast (< 5s total)
   - Parallelize E2E tests when possible
   - Use `test.skip` for flaky tests temporarily

## Current Status

**Phase 3: Testing** ✅

- ✅ Playwright setup complete
- ✅ Vitest setup complete
- ✅ Auth flow E2E tests (5 scenarios)
- ✅ Client management E2E tests (6 scenarios)
- ✅ Appointments E2E tests (7 scenarios)
- ✅ Format utilities unit tests (20 tests)

**Next Steps:**

- Add more unit tests (hooks, components)
- Add visual regression tests
- Setup CI/CD test automation
- Add performance tests

## Resources

- [Playwright Docs](https://playwright.dev)
- [Vitest Docs](https://vitest.dev)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro)
