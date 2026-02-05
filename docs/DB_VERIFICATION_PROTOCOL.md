# Database Schema Verification Protocol

**Created:** Session 110 (Pre-Implementation Requirements)
**Purpose:** Enforce CLAUDE.md critical rule - never assume database columns exist

---

## 🚨 Why This Protocol Exists

**Problem:** Wasted hours debugging queries that reference non-existent columns (e.g., `deposit_paid`, `last_activity_at`).

**Solution:** Mandatory verification against `DATABASE_SCHEMA.md` before ANY database work.

---

## ✅ When to Verify

**MANDATORY verification before:**

1. ✅ Creating migrations
2. ✅ Writing database queries (SELECT, INSERT, UPDATE, DELETE)
3. ✅ Creating indexes
4. ✅ Creating data adapters
5. ✅ Referencing columns in TypeScript types

**NO exceptions.** This protocol is blocking.

---

## 📋 Pre-Implementation Checklist

Before starting ANY database-related work:

```markdown
- [ ] Read DATABASE_SCHEMA.md completely (5 min)
- [ ] Verify table exists in schema
- [ ] Verify all columns exist with EXACT names
- [ ] Check "Tables/Columns That DO NOT Exist" section
- [ ] Cross-reference with db-schema-validator.ts VERIFIED_SCHEMA
- [ ] If unsure, use validation functions from db-schema-validator.ts
```

---

## 🛠️ How to Use db-schema-validator.ts

### 1. Verify Column Exists (Throws Error)

```typescript
import { verifyColumn } from '@/lib/db-schema-validator'

// ✅ This passes
verifyColumn('clients', 'last_visit_at')

// ❌ This throws error
verifyColumn('clients', 'last_activity_at')
// Error: Column 'last_activity_at' does NOT exist in table 'clients'
```

### 2. Verify Multiple Columns

```typescript
import { verifyColumns } from '@/lib/db-schema-validator'

verifyColumns('appointments', ['id', 'client_id', 'service_id', 'barber_id', 'scheduled_at'])
```

### 3. Safe Check (Returns Boolean)

```typescript
import { columnExists } from '@/lib/db-schema-validator'

if (columnExists('appointments', 'deposit_paid')) {
  // Use deposit feature
} else {
  // Feature not implemented yet
}
```

### 4. Validate Query Before Execution

```typescript
import { validateQuery } from '@/lib/db-schema-validator'

// Before running Supabase query
validateQuery('appointments', ['id', 'client_id', 'scheduled_at', 'status'])

const { data, error } = await supabase
  .from('appointments')
  .select('id, client_id, scheduled_at, status')
```

---

## 🚫 Common Mistakes to Avoid

### ❌ Mistake 1: Assuming Future Features Exist

```typescript
// ❌ WRONG - deposit_paid doesn't exist yet
const { data } = await supabase.from('appointments').select('*, deposit_paid')
```

**Solution:** Check DATABASE_SCHEMA.md first. `deposit_paid` is in "Columns That DO NOT Exist" section.

### ❌ Mistake 2: Using Wrong Column Names

```typescript
// ❌ WRONG - column is last_visit_at, not last_activity_at
const { data } = await supabase.from('clients').select('last_activity_at')
```

**Solution:** Use exact column names from DATABASE_SCHEMA.md.

### ❌ Mistake 3: Trusting Planning Documents

```typescript
// ❌ WRONG - implementation-v2.5.md describes FUTURE state
// Don't trust planning docs for current schema
```

**Solution:** ONLY trust `DATABASE_SCHEMA.md` (single source of truth).

---

## 🔄 After Creating Migration

**MANDATORY steps:**

1. ✅ Update `DATABASE_SCHEMA.md` with new columns/tables
2. ✅ Update `src/lib/db-schema-validator.ts` VERIFIED_SCHEMA
3. ✅ Guide user to execute migration in Supabase Dashboard
4. ✅ Wait for user confirmation before proceeding
5. ✅ Commit both migration + updated docs together

---

## 📊 Advanced: Direct Supabase Verification

If you have Supabase connection, verify schema directly:

```sql
-- List all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- List columns for specific table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'appointments';

-- Check if column exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_name = 'appointments' AND column_name = 'deposit_paid'
);
```

---

## 🎯 Examples

### ✅ Good Practice

```typescript
import { verifyColumns } from '@/lib/db-schema-validator'

// 1. Verify before query
verifyColumns('clients', ['name', 'phone', 'last_visit_at'])

// 2. Run query
const { data } = await supabase
  .from('clients')
  .select('name, phone, last_visit_at')
  .eq('business_id', businessId)
```

### ❌ Bad Practice

```typescript
// No verification - assumes columns exist
const { data } = await supabase.from('clients').select('name, phone, last_activity_at') // ❌ Wrong column name!
```

---

## 🔍 Quick Reference

| Action                | Tool                            |
| --------------------- | ------------------------------- |
| Read schema           | `DATABASE_SCHEMA.md`            |
| Verify column exists  | `verifyColumn(table, column)`   |
| Verify multiple       | `verifyColumns(table, columns)` |
| Safe check (boolean)  | `columnExists(table, column)`   |
| Get available columns | `getAvailableColumns(table)`    |
| Get missing columns   | `getMissingColumns(table)`      |
| Validate before query | `validateQuery(table, columns)` |
| Log schema info       | `logSchemaInfo(table)`          |

---

## 📝 Summary

**Golden Rule:** If you haven't read `DATABASE_SCHEMA.md` in the last 30 minutes, read it again.

**Zero Tolerance:** No database code without verification. Period.

**Single Source of Truth:** `DATABASE_SCHEMA.md` (NOT planning docs, NOT assumptions).
