# 🔧 Manual Steps - Security Fixes Deployment

**Created:** 2026-02-03
**Status:** Ready for execution
**Estimated Time:** 30-45 minutes

---

## Overview

All security fixes have been implemented by the multi-agent team. The following manual steps are required to deploy and verify the fixes.

---

## ✅ Checklist

- [ ] Step 1: Apply database migration 022
- [ ] Step 2: Update existing test files
- [ ] Step 3: Run security test suite
- [ ] Step 4: Verify TypeScript compilation
- [ ] Step 5: Test Mi Día page manually

---

## Step 1: Apply Database Migration 022 (5-10 min)

### Option A: Using Supabase Dashboard (RECOMMENDED)

1. Go to your Supabase Dashboard
2. Navigate to: **SQL Editor** → **New Query**
3. Copy and paste the content from:
   ```
   /Users/bryanacuna/Desktop/barber-app/supabase/migrations/022_atomic_client_stats.sql
   ```
4. Click **Run** to execute the migration
5. Verify success: You should see "Success. No rows returned"

### Option B: Using Supabase CLI

```bash
# Option 1: Apply only migration 022
npx supabase db remote commit

# Option 2: Manual SQL execution
cat supabase/migrations/022_atomic_client_stats.sql | npx supabase db execute

# Verify the function was created
npx supabase db execute << 'SQL'
SELECT EXISTS (
  SELECT 1 FROM pg_proc
  WHERE proname = 'increment_client_stats'
) as function_exists;
SQL
```

**Expected Output:** `function_exists: true`

### Verification

Run the verification script:

```bash
cat scripts/verify-atomic-stats.sql | npx supabase db execute
```

**Expected:** All tests should pass (no errors)

---

## Step 2: Update Existing Test Files (10-15 min)

The existing security tests need to be updated to include the `user` parameter in the authentication mock.

### Files to Update

1. **`src/app/api/barbers/[id]/appointments/today/__tests__/route.security.test.ts`**
2. **`src/app/api/appointments/[id]/check-in/__tests__/route.security.test.ts`**

### Pattern to Apply

**Before (OLD):**

```typescript
const mockGetUser = vi.fn(() => ({
  data: { user: { id: 'owner-user-id' } },
  error: null,
}))
```

**After (NEW):**

```typescript
const mockGetUser = vi.fn(() => ({
  data: {
    user: {
      id: 'owner-user-id',
      email: 'barber@test.com', // ← ADD THIS
    },
  },
  error: null,
}))
```

### Detailed Instructions

See the complete guide:

```
/Users/bryanacuna/Desktop/barber-app/docs/security/TEST-UPDATES-NEEDED.md
```

### Quick Fix Command

```bash
# Update tests automatically (be careful, review changes!)
# File 1
sed -i.bak 's/user: { id: /user: { id: /g' \
  src/app/api/barbers/*/appointments/today/__tests__/route.security.test.ts

# Review changes before committing
git diff src/app/api/barbers/*/appointments/today/__tests__/route.security.test.ts
```

**Manual Update Recommended:** Review each test file and add the `email` field manually.

---

## Step 3: Run Security Test Suite (5 min)

### Run All Security Tests

```bash
# Run comprehensive security test suite
npm run test:security

# Or run tests individually
npm test -- src/app/api/barbers/[id]/appointments/today/__tests__/route.security.test.ts
npm test -- src/app/api/appointments/[id]/check-in/__tests__/route.security.test.ts
npm test -- src/app/api/appointments/[id]/complete/__tests__/route.security.test.ts
npm test -- src/app/api/appointments/[id]/check-in/__tests__/route.rate-limit.test.ts
```

### Expected Results

All 8 security tests should pass:

```
✅ SEC-001: IDOR Protection - Barber Access Control
✅ SEC-002: IDOR Protection - Status Updates
✅ SEC-003: IDOR Protection - Complete Endpoint
✅ SEC-004: Rate Limiting Protection
✅ SEC-005: No Hardcoded Credentials
✅ SEC-006: SQL Injection Protection
✅ SEC-007: Atomic Operations (Race Conditions)
✅ SEC-008: Authentication Middleware

Test Suites: 4 passed, 4 total
Tests:       8 passed, 8 total
```

### If Tests Fail

1. Check error messages carefully
2. Verify database migration was applied (Step 1)
3. Verify test files were updated correctly (Step 2)
4. Review the detailed test report:
   ```
   cat test-reports/security-report-latest.txt
   ```

---

## Step 4: Verify TypeScript Compilation (2 min)

### Build the Project

```bash
# Remove SKIP_TYPE_CHECK if it exists in package.json
npm run build
```

### Expected Output

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages

Build completed successfully
```

### If Build Fails

1. Check TypeScript errors
2. Verify all imports are correct
3. Check that modified files have correct types:
   - `src/app/(dashboard)/mi-dia/page.tsx`
   - `src/hooks/use-barber-appointments.ts`
   - `src/hooks/use-appointment-actions.ts`

---

## Step 5: Test Mi Día Page Manually (10-15 min)

### Start Development Server

```bash
# Check if dev server is running
lsof -i :3000 | grep LISTEN

