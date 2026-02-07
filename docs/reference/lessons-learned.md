# Lessons Learned - Critical Patterns

> Este archivo contiene patrones y lecciones críticas extraídas de bugs y errores reales.
> Estos patrones han sido documentados para prevenir su repetición.

---

## 🔒 Database & Security

### 1. RLS Policies + Triggers Require SECURITY DEFINER

**Session:** 69
**Problem:** Cambiar estado de cita a "completed" fallaba silenciosamente
**Root Cause:** Trigger `update_barber_stats_on_appointment()` intentaba INSERT en `barber_stats` con RLS habilitado pero sin políticas, y la función NO tenía `SECURITY DEFINER`

**Solution:**

```sql
CREATE OR REPLACE FUNCTION update_barber_stats_on_appointment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER  -- ← CRITICAL: Bypass RLS
SET search_path = public
AS $$
BEGIN
  -- Function logic here
END;
$$;
```

**Rule:**

- ✅ ALWAYS add `SECURITY DEFINER` to trigger functions that modify tables with RLS
- ✅ Include error handling with `BEGIN...EXCEPTION...END`
- ✅ Add logging with `RAISE NOTICE` for debugging

**Impact:** Bug caused appointments to not be completable, silently failing

---

### 2. Database Schema Verification Protocol

**Session:** 65
**Problem:** Migration 019b created indexes for non-existent columns (`deposit_paid`, `last_activity_at`, `push_subscriptions`)
**Root Cause:** Assumed columns existed based on future plan, didn't verify against actual schema

**Solution:**

- ALWAYS read `DATABASE_SCHEMA.md` before ANY database work
- NEVER assume columns exist without verification
- Use direct Supabase verification if available:
  ```sql
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'appointments' AND column_name = 'deposit_paid';
  ```

**Mandatory Checklist:**

```
□ 1. Read DATABASE_SCHEMA.md completely
□ 2. Verify tables exist in schema document
□ 3. Verify columns exist with EXACT names
□ 4. Check "Tables That DO NOT Exist" section
□ 5. Never assume future features are implemented
```

**Rule:**

- ✅ DATABASE_SCHEMA.md is the ONLY source of truth
- ✅ IMPLEMENTATION_PLAN describes FUTURE state, not current state
- ❌ NEVER trust plan documents for schema verification

**Impact:** Would have caused production migration failure

---

### 3. Race Conditions in Fetch-Then-Update Patterns

**Session:** 72
**Problem:** Client stats (total_visits, total_spent) could be incorrect with concurrent appointment completions
**Root Cause:** Fetch-then-update pattern creates race condition window

**Vulnerable Code:**

```typescript
// ❌ BAD: Race condition vulnerability (CWE-915)
const { data: client } = await supabase
  .from('clients')
  .select('total_visits, total_spent')
  .eq('id', client_id)
  .single()

await supabase
  .from('clients')
  .update({
    total_visits: (client.total_visits || 0) + 1,
    total_spent: (client.total_spent || 0) + price,
  })
  .eq('id', client_id)
```

**Why It's Vulnerable:**

```
Time    Request A              Request B
────────────────────────────────────────────
T0      Fetch: visits=10
T1                             Fetch: visits=10
T2      Update: visits=11
T3                             Update: visits=11  ❌ Lost increment!
```

**Solution:**

```sql
-- Create atomic database function
CREATE OR REPLACE FUNCTION increment_client_stats(
  p_client_id UUID,
  p_visits_increment INT,
  p_spent_increment DECIMAL
)
RETURNS VOID AS $$
BEGIN
  UPDATE clients
  SET
    total_visits = COALESCE(total_visits, 0) + p_visits_increment,
    total_spent = COALESCE(total_spent, 0) + p_spent_increment,
    updated_at = NOW()
  WHERE id = p_client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

```typescript
// ✅ GOOD: Atomic operation, no race condition
await supabase.rpc('increment_client_stats', {
  p_client_id: client_id,
  p_visits_increment: 1,
  p_spent_increment: price,
})
```

**Rule:**

- ✅ NEVER use fetch-then-update for counters or stats
- ✅ ALWAYS use atomic database functions for increments
- ✅ Use single SQL UPDATE with arithmetic operations
- ✅ Add validation in function (NULL checks, negative values)
- ✅ Include error handling with meaningful messages

**Detection Pattern:**

Watch for this anti-pattern:

1. `SELECT` to read current value
2. Calculate new value in application code
3. `UPDATE` to write new value

**Impact:** Data corruption in high-concurrency scenarios. Client loyalty stats and revenue tracking could be incorrect.

**References:**

- Migration: `022_atomic_client_stats.sql`
- Documentation: `docs/security/race-condition-fix-client-stats.md`
- CWE-915: Improperly Controlled Modification of Dynamically-Determined Object Attributes

---

### 4. Stored Procedures Need Proper Error Handling

**Session:** 69
**Problem:** Loyalty trigger failed silently, breaking appointment updates
**Root Cause:** No error handling in trigger function

**Solution:**

```sql
CREATE OR REPLACE FUNCTION award_loyalty_points()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  BEGIN
    -- Main logic here
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Error in award_loyalty_points: %', SQLERRM;
      -- Continue without breaking parent transaction
  END;
  RETURN NEW;
