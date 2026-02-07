# 🧪 Manual Testing Checklist - Mi Día Security Fixes

**URL:** http://localhost:3000/mi-dia
**Server:** ✅ Running on port 3000
**Duration:** ~10-15 minutes

---

## ✅ Test 1: Authentication Flow (3 min)

### 1.1 Not Authenticated Test

- [ ] **Action:** Open http://localhost:3000/mi-dia in incognito/private window
- [ ] **Expected:** Redirects to `/login` page
- [ ] **Pass/Fail:** \***\*\_\_\_\*\***

### 1.2 Authenticated as Barber Test

- [ ] **Action:** Login with a barber account
- [ ] **Action:** Navigate to http://localhost:3000/mi-dia
- [ ] **Expected:** See page with:
  - Header: "Mi Día" or barber name
  - Today's date displayed
  - List of appointments (or "No hay citas" message)
  - Loading spinner briefly, then content
- [ ] **Pass/Fail:** \***\*\_\_\_\*\***
- [ ] **Screenshot:** (optional - take a screenshot for documentation)

### 1.3 Non-Barber User Test (if applicable)

- [ ] **Action:** Login with a regular user (non-barber)
- [ ] **Action:** Navigate to http://localhost:3000/mi-dia
- [ ] **Expected:** Error message: "No tienes un perfil de barbero"
- [ ] **Pass/Fail:** \***\*\_\_\_\*\***

---

## 🔒 Test 2: IDOR Protection (5 min)

### 2.1 Direct API Access Test

- [ ] **Setup:** Be logged in as Barber A
- [ ] **Action:** Get Barber A's ID from the page URL or database
- [ ] **Action:** Create a different barber ID (Barber B) - can be fake UUID
- [ ] **Action:** Open browser DevTools (F12) → Console
- [ ] **Action:** Run this command:

  ```javascript
  fetch('/api/barbers/[BARBER_B_ID]/appointments/today')
    .then((r) => r.json())
    .then(console.log)
  ```

  Replace `[BARBER_B_ID]` with another barber's ID

- [ ] **Expected:** Response with error:
  ```json
  {
    "error": "No tienes permiso para ver las citas de este barbero"
  }
  ```
- [ ] **Pass/Fail:** \***\*\_\_\_\*\***

### 2.2 Business Owner Override Test (if you're owner)

- [ ] **Action:** Login as business owner
- [ ] **Action:** Navigate to http://localhost:3000/mi-dia
- [ ] **Expected:** Can see appointments (may need to select a barber)
- [ ] **Pass/Fail:** \***\*\_\_\_\*\***

---

## ⚡ Test 3: Status Updates (4 min)

### 3.1 Check-In Flow

- [ ] **Action:** Find an appointment with status badge "Confirmada" (green)
- [ ] **Action:** Click the "Check-In" button
- [ ] **Expected:**
  - Button shows loading spinner briefly
  - Status changes to "En Progreso" (blue/yellow)
  - Success message/toast appears
  - Page updates without full reload
- [ ] **Pass/Fail:** \***\*\_\_\_\*\***

### 3.2 Complete Flow

- [ ] **Action:** Find an appointment with "En Progreso" status
- [ ] **Action:** Click "Complete" or "Completar" button
- [ ] **Expected:**
  - Button shows loading spinner
  - Status changes to "Completada" (green/gray)
  - Client stats updated in database (check below)
  - Success message appears
- [ ] **Pass/Fail:** \***\*\_\_\_\*\***

### 3.3 Verify Atomic Stats Update

- [ ] **Action:** After completing appointment, check database or API:
  ```javascript
  // In browser console, get the client_id from completed appointment
  // Then verify stats were incremented
  ```
- [ ] **Expected:** Client's `total_visits` and `total_spent` incremented
- [ ] **Pass/Fail:** \***\*\_\_\_\*\***

### 3.4 No-Show Flow (optional)

- [ ] **Action:** Find a "Confirmada" appointment
- [ ] **Action:** Click "No-Show" button (if available)
- [ ] **Expected:**
  - Status changes to "No Show" or "Ausente"
  - Appointment marked appropriately
- [ ] **Pass/Fail:** \***\*\_\_\_\*\***

---

## 🛡️ Test 4: Rate Limiting (3 min)

### 4.1 Rapid Status Updates Test

- [ ] **Action:** Open browser DevTools → Console
- [ ] **Action:** Get an appointment ID from the page
- [ ] **Action:** Run this script (replace `APPOINTMENT_ID`):

  ```javascript
  const appointmentId = 'APPOINTMENT_ID' // Replace with real ID

  async function testRateLimit() {
    for (let i = 1; i <= 15; i++) {
      const response = await fetch(`/api/appointments/${appointmentId}/check-in`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })

      console.log(`Request ${i}: ${response.status} ${response.statusText}`)

      if (response.status === 429) {
        const data = await response.json()
        console.log('Rate limited!', data)
      }

      await new Promise((r) => setTimeout(r, 100)) // Small delay
    }
  }

  testRateLimit()
  ```

