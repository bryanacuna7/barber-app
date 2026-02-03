# Feature Specifications

Detailed specifications for implemented and planned features.

---

## Implemented Features

### [Business Referral System](referral-system.md)

**Status:** ✅ Complete (Sessions 54-65)
**Phases:** 6 phases implemented

**Overview:**

- B2B referral program with milestone rewards
- QR code generation and tracking
- Cookie-based conversion tracking
- Admin analytics dashboard
- Business owner dashboard

**Components:**

- 8 API endpoints
- 10 React components
- Database tables: business_referrals, referral_conversions

**Documentation:**

- Implementation: [docs/archive/progress/sessions-54-65.md](../archive/progress/sessions-54-65.md)
- Current state: Working in production

---

## Planned Features

See [docs/planning/implementation-v2.5.md](../planning/implementation-v2.5.md) for upcoming features:

1. **Client Subscription & Basic Plan** (Área 1)
2. **Staff Experience - Vista Mi Día** (Área 6)
3. **Advance Payments & No-Show** (Área 2)
4. **Rebranding Barber → Staff** (Área 3)
5. **Client Referrals + Full Dashboard** (Área 4)
6. **Web Push Notifications** (Área 5)

---

## Specification Template

When creating a new feature spec:

```markdown
# [Feature Name] Specification

## Overview

- **Goal:** What this feature does
- **Users:** Who uses it
- **Value:** Why we're building it

## User Stories

- As a [user type], I want [goal] so that [benefit]

## Requirements

### Functional

1. Must have X
2. Must support Y

### Non-Functional

- Performance: [metrics]
- Security: [requirements]
- Accessibility: WCAG AA

## Technical Design

### Database Schema

- Tables: [list]
- Relationships: [diagram]

### API Endpoints

- GET /api/...
- POST /api/...

### UI Components

- Component 1: [description]
- Component 2: [description]

## Implementation Plan

- Phase 1: Backend (X hours)
- Phase 2: Frontend (Y hours)
- Phase 3: Testing (Z hours)

## Success Metrics

- [How we measure success]

## Risks & Mitigations

- Risk 1: [mitigation]
```

---

## Related Documentation

- [../planning/](../planning/) - Implementation plans
- [../../PROGRESS.md](../../PROGRESS.md) - Implementation status
- [../../DATABASE_SCHEMA.md](../../DATABASE_SCHEMA.md) - Database schema
