# Changelog

All notable changes to BarberShop Pro will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### In Progress

- **Área 0: Technical Debt Cleanup** (Task 4 - 80% complete)
  - 15 TypeScript errors remaining (down from 201)
  - See [PROGRESS.md](PROGRESS.md) for details

### Planned

See [docs/planning/implementation-v2.5.md](docs/planning/implementation-v2.5.md) for full roadmap:

1. Client Subscription & Basic Plan
2. Staff Experience - Vista Mi Día
3. Advance Payments & No-Show
4. Rebranding Barber → Staff
5. Client Referrals + Full Dashboard
6. Web Push Notifications
7. Testing & QA Sprint

---

## [0.9.0] - 2026-02-03

### Added

- **Observability Infrastructure**
  - Structured logging with Pino (logger.ts)
  - Sentry error tracking (client + server + edge)
  - Distributed rate limiting with Upstash Redis
  - Error boundary components

- **Security Hardening**
  - IP spoofing protection in rate limiters
  - File validation with magic bytes (not just MIME types)
  - Path traversal prevention
  - Authorization refactored in 4 admin endpoints

- **Performance Optimization**
  - 7 database indexes created (4-8x query speedup)
  - N+1 query fix in admin businesses endpoint (61 → 4 queries, 15x faster)

- **Documentation**
  - DATABASE_SCHEMA.md (complete schema reference, source of truth)
  - LESSONS_LEARNED.md (11 critical patterns from real bugs)
  - Database Change Protocol in CLAUDE.md
  - Documentation reorganization (planning, reference, specs, archive)
  - PROGRESS.md optimization (1,167 → 309 lines)

- **Database**
  - Migration 019b: Performance indexes
  - Migration 020: Loyalty trigger error handling
  - Migration 021: RLS policies for barber_stats + SECURITY DEFINER

### Fixed

- **Critical: Appointments "Completed" Status** (Session 69)
  - Fixed RLS violation when marking appointments as completed
  - Added 3 RLS policies to barber_stats table
  - Added SECURITY DEFINER to trigger functions

- **TypeScript**
  - Reduced errors from 201 → 15 (92.5% reduction)
  - Regenerated Supabase types (1,624 lines)
  - Created custom types system (30+ type definitions)
  - Fixed Suspense boundary in /register page

### Changed

- Server Components now use direct Supabase queries (not internal fetch)
- Archive files organized by date (2026-01/)
- Spec files use lowercase-with-hyphens naming

---

## [0.8.0] - 2026-02-02

### Added

- **Business Referral System** (Complete - 6 Phases)
  - 8 API endpoints (referral management + admin analytics)
  - 10 React components (business + admin dashboards)
  - QR code generation and tracking
  - Cookie-based conversion tracking (30-day persistence)
  - Milestone-based rewards system
  - Admin analytics dashboard with Recharts
  - Database migration 019: business_referrals, referral_conversions tables

- **Claude Code Infrastructure**
  - Clean-up scripts for AI assistant directories
  - 8 skill symlinks (error-handling, security-scanning, etc.)

- **Documentation**
  - Implementation Plan v2.5 (post-multi-expert audit)
  - CLIENT_REFERRAL_DASHBOARD_PLAN.md
  - REFERRAL_SYSTEM_PLAN.md

### Fixed

- **Critical: Authentication in /referencias** (Session 55)
  - Server Components fetch doesn't pass cookies
  - Fixed by using direct Supabase client queries

- Navigation links for Referencias in both business and admin sidebars
- Layout group bug (admin sidebar not persisting)
- npm security vulnerabilities (tar package)

### Changed

- Branch cleanup: Merged feature/gamification-system → main
- Deleted 4 old branches
- Main branch updated (+16,062 lines)

---

## [0.7.0] - 2026-01-28

### Added

- **Gamification System Complete**
  - Phase 1: Client Loyalty (points, tiers, rewards)
  - Phase 2: Barber Gamification (achievements, leaderboards, challenges)
  - Phase 3: Business Referral System (see 0.8.0)

- **Database Migrations**
  - 015: Notification trigger fix
  - 016: Loyalty programs RLS
  - 017: Public read for loyalty programs
  - 018: Barber gamification tables

### Fixed

- Loyalty program RLS policies
- Notification trigger errors

---

## [0.6.0] - 2026-01-15

### Added

- PWA support with offline capabilities
- Branding customization for businesses
- Automatic notifications system
- Dashboard administrativo completo

---

## [0.5.0] - 2026-01-01

### Added

- Sistema de reservas online público (/reservar/[slug])
- Client booking flow with availability checking
- Barbero management
- Services management

---

## Guidelines for Updating CHANGELOG

### When to Update

- After completing a significant feature
- Before creating a release/deploy
- When fixing critical bugs

### Format

```markdown
### Added

- New features

### Changed

- Changes in existing functionality

### Deprecated

- Soon-to-be removed features

### Removed

- Removed features

### Fixed

- Bug fixes

### Security

- Security improvements
```

### Version Numbering

- **Major (1.0.0):** Breaking changes, major new features
- **Minor (0.x.0):** New features, non-breaking changes
- **Patch (0.0.x):** Bug fixes, small improvements

---

**Last Updated:** 2026-02-03 (Session 70)
