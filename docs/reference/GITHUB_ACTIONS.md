# GitHub Actions CI/CD

Automated testing and quality checks for every PR and push.

## Workflows

### 1. CI - Tests (`ci.yml`)

**Triggers:** Push or PR to `main` or `develop`

**Jobs:**

- **test** - Run all tests
  - Unit tests (Vitest): 20 tests
  - E2E tests (Playwright): Full user flow testing
  - Uploads test results on failure

- **build** - Verify production build
  - Builds Next.js application
  - Skips TypeScript checking (uses `build:skip-ts`)
  - Uses mock environment variables for build

**Duration:** ~10 minutes

### 2. Lint & Format (`lint.yml`)

**Triggers:** Push or PR to `main` or `develop`

**Jobs:**

- **lint** - ESLint code quality
  - Continues on error (non-blocking)
  - Reports warnings but doesn't fail CI

- **format** - Prettier formatting
  - Checks code formatting
  - Fails if files are not formatted

**Duration:** ~5 minutes

### 3. TypeScript Check (`ci.yml`)

**Triggers:** Push or PR to `main` or `develop`

**Jobs:**

- **typecheck** - TypeScript validation
  - Continues on error (non-blocking)
  - Reports type errors but doesn't fail CI

**Duration:** ~5 minutes

## Local CI Commands

```bash
# Run full CI check locally
npm run ci

# Individual checks
npm run format:check  # Prettier formatting
npm run test:unit     # Unit tests
npm run build:skip-ts # Production build

# Full suite with E2E
npm run ci:full

# Lint separately (warnings only)
npm run ci:lint
```

## CI Strategy

### Blocking Checks (Must Pass)

- ✅ Prettier formatting
- ✅ Unit tests
- ✅ Production build

### Non-Blocking Checks (Warning Only)

- ⚠️ ESLint (reports issues but doesn't block)
- ⚠️ TypeScript (reports errors but doesn't block)

**Rationale:** Allows gradual improvement of code quality without blocking development. New code should aim to pass all checks, but existing issues don't prevent deployment.

## Environment Variables

The CI uses mock values for builds:

```yaml
NEXT_PUBLIC_SUPABASE_URL: https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY: placeholder-key
RESEND_API_KEY: placeholder-key
```

To use real values, add them as GitHub Secrets:

1. Go to repo Settings → Secrets and variables → Actions
2. Add secrets with the same names

## Status Badges

Add to README.md:

```markdown
![CI Tests](https://github.com/YOUR_USERNAME/barber-app/workflows/CI%20-%20Tests/badge.svg)
![Lint](https://github.com/YOUR_USERNAME/barber-app/workflows/Lint%20%26%20Format/badge.svg)
```

## Adding Deploy Automation

When ready to add auto-deploy to Vercel:

1. Install Vercel CLI: `npm i -g vercel`
2. Link project: `vercel link`
3. Get tokens:
   ```bash
   vercel whoami  # Get your username
   vercel project ls  # Get project ID
   ```
4. Add GitHub Secrets:
   - `VERCEL_TOKEN` - From vercel.com/account/tokens
   - `VERCEL_ORG_ID` - Your team/user ID
   - `VERCEL_PROJECT_ID` - From project settings
5. Uncomment deploy workflow in `.github/workflows/deploy-preview.yml`

## Troubleshooting

### CI Failing Locally But Passing on GitHub

- Check Node version: `node -v` (should be 20.x)
- Clear caches: `rm -rf node_modules .next && npm install`
- Check environment: `cat .env.local`

### Tests Timing Out

- Increase timeout in `vitest.config.ts` or `playwright.config.ts`
- Check for network-dependent tests

### Build Failing

- Verify all environment variables are set
- Check `build:skip-ts` works locally
- Review build logs for specific errors

## Next Steps

- [ ] Add E2E test coverage
- [ ] Enable TypeScript strict mode gradually
- [ ] Fix ESLint warnings over time
- [ ] Add Lighthouse performance checks
- [ ] Setup Vercel auto-deploy