- [ ] **Expected Results:**
  - First 10 requests: Status 200 or 400 (success or business logic error)
  - Requests 11-15: Status 429 "Too Many Requests"
  - Error message: "Demasiadas solicitudes"
  - Headers include: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`

- [ ] **Pass/Fail:** \***\*\_\_\_\*\***
- [ ] **Console Screenshot:** (recommended)

---

## 🐛 Test 5: Console & Error Check (2 min)

### 5.1 Browser Console Check

- [ ] **Action:** Open DevTools → Console tab
- [ ] **Action:** Refresh the Mi Día page
- [ ] **Action:** Interact with a few appointments
- [ ] **Expected:**
  - ✅ No red errors in console
  - ✅ No 401 Unauthorized errors
  - ✅ No 403 Forbidden errors
  - ✅ No JavaScript errors
  - ℹ️ Info/debug logs are OK
  - ⚠️ Warnings are OK (unless security-related)
- [ ] **Pass/Fail:** \***\*\_\_\_\*\***
- [ ] **Errors Found:** (list any errors)

### 5.2 Network Tab Check

- [ ] **Action:** Open DevTools → Network tab
- [ ] **Action:** Filter by "Fetch/XHR"
- [ ] **Action:** Refresh page and perform some actions
- [ ] **Expected:**
  - ✅ All API calls return 200 OK (or expected status)
  - ✅ No failed requests (red)
  - ✅ Response times < 1 second
- [ ] **Pass/Fail:** \***\*\_\_\_\*\***

---

## 📊 Test Results Summary

| Test                     | Status            | Notes |
| ------------------------ | ----------------- | ----- |
| 1.1 Not Authenticated    | ⬜ Pass / ⬜ Fail |       |
| 1.2 Authenticated Barber | ⬜ Pass / ⬜ Fail |       |
| 1.3 Non-Barber User      | ⬜ Pass / ⬜ Fail |       |
| 2.1 IDOR Protection      | ⬜ Pass / ⬜ Fail |       |
| 2.2 Business Owner       | ⬜ Pass / ⬜ Fail |       |
| 3.1 Check-In             | ⬜ Pass / ⬜ Fail |       |
| 3.2 Complete             | ⬜ Pass / ⬜ Fail |       |
| 3.3 Atomic Stats         | ⬜ Pass / ⬜ Fail |       |
| 3.4 No-Show              | ⬜ Pass / ⬜ Fail |       |
| 4.1 Rate Limiting        | ⬜ Pass / ⬜ Fail |       |
| 5.1 Console Check        | ⬜ Pass / ⬜ Fail |       |
| 5.2 Network Check        | ⬜ Pass / ⬜ Fail |       |

**Overall Status:** ⬜ All Pass / ⬜ Some Fail

---

## 🚨 If Tests Fail

### Common Issues & Fixes

**Issue:** Page redirects to login even when authenticated

- **Cause:** Session expired or auth context not loading
- **Fix:** Clear cookies, re-login, check Supabase auth status

**Issue:** IDOR test returns appointments instead of error

- **Cause:** Security fix not applied or middleware not running
- **Fix:** Verify `withAuth` wrapper is on the route handler

**Issue:** Rate limiting not working (all requests succeed)

- **Cause:** Redis not configured or middleware not applied
- **Fix:** Check `UPSTASH_REDIS_REST_URL` env var, verify middleware

**Issue:** Status updates fail with error

- **Cause:** Database function not created or permissions issue
- **Fix:** Verify migration 022 was applied successfully

**Issue:** Console shows errors

- **Cause:** Various - check specific error messages
- **Fix:** Read error message, check relevant documentation

---

## ✅ Success Criteria

All tests must pass before deploying to production:

- [x] Migration 022 applied successfully
- [ ] All authentication flows work correctly
- [ ] IDOR protection prevents unauthorized access
- [ ] Status updates work and increment stats atomically
- [ ] Rate limiting blocks excessive requests
- [ ] No console errors or failed network requests

**Deployment Ready:** ⬜ YES / ⬜ NO

---

## 📸 Optional: Screenshots for Documentation

If you want to document the testing:

1. **Authentication success:** Screenshot of Mi Día page loaded
2. **IDOR protection:** Screenshot of error in console
3. **Rate limiting:** Screenshot showing 429 errors
4. **Status update:** Screenshot of successful status change

Save in: `/docs/testing/screenshots/mi-dia/`

---

## 🎯 Next Steps After Testing

### If All Tests Pass ✅

```bash
# 1. Commit all changes
git add .
git commit -m "🔒 security: fix all 6 critical vulnerabilities in Mi Día

- Fix IDOR #1: Barbers can only access their own appointments
- Fix IDOR #2: Mandatory authorization checks on status updates
- Fix race condition: Atomic client stats with increment_client_stats()
- Add rate limiting: 10 req/min on status update endpoints
- Complete auth integration: Replace all BARBER_ID_PLACEHOLDER
- Add comprehensive security tests: 8/8 passing
- Fix all TypeScript errors (50+ → 0)

Testing completed:
- Manual testing: All 12 tests passed
- IDOR protection verified
- Rate limiting verified
- Atomic stats verified

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# 2. Push to remote
git push origin feature/subscription-payments-rebranding

# 3. Create PR
# (Use GitHub/GitLab UI or gh CLI)

# 4. Deploy to staging for final QA
```

### If Some Tests Fail ❌

1. Document which tests failed
2. Note the exact error messages
3. Check the troubleshooting section above
4. Review relevant documentation files
5. Can resume agents for help (see SECURITY_FIXES_STATUS.md)

---

**Testing Date:** \***\*\_\_\_\*\***
**Tester:** \***\*\_\_\_\*\***
**Environment:** Development (localhost:3000)
**Result:** ⬜ Pass / ⬜ Fail

---

**END OF TESTING CHECKLIST**
