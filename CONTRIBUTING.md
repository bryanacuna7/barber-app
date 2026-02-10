# Contributing to BarberApp

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account (for database access)

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Run dev server: `npm run dev`

---

## 📚 Required Reading

Before making changes, read these critical documents:

| Document                                                               | Purpose                | When to Read            |
| ---------------------------------------------------------------------- | ---------------------- | ----------------------- |
| [GUARDRAILS.md](GUARDRAILS.md)                                         | Non-negotiable rules   | **BEFORE ANY CODE**     |
| [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)                               | Database structure     | **BEFORE DB CHANGES**   |
| [docs/reference/lessons-learned.md](docs/reference/lessons-learned.md) | Critical bug patterns  | **BEFORE CODING**       |
| [DECISIONS.md](DECISIONS.md)                                           | Architecture rationale | When changing structure |
| [CLAUDE.md](CLAUDE.md)                                                 | AI agent workflow      | If using Claude Code    |

---

## 🔄 Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

**Branch naming:**

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `chore/` - Maintenance tasks

### 2. Make Changes

**Critical Rules:**

- ⚠️ **Database Changes:** ALWAYS verify columns exist in [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) first
- ⚠️ **TypeScript:** No `@ts-ignore` or `any` types without justification
- ⚠️ **Tests:** Add tests for new features
- ⚠️ **Security:** Never commit secrets, API keys, or credentials

### 3. Test Your Changes

```bash
# Type check
npx tsc --noEmit

# Run tests
npm test

# Build verification
npm run build

# Security audit
npm audit
```

### 4. Commit

Use conventional commit format:

```
<type>(<scope>): <description>

- What: Observable change
- Why: Reason for change
- Verify: How to confirm it works
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

**Example:**

```
feat(appointments): add "completed" status with RLS policies

- What: Appointments can now be marked as completed
- Why: Barbers need to track finished appointments for stats
- Verify: Change appointment status to "completed" in UI

Co-Authored-By: Your Name <your.email@example.com>
```

### 5. Push and Create PR

```bash
git push -u origin feature/your-feature-name
```

Then create a pull request on GitHub.

---

## 🔒 Security Guidelines

### Critical Security Rules

1. **Never commit secrets**
   - Use `.env` for sensitive data
   - Check `.gitignore` includes `.env`
   - Use `NEXT_PUBLIC_` prefix only for truly public vars

2. **Database Security**
   - All queries must use parameterized statements
   - Enable RLS (Row Level Security) on all tables
   - Triggers that modify tables with RLS need `SECURITY DEFINER`

3. **API Endpoints**
   - Validate all user input
   - Rate limit public endpoints
   - File uploads: Validate with magic bytes (not just MIME type)
   - Auth: Verify user permissions before operations

4. **XSS Prevention**
   - Never use `dangerouslySetInnerHTML` without sanitization
   - Sanitize user input before rendering

### Security Checklist

Before committing auth/payment code:

```
□ No hardcoded secrets
□ No SQL injection (parameterized queries only)
□ No XSS vulnerabilities (sanitized innerHTML)
□ Input validation on all user inputs
□ Rate limiting on public endpoints
□ File validation with magic bytes
```

---

## 🗄️ Database Changes

### Mandatory Protocol

**BEFORE creating migrations or queries:**

```
□ 1. Read DATABASE_SCHEMA.md completely
□ 2. Verify tables exist in schema document
□ 3. Verify columns exist with EXACT names
□ 4. Check "Tables That DO NOT Exist" section
□ 5. Never assume future features are implemented
```

### Creating Migrations

1. **Verify schema first** (see checklist above)
2. **Create migration file:**
   ```bash
   # Format: XXX_descriptive_name.sql
   supabase/migrations/022_add_feature_name.sql
   ```
3. **Include in migration:**
   - Tables/columns creation
   - Indexes for performance
   - RLS policies
   - Trigger functions with `SECURITY DEFINER` if needed
4. **Update DATABASE_SCHEMA.md** with new schema
5. **Commit migration + schema doc together**

### Migration Template

```sql
-- Migration: [Description]
-- Created: YYYY-MM-DD

BEGIN;

-- Create table
CREATE TABLE IF NOT EXISTS your_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "policy_name" ON your_table
  FOR SELECT USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_your_table_lookup
  ON your_table(column_name);

COMMIT;
```

---

## 🧪 Testing

### Test Requirements

- **Unit tests:** For utility functions and business logic
- **Integration tests:** For API endpoints
- **E2E tests:** For critical user flows

### Running Tests

```bash
npm test                  # Run all tests
npm test -- --coverage    # With coverage report
npm run test:e2e          # E2E tests
```

### Writing Tests

```typescript
// Example: Unit test
describe('calculateDiscount', () => {
  it('applies 10% discount for tier silver', () => {
    expect(calculateDiscount(100, 'silver')).toBe(90)
  })

  it('throws error for invalid tier', () => {
    expect(() => calculateDiscount(100, 'invalid')).toThrow()
  })
})
```

---

## 📝 Documentation

### When to Update Docs

- **New feature:** Create spec in `docs/specs/`
- **Breaking change:** Update [DECISIONS.md](DECISIONS.md)
- **DB schema change:** Update [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
- **Critical bug:** Add to [docs/reference/lessons-learned.md](docs/reference/lessons-learned.md)
- **API change:** Update API documentation

### Documentation Style

- Use clear, concise language
- Include code examples
- Link related documents
- Keep docs up-to-date with code

---

## 🚫 Common Mistakes to Avoid

### Database

- ❌ Assuming columns exist without checking DATABASE_SCHEMA.md
- ❌ Forgetting `SECURITY DEFINER` on triggers that modify RLS tables
- ❌ Creating migrations without updating DATABASE_SCHEMA.md

### Code

- ❌ Using `fetch()` in Server Components (use direct Supabase client)
- ❌ Not regenerating types after DB migrations
- ❌ Multiple Next.js dev servers running (check with `lsof -i :3000`)

### Security

- ❌ Trusting MIME types for file validation (use magic bytes)
- ❌ Not rate-limiting public endpoints
- ❌ Using user input in SQL without parameterization

See [docs/reference/lessons-learned.md](docs/reference/lessons-learned.md) for full list.

---

## 📋 Pull Request Checklist

Before submitting your PR:

```
□ Code follows project style and conventions
□ All tests pass (npm test)
□ TypeScript compiles without errors (npx tsc --noEmit)
□ No console.log statements in production code
□ Documentation updated if needed
□ DATABASE_SCHEMA.md updated for DB changes
□ Commit messages follow conventional format
□ No secrets or sensitive data committed
□ PR description explains what/why/how
```

---

## 💡 Getting Help

- **Questions?** Open a GitHub issue
- **Bug found?** Check [docs/reference/lessons-learned.md](docs/reference/lessons-learned.md) first
- **Architecture decisions?** See [DECISIONS.md](DECISIONS.md)

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's license.

---

**Last Updated:** 2026-02-03 (Session 70 - Documentation Reorganization)