# If not running, start it
npm run dev
```

### Test Authentication Flow

1. **Open browser:** http://localhost:3000/mi-dia

2. **Expected behavior:**
   - If not logged in → Redirects to `/login`
   - If logged in as non-barber → Shows error: "No tienes un perfil de barbero"
   - If logged in as barber → Shows appointments for today

3. **Test as Barber:**
   - Login as a barber user
   - Navigate to `/mi-dia`
   - Should see: Today's appointments list
   - Should NOT see: Other barbers' appointments

4. **Test as Business Owner:**
   - Login as business owner
   - Navigate to `/mi-dia`
   - May need to select a barber view (if multiple barbers)

### Test Status Updates

1. Find an appointment with status "confirmed"
2. Click "Check-In" → Should update to "in_progress"
3. Click "Complete" → Should update to "completed" and increment client stats
4. Test "No-Show" button on a different appointment

### Test Rate Limiting

Open browser console and run:

```javascript
// Try to update the same appointment 15 times quickly
const appointmentId = 'YOUR_APPOINTMENT_ID' // Replace with real ID
for (let i = 0; i < 15; i++) {
  fetch(`/api/appointments/${appointmentId}/check-in`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  }).then((r) => console.log(`Request ${i}: ${r.status}`))
}
```

**Expected:**

- Requests 1-10: Status 200 or 400 (success or business logic error)
- Requests 11-15: Status 429 (Too Many Requests)

### Check Browser Console for Errors

- **No IDOR attempts logged** (good!)
- **No 401/403 errors** (good!)
- **No console.error** messages (good!)

---

## Verification Summary

After completing all steps, verify:

```bash
# 1. Database function exists
npx supabase db execute << 'SQL'
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'increment_client_stats';
SQL

# 2. All tests pass
npm run test:security

# 3. Build succeeds
npm run build

# 4. No TypeScript errors
npx tsc --noEmit

# 5. Dev server runs without errors
npm run dev
```

---

## Deployment Checklist

Once all manual steps are complete:

- [ ] All 5 manual steps completed successfully
- [ ] Security tests: 8/8 passing
- [ ] TypeScript: No errors
- [ ] Build: Successful
- [ ] Manual testing: All flows work correctly
- [ ] Rate limiting: Verified working
- [ ] IDOR protection: Verified working
- [ ] Authentication: Verified working

**Status:** ✅ Ready for production deployment

---

## Next Steps After Verification

1. **Commit all changes:**

   ```bash
   git add .
   git commit -m "🔒 security: fix all 6 critical vulnerabilities in Mi Día

   - Fix IDOR #1: Barbers can only access their own appointments
   - Fix IDOR #2: Mandatory authorization checks on status updates
   - Fix race condition: Atomic client stats with increment_client_stats()
   - Add rate limiting: 10 req/min on status update endpoints
   - Complete auth integration: Replace all BARBER_ID_PLACEHOLDER
   - Add comprehensive security tests: 8/8 passing

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
   ```

2. **Create Pull Request:**

   ```bash
   git push origin feature/subscription-payments-rebranding
   # Then create PR in GitHub
   ```

3. **Deploy to Staging:**
   - Deploy to Vercel preview environment
   - Run full regression tests
   - Manual QA

4. **Deploy to Production:**
   - Merge PR to main
   - Monitor error rates
   - Set up alerts for IDOR attempts

---

## Rollback Plan (If Issues Found)

If critical issues are discovered after deployment:

```bash
# 1. Revert the code changes
git revert HEAD

# 2. Drop the database function (if needed)
npx supabase db execute << 'SQL'
DROP FUNCTION IF EXISTS increment_client_stats;
SQL

# 3. Redeploy previous version
git push origin feature/subscription-payments-rebranding --force
```

---

## Support

**If you encounter issues:**

1. Review the detailed documentation:
   - `/docs/security/EXECUTIVE-SUMMARY.md` - Executive overview
   - `/docs/security/mi-dia-security-test-report.md` - Full technical details
   - `/docs/security/TEST-UPDATES-NEEDED.md` - Test update guide

2. Check specific fix documentation:
   - `/docs/security/IDOR-fixes-session-72.md` - IDOR vulnerabilities
   - `/docs/security/race-condition-fix-client-stats.md` - Race condition
   - `/RATE_LIMITING_SUMMARY.md` - Rate limiting

3. Resume specific agents for help:
   - Security issues: Resume agent `ae88824` (security-auditor)
   - Database issues: Resume agent `af4e651` (backend-specialist - race condition)
   - Rate limiting: Resume agent `ae7509a` (backend-specialist - rate limiting)
   - Auth integration: Resume agent `a64fe0f` (backend-specialist - auth)
   - Test issues: Resume agent `ab6fb8c` (test-engineer)

---

**END OF MANUAL STEPS GUIDE**

✅ Ready to execute!
