# Fix: JSON Parse Error in Clientes/Citas Pages

**Session:** 122
**Date:** 2026-02-05
**Error:** `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

## Root Cause Analysis

### The Problem
Client pages (`clientes/page-v2.tsx` and `citas/page-v2.tsx`) were attempting to fetch business ID from a non-existent API endpoint:

```typescript
// OLD CODE (BROKEN)
const [businessId, setBusinessId] = useState<string | null>(null)

useEffect(() => {
  fetch('/api/auth/session')  // ❌ This endpoint doesn't exist!
    .then((res) => res.json()) // ❌ Parsing HTML 404 page as JSON
    .then((data) => {
      if (data.user?.businessId) {
        setBusinessId(data.user.businessId)
      }
    })
    .catch((err) => {
      console.error('Failed to fetch session:', err)
    })
}, [])
```

### Why This Failed
1. **`/api/auth/session` doesn't exist** in the codebase
2. Next.js returned a **404 HTML error page** (starting with `<!DOCTYPE html>`)
3. `.json()` tried to parse HTML, causing: `Unexpected token '<'`
4. Pages couldn't get `businessId`, breaking React Query hooks

### Architecture Mismatch
- **Layout** (`src/app/(dashboard)/layout.tsx`): Server-side, uses `await supabase.auth.getUser()`
- **Pages** (`page-v2.tsx`): Client-side (`'use client'`), can't access server auth directly
- **Missing Bridge:** No way to pass auth data from server layout to client pages

## The Solution

### 1. Created Business Context Provider

**File:** `src/contexts/business-context.tsx`

```typescript
'use client'

interface BusinessContextValue {
  businessId: string
  userId: string
  userEmail?: string
}

export function BusinessProvider({ businessId, userId, userEmail, children }) {
  return (
    <BusinessContext.Provider value={{ businessId, userId, userEmail }}>
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  const context = useContext(BusinessContext)
  if (!context) throw new Error('useBusiness must be used within BusinessProvider')
  return context
}
```

### 2. Updated Dashboard Layout

**File:** `src/app/(dashboard)/layout.tsx`

```typescript
// Added import
import { BusinessProvider } from '@/contexts/business-context'

// Wrapped children with provider
return (
  <BusinessProvider
    businessId={business.id}  // From server-side auth
    userId={user.id}
    userEmail={user.email}
  >
    <TourProvider businessId={business.id}>
      {/* ... rest of layout ... */}
    </TourProvider>
  </BusinessProvider>
)
```

### 3. Updated Client Pages

**Files:** `clientes/page-v2.tsx` and `citas/page-v2.tsx`

```typescript
// OLD (BROKEN):
const [businessId, setBusinessId] = useState<string | null>(null)
useEffect(() => {
  fetch('/api/auth/session').then(...)
}, [])

// NEW (FIXED):
import { useBusiness } from '@/contexts/business-context'

const { businessId } = useBusiness() // ✅ Direct access from context
```

**Removed:**
- ❌ `useState` for `businessId`
- ❌ `useEffect` with fetch call
- ❌ Loading state check for `businessId`

**Result:**
- ✅ Business ID available immediately from context
- ✅ No network requests needed
- ✅ No JSON parsing errors
- ✅ Cleaner code (removed ~15 lines per page)

## Files Modified

1. ✅ Created: `src/contexts/business-context.tsx`
2. ✅ Modified: `src/app/(dashboard)/layout.tsx` (added BusinessProvider)
3. ✅ Modified: `src/app/(dashboard)/clientes/page-v2.tsx` (use context)
4. ✅ Modified: `src/app/(dashboard)/citas/page-v2.tsx` (use context)

## Testing Verification

### Before Fix
```
Console Error: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
Status: Pages fail to load, businessId is null
```

### After Fix
```
Console: Clean (no errors)
Status: Pages load immediately with businessId from context
Flow: Layout (server) → BusinessProvider → Client pages
```

## Benefits

1. **Eliminates unnecessary API calls** - No fetch to non-existent endpoint
2. **Faster page loads** - No waiting for async fetch
3. **Cleaner architecture** - Proper server-to-client data flow
4. **Reusable pattern** - Other pages can use `useBusiness()` hook
5. **Type-safe** - TypeScript enforces correct usage

## Pattern for Future Pages

```typescript
'use client'

import { useBusiness } from '@/contexts/business-context'
import { useClients } from '@/hooks/queries/useClients'

export default function MyPage() {
  const { businessId, userId } = useBusiness() // ✅ Get auth data
  const { data: clients } = useClients(businessId) // ✅ Pass to hooks

  return <div>{/* Your component */}</div>
}
```

## Prevention

### DO:
- ✅ Use `useBusiness()` hook in client components
- ✅ Pass `businessId` from context to React Query hooks
- ✅ Keep auth logic in server components (layouts)

### DON'T:
- ❌ Fetch `/api/auth/session` (doesn't exist)
- ❌ Try to access `supabase.auth.getUser()` in client components
- ❌ Create new auth endpoints when context exists

## Related Patterns

This pattern mirrors:
- **TourProvider** (`src/lib/tours/tour-provider.tsx`) - Already passed `businessId`
- **ThemeProvider** - Passes theme colors from server
- **React Query** - Prefetched data passed via context

## Verification Steps

1. Start dev server: `npm run dev`
2. Navigate to `/clientes` (requires auth)
3. Check browser console: ✅ No JSON parse errors
4. Verify clients load immediately
5. Navigate to `/citas`: ✅ Works same way
6. Confirm real-time updates still work

## Deployment Notes

- No database changes required
- No environment variables needed
- Works in both dev and production
- Compatible with all auth flows
