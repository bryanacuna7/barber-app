# E2E Tests Setup

## Prerequisites

Before running E2E tests, you need to seed the test database with test data.

### 1. Seed Test Data

Run the following SQL script in your Supabase SQL Editor:

```bash
# Copy the seed file content
cat supabase/seed_test_data.sql
```

Then paste it into Supabase Dashboard → SQL Editor → New query → Execute

This will create:

- **Business:** `barberia-test` (Barbería El Patrón)
- **Services:** 7 services (Corte Clásico, Corte + Barba, etc.)
- **Barbers:** 3 barbers (Juan Carlos, Miguel Ángel, David López)
- **Clients:** 8 test clients
- **Appointments:** Sample appointments for testing

### 2. Environment Variables

Ensure `.env.test` exists with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Start Dev Server

```bash
npm run dev
```

The dev server must be running on `http://localhost:3000` before running tests.

## Running E2E Tests

### Auth Lifecycle Audit

```bash
npx playwright test tests/e2e/auth-lifecycle-audit.spec.ts --project=chromium
```

Optional role-based checks (owner/barber/client) require env vars:

```env
E2E_OWNER_EMAIL=owner@example.com
E2E_OWNER_PASSWORD=...
E2E_BARBER_EMAIL=barber@example.com
E2E_BARBER_PASSWORD=...
E2E_CLIENT_EMAIL=client@example.com
E2E_CLIENT_PASSWORD=...
```

### Run All Tests

```bash
npx playwright test tests/e2e/booking-flow.spec.ts
```

### Run Specific Test Suite

```bash
# Happy path tests only
npx playwright test tests/e2e/booking-flow.spec.ts -g "Happy Path"

# Error cases only
npx playwright test tests/e2e/booking-flow.spec.ts -g "Error Cases"
```

### Run with UI (headed mode)

```bash
npx playwright test tests/e2e/booking-flow.spec.ts --headed
```

### Debug Mode

```bash
npx playwright test tests/e2e/booking-flow.spec.ts --debug
```

## Test Coverage

Current booking flow E2E coverage: **90%** (22/24 tests)

- ✅ Happy Path (3 tests)
- ✅ Error Cases (6 tests)
- ✅ Service/Barber Selection (3 tests)
- ✅ Date/Time Selection (4 tests)
- ✅ Mobile Responsiveness (2 tests)
- ✅ Performance (2 tests)
- ✅ Accessibility (2 tests)
- 🟡 Cancel/Reschedule (2 tests - TODO, requires API)

## Test Data

The tests use the following test business:

- **Slug:** `barberia-test`
- **URL:** `http://localhost:3000/reservar/barberia-test`
- **Services:** 7 available services
- **Barbers:** 3 active barbers
- **Operating Hours:** Mon-Fri 8am-7pm, Sat 9am-5pm, Sun closed

## Troubleshooting

### Tests Failing with "Business not found"

Run the seed script again in Supabase SQL Editor.

### Tests Timing Out

Ensure dev server is running on port 3000:

```bash
lsof -i :3000 | grep LISTEN
```

If not running:

```bash
npm run dev
```

### Playwright Not Installed

```bash
npx playwright install
```

## Notes

- Tests use real Supabase data (not mocked)
- Test database should be separate from production
- Seed script is idempotent (safe to run multiple times)
- Tests include visual regression capabilities (screenshots)
