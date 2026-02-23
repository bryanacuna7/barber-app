---
description: Deployment command for production releases. Pre-flight checks and deployment execution.
---

# /deploy - Production Deployment

$ARGUMENTS

---

## Purpose

Handle production deployment with pre-flight checks, execution, and verification.

---

## Sub-commands

```
/deploy            - Interactive deployment wizard
/deploy check      - Run pre-deployment checks only
/deploy preview    - Deploy to preview/staging
/deploy production - Deploy to production
```

---

## Pre-Deployment Checklist

Before any deployment:

```markdown
## 🚀 Pre-Deploy Checklist

### Code Quality
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Linting passing (`npm run lint`)
- [ ] All tests passing (`npm test`)

### Security
- [ ] No hardcoded secrets
- [ ] Environment variables documented
- [ ] Dependencies audited (`npm audit`)

### Performance
- [ ] Bundle size acceptable
- [ ] No console.log statements
- [ ] Images optimized

### Documentation
- [ ] README updated
- [ ] CHANGELOG updated

### Ready to deploy? (y/n)
```

---

## Deployment Flow

```
┌─────────────────┐
│  /deploy        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Pre-flight     │
│  checks         │
└────────┬────────┘
         │
    Pass? ──No──► Fix issues
         │
        Yes
         │
         ▼
┌─────────────────┐
│  Build          │
│  application    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Deploy to      │
│  platform       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Health check   │
│  & verify       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ✅ Complete    │
└─────────────────┘
```

---

## Output Format

### Successful Deploy

```markdown
## 🚀 Deployment Complete

### Summary
- **Environment:** production
- **Platform:** [Vercel/Railway/etc]

### URLs
- 🌐 Production: https://app.example.com
- 📊 Dashboard: [platform dashboard URL]

### What Changed
- [change 1]
- [change 2]

### Health Check
✅ API responding (200 OK)
✅ All services healthy
```

### Failed Deploy

```markdown
## ❌ Deployment Failed

### Error
[Error description]

### Resolution
1. [Step to fix]
2. [Step to verify]
3. Try `/deploy` again
```

---

## Platform Support

| Platform | Detection | Command |
|----------|-----------|---------|
| Vercel | vercel.json | `npm run deploy:prod` |
| Railway | railway.toml | `railway up` |
| Netlify | netlify.toml | `netlify deploy --prod` |
| Docker | Dockerfile | `docker compose up -d` |

### IMPORTANT: Vercel Deploy Rule

**NEVER run `vercel deploy` or `vercel --prod` directly.**

Always use the npm scripts which run `scripts/deploy-with-push.sh`:
- `npm run deploy:prod` — production (git push + vercel deploy --prod)
- `npm run deploy:preview` — preview (git push + vercel deploy)

The script ensures `git push` happens BEFORE deploy, which triggers the Discord release notification via GitHub Actions. A PreToolUse hook blocks direct `vercel` commands.

---

## Examples

```
/deploy
/deploy check
/deploy preview
/deploy production
```