END;
$$;
```

**Rule:**

- ✅ Wrap trigger logic in `BEGIN...EXCEPTION...END`
- ✅ Log errors with `RAISE NOTICE`
- ✅ Return NEW/OLD to avoid breaking parent transaction
- ✅ Add `WHEN (condition)` clause to triggers to prevent unnecessary executions

---

## 🔐 Authentication & Authorization

### 4. Server Component Auth Pattern

**Session:** 55
**Problem:** `/referencias` page returned "Unauthorized" error
**Root Cause:** Server Component making `fetch()` to internal API doesn't pass authentication cookies

**Solution:**

```typescript
// ❌ BAD: Internal fetch loses auth context
const response = await fetch('/api/referrals/stats')

// ✅ GOOD: Direct Supabase query preserves auth
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
const { data } = await supabase.from('business_referrals').select('*')
```

**Rule:**

- ✅ Server Components: Use direct Supabase client queries
- ❌ Server Components: Don't use `fetch()` to internal APIs
- ✅ Benefits: Faster (no HTTP round-trip), simpler, better type safety

**Impact:** Entire `/referencias` page was broken, auth errors everywhere

---

## 🛠️ Development Workflow

### 5. Process Management - Check for Duplicates

**Session:** 55
**Problem:** App not responding, errors seemed random
**Root Cause:** Multiple Next.js dev servers running simultaneously (port conflicts)

**Solution:**

```bash
# Check what's running on port 3000
lsof -i :3000 | grep LISTEN

# Kill duplicate processes
kill -9 $(lsof -t -i:3000)

# Restart cleanly
npm run dev
```

**Rule:**

- ✅ ALWAYS verify dev server before debugging issues
- ✅ Check for duplicates after crashes or errors
- ✅ Use `lsof` before starting new server

**Impact:** Wasted 30+ minutes debugging "phantom" errors

---

### 6. TypeScript Type Regeneration After Schema Changes

**Session:** 67
**Problem:** 125+ TypeScript errors after database migrations
**Root Cause:** Database types out of sync with actual schema

**Solution:**

```bash
# After ANY migration or schema change
npx supabase gen types typescript --project-id [YOUR_PROJECT_ID] > src/types/database.ts
```

**Rule:**

- ✅ Regenerate types IMMEDIATELY after migrations
- ✅ Run `npx tsc --noEmit` to verify no new errors
- ✅ Commit type changes with migration changes

**Impact:** 125 errors resolved instantly, 62% error reduction

---

## 📊 Performance

### 7. N+1 Query Detection and Resolution

**Session:** 65
**Problem:** Admin businesses endpoint slow (61 queries for 20 businesses)
**Root Cause:** Classic N+1 pattern - one query per business for stats

**Solution:**

```typescript
// ❌ BAD: N+1 queries (1 + N×3)
for (const business of businesses) {
  const barbers = await supabase.from('barbers').select('*').eq('business_id', business.id);
  const services = await supabase.from('services').select('*').eq('business_id', business.id);
  const appointments = await supabase.from('appointments').select('*').eq('business_id', business.id);
}

// ✅ GOOD: Batch queries (1 + 3)
const allBusinessIds = businesses.map(b => b.id);
const [barbers, services, appointments] = await Promise.all([
  supabase.from('barbers').select('*').in('business_id', allBusinessIds),
  supabase.from('services').select('*').in('business_id', allBusinessIds),
  supabase.from('appointments').select('*').in('business_id', allBusinessIds)
]);

