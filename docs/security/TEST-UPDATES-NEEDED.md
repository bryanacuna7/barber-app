# Test Updates Needed - IDOR Security Fixes

**Date:** 2026-02-03
**Status:** TODO
**Priority:** HIGH

---

## Overview

The IDOR security fixes added a `user` parameter to the authentication context. All existing tests need to be updated to include this parameter.

---

## Affected Test Files

### 1. Mi Día Endpoint Tests

**File:** `src/app/api/barbers/[id]/appointments/today/__tests__/route.security.test.ts`

**Issue:** Tests call `GET()` with 2 arguments, but now requires 3 (added `user`).

**Fix Pattern:**

```typescript
// ❌ BEFORE (2 arguments)
const response = await GET(
  mockRequest,
  { params: Promise.resolve({ id: 'barber-123' }) },
  { business: authenticatedBusiness, supabase: mockSupabase }
)

// ✅ AFTER (3 arguments with user)
const response = await GET(
  mockRequest,
  { params: Promise.resolve({ id: 'barber-123' }) },
  {
    user: { id: 'user-123', email: 'barber-a@salon.com' },
    business: authenticatedBusiness,
    supabase: mockSupabase,
  }
)
```

**Test Cases to Add:**

```typescript
describe('IDOR Protection - User Identity Validation', () => {
  it('should allow barber to access their own appointments', async () => {
    // Mock barber with email matching authenticated user
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'barber-a',
          email: 'barber-a@salon.com', // Matches user.email
          business_id: 'business-123',
        },
      }),
    })

    const response = await GET(
      mockRequest,
      { params: Promise.resolve({ id: 'barber-a' }) },
      {
        user: { id: 'user-a', email: 'barber-a@salon.com' },
        business: { id: 'business-123', owner_id: 'owner-123' },
        supabase: mockSupabase,
      }
    )

    expect(response.status).toBe(200)
  })

  it('should block barber from accessing other barber appointments', async () => {
    // Mock barber with different email
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'barber-b',
          email: 'barber-b@salon.com', // Does NOT match user.email
          business_id: 'business-123',
        },
      }),
    })

    const response = await GET(
      mockRequest,
      { params: Promise.resolve({ id: 'barber-b' }) },
      {
        user: { id: 'user-a', email: 'barber-a@salon.com' },
        business: { id: 'business-123', owner_id: 'owner-123' },
        supabase: mockSupabase,
      }
    )

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('No tienes permiso para ver las citas de este barbero')
  })

  it('should allow business owner to access any barber appointments', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'barber-b',
          email: 'barber-b@salon.com',
          business_id: 'business-123',
        },
      }),
    })

    const response = await GET(
      mockRequest,
      { params: Promise.resolve({ id: 'barber-b' }) },
      {
        user: { id: 'owner-123', email: 'owner@salon.com' },
        business: { id: 'business-123', owner_id: 'owner-123' }, // user.id === owner_id
        supabase: mockSupabase,
      }
    )

    expect(response.status).toBe(200)
  })
})
```

---

### 2. Status Update Endpoint Tests

**Files:**

- `src/app/api/appointments/[id]/check-in/__tests__/route.security.test.ts`
- `src/app/api/appointments/[id]/check-in/__tests__/route.rate-limit.test.ts`

**Issue:** Tests call `PATCH()` with 2 arguments, but now requires 3 (added `user`).

**Fix Pattern:**

```typescript
// ❌ BEFORE (2 arguments)
const response = await PATCH(
  mockRequest,
  { params: Promise.resolve({ id: 'apt-123' }) },
  { business: authenticatedBusiness, supabase: mockSupabase }
)

// ✅ AFTER (3 arguments with user)
const response = await PATCH(
  mockRequest,
  { params: Promise.resolve({ id: 'apt-123' }) },
  {
    user: { id: 'user-123', email: 'barber-a@salon.com' },
    business: authenticatedBusiness,
    supabase: mockSupabase,
  }
)
```

**Test Cases to Update:**
All existing tests need the `user` parameter added. Additionally, update tests that relied on the old optional `barberId` body parameter:

```typescript
// ❌ OLD TEST (relying on optional barberId in body)
it('should allow update when barberId is not provided (owner/admin access)', async () => {
  mockRequest = new NextRequest('...', {
    method: 'PATCH',
    body: JSON.stringify({}), // No barberId
  })

  // This now requires user.id to match business.owner_id
})

// ✅ NEW TEST (using authenticated user context)
it('should allow business owner to update any appointment', async () => {
  mockRequest = new NextRequest('...', {
    method: 'PATCH',
  })

  const response = await PATCH(
    mockRequest,
    { params: Promise.resolve({ id: 'apt-123' }) },
    {
      user: { id: 'owner-123', email: 'owner@salon.com' },
      business: { id: 'business-123', owner_id: 'owner-123' }, // Matches user.id
      supabase: mockSupabase,
    }
  )

  expect(response.status).toBe(200)
})

it('should block barber from updating other barber appointments', async () => {
  // Mock appointment assigned to barber-b
  mockSupabase.from.mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: {
        id: 'apt-123',
        barber: { id: 'barber-b', email: 'barber-b@salon.com' },
      },
    }),
  })

  const response = await PATCH(
    mockRequest,
    { params: Promise.resolve({ id: 'apt-123' }) },
    {
      user: { id: 'user-a', email: 'barber-a@salon.com' }, // Different barber
      business: { id: 'business-123', owner_id: 'owner-123' },
      supabase: mockSupabase,
    }
  )

  expect(response.status).toBe(401)
})
```

---

### 3. Hook Tests

**File:** `src/hooks/__tests__/use-barber-appointments.test.ts`

**Issue:** Mock response type error (unrelated to IDOR fixes, but needs fixing).

**Fix:**
Update mock fetch response to include all required Response properties.

---

## Implementation Steps

### Step 1: Update Authentication Context Types

All test files should import and use the correct type:

```typescript
import type { AuthContext } from '@/lib/api/middleware'

// Use in tests
const mockAuthContext: AuthContext = {
  user: { id: 'user-123', email: 'barber@salon.com' },
  business: { id: 'business-123', owner_id: 'owner-123' },
  supabase: mockSupabase,
}
```

### Step 2: Create Test Helpers

Create reusable test helpers to reduce boilerplate:

```typescript
// src/test/test-helpers.ts
export function createBarberAuthContext(email: string, businessId: string) {
  return {
    user: { id: `user-${email}`, email },
    business: { id: businessId, owner_id: 'owner-123' },
    supabase: createMockSupabaseClient(),
  }
}

export function createOwnerAuthContext(businessId: string) {
  const ownerId = 'owner-123'
  return {
    user: { id: ownerId, email: 'owner@salon.com' },
    business: { id: businessId, owner_id: ownerId },
    supabase: createMockSupabaseClient(),
  }
}
```

### Step 3: Update All Test Files

For each file listed above:

1. Add `user` parameter to all handler calls
2. Add new IDOR protection test cases
3. Update existing tests to use new authentication model
4. Remove tests that relied on optional `barberId` body parameter

### Step 4: Run Tests

```bash
npm test -- src/app/api/barbers/[id]/appointments/today/__tests__/route.security.test.ts
npm test -- src/app/api/appointments/[id]/check-in/__tests__/
```

### Step 5: Update Documentation

Update test documentation to reflect new authentication model.

---

## Priority Order

1. **HIGH PRIORITY:** `route.security.test.ts` files
   - These test the IDOR fixes directly
   - Must pass before deployment

2. **MEDIUM PRIORITY:** `route.rate-limit.test.ts` files
   - Test secondary security features
   - Should be updated soon

3. **LOW PRIORITY:** Hook tests
   - Frontend tests, less critical
   - Can be updated in next session

---

## Estimated Effort

- **Time:** 2-3 hours
- **Files to Update:** 3 test files
- **New Tests to Add:** ~10 test cases
- **Test Helpers to Create:** 2-3 helper functions

---

## Verification

After updates, run:

```bash
# Run all security tests
npm test -- --grep="Security Tests"

# Run all IDOR tests
npm test -- --grep="IDOR"

# Type check
npx tsc --noEmit

# Full test suite
npm test
```

Expected results:

- ✅ All security tests pass
- ✅ No TypeScript errors
- ✅ Test coverage maintained or increased

---

## Notes

- The linter automatically added rate limiting to complete/no-show endpoints
- This is a **good thing** and should be kept
- Tests for rate limiting on those endpoints should also be added

---

## Related Documentation

- **IDOR Fixes:** `/docs/security/IDOR-fixes-session-72.md`
- **Security Summary:** `/docs/security/SECURITY-SUMMARY.md`
- **Test Utils:** `/src/test/test-utils.tsx`
