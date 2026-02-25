# ui-shadcn — Wrapper Layer for External UI Libraries

This directory is the **only entry point** for shadcn/ui-derived components
(TanStack Table, React Hook Form, etc.) into BarberApp.

## Rules

### 1. All external UI imports go through wrappers

Files outside this directory must **NEVER** import directly from:

- `@tanstack/react-table`
- `react-hook-form`
- `@hookform/resolvers`

They import from `@/components/ui-shadcn/*` instead.

### 2. Allowlist for premium primitive imports

Wrappers in this directory **MAY** import from these `@/components/ui/` primitives:

- `Input` — Form field wrapper needs to connect RHF to our premium Input
- `Button` — DataTable pagination uses our premium Button
- `Badge` — Column renderers may use our premium Badge

**Any other import from `@/components/ui/` is prohibited.**

### 3. Design token compliance

Every component in this directory must use BarberApp's design tokens:

- CSS variables: `--surface-0/1/2`, `--text-1/2/3`, `--brand-primary`
- Border radius: 12px-20px (never shadcn's default 6px)
- Touch targets: 44px minimum
- Dark mode: individually tuned (not just inverted)

### 4. No Framer Motion inside wrappers

Animation wrappers go OUTSIDE these components (in the consuming page).
These components are pure structure + styling.

## Verification

```bash
# Allowlist check: only Input, Button, Badge from ui/
grep -r "from '@/components/ui" src/components/ui-shadcn/ | grep -v -E "/(input|button|badge)"
# ^ Must return empty

# No direct external imports outside this directory
grep -r "from '@tanstack/react-table'" src/ | grep -v ui-shadcn
grep -r "from 'react-hook-form'" src/ | grep -v ui-shadcn
# ^ Both must return empty
```