// Group in memory using Map
const businessStats = new Map();
barbers.forEach(b => /* group by business_id */);
```

**Rule:**

- ✅ Use `Promise.all()` for parallel queries
- ✅ Use `.in()` for batch fetches
- ✅ Group results in-memory with Map (O(n) complexity)
- ✅ Aim for queries proportional to entity types, not entity count

**Impact:** 15x faster (61 → 4 queries)

---

### 8. Database Indexing for Common Queries

**Session:** 65
**Problem:** Slow queries on appointments, clients, referrals
**Root Cause:** Missing indexes on frequently filtered/sorted columns

**Solution:**

```sql
-- Composite indexes for common query patterns
CREATE INDEX idx_appointments_status_date
ON appointments(business_id, status, date);

CREATE INDEX idx_appointments_scheduled
ON appointments(business_id, date)
WHERE status != 'cancelled';
```

**Rule:**

- ✅ Index columns used in WHERE, JOIN, ORDER BY
- ✅ Create composite indexes for multi-column filters
- ✅ Use partial indexes for common subset queries
- ✅ Verify actual schema before creating indexes (see Lesson #2)

**Impact:** 4-8x faster queries across the board

---

## 🧪 Code Quality

### 9. UI Changes Require Visual Verification

**Session:** (Preventive - from CLAUDE.md)
**Rule:** NEVER describe UI changes without visual confirmation

**Required Flow:**

```
1. Edit UI component
2. Verify dev server running: lsof -i :3000
3. Use Playwright to screenshot
4. Verify result visually
5. Fix issues BEFORE marking complete
```

**Prohibited:**

- ❌ "The button should look correct now"
- ❌ Assuming CSS works without preview
- ❌ Waiting for user to report visual bugs

---

### 10. Security-Sensitive Files Require Automated Checks

**Session:** 64
**Pattern:** Always scan auth/payment files for vulnerabilities

**Checklist for auth/payment code:**

```
□ No hardcoded secrets (API keys, passwords)
□ No SQL injection (${} in queries)
□ No XSS vulnerabilities (innerHTML without sanitization)
□ Input validation on all user inputs
□ Rate limiting on public endpoints
□ File validation with magic bytes (not just MIME type)
```

**Rule:**

- ✅ Run security checks after editing auth/payment code
- ✅ Use specialized security libraries (rate-limit.ts, file-validation.ts, path-security.ts)

---

## 📚 Documentation

### 11. Keep Documentation In Sync With Code

**Session:** 63
**Problem:** Duplicate documentation files with conflicting information
**Solution:** Single source of truth for each concern

**Rule:**

- ✅ DATABASE_SCHEMA.md = current database schema
- ✅ IMPLEMENTATION_PLAN = future roadmap
- ✅ PROGRESS.md = session history and current state
- ✅ LESSONS_LEARNED.md = permanent patterns (this file)
- ❌ Delete duplicate/outdated docs immediately

---

## 🎯 Summary - Top 6 Most Critical

| #   | Lesson                                     | Impact                            | Session |
| --- | ------------------------------------------ | --------------------------------- | ------- |
| 1   | RLS + Triggers need SECURITY DEFINER       | Critical bug - broke appointments | 69      |
| 2   | DATABASE_SCHEMA.md is source of truth      | Prevented production failure      | 65      |
| 3   | Avoid fetch-then-update race conditions    | Data corruption in stats          | 72      |
| 4   | Server Components: Use Supabase, not fetch | Broke entire page                 | 55      |
| 5   | Regenerate types after migrations          | 125 errors resolved               | 67      |
| 6   | Check for duplicate Next.js processes      | 30 min debugging wasted           | 55      |

---

## 🔗 Related Documentation

- [DATABASE_SCHEMA.md](../../DATABASE_SCHEMA.md) - Complete schema reference
- [CLAUDE.md](../../CLAUDE.md) - Development rules and protocols
- [PROGRESS.md](../../PROGRESS.md) - Current project state
- [docs/archive/progress/](../archive/progress/) - Historical session details

---

**Note:** This file should be updated whenever a critical bug teaches a new pattern. Add new lessons at the top of their respective sections with session reference.
