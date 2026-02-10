# BarberApp

BarberApp is a web app for barbershops to manage appointments, clients, services, and staff, and to offer a branded online booking experience to customers.

## What the app does

- Provides a public booking page per business (e.g. /reservar/[slug])
- Lets owners manage appointments, services, clients, and staff from a dashboard
- Calculates availability based on operating hours, service duration, and buffer time
- Supports multi-barber teams with active/inactive status
- Tracks client history, spend, and segmentation (VIP/frequent/new/inactive)
- Allows brand customization (colors + logo) for the public booking page
- Includes authentication (sign up, login, password reset)
- PWA-friendly booking page (manifest + service worker)

## Primary user flows

Owner / admin

1. Sign up and log in
2. Configure business info, hours, buffer time, and branding
3. Create services and barbers
4. Share the public booking link
5. Manage appointments and clients from the dashboard

Client

1. Open the booking link
2. Choose a service (and barber if applicable)
3. Pick date and time
4. Enter contact info and confirm

## Main sections

- Public marketing page: /
- Auth: /login, /register, /forgot-password, /reset-password
- Dashboard: /dashboard
- Appointments: /citas
- Clients: /clientes
- Services: /servicios
- Barbers: /barberos
- Settings: /configuracion
- Public booking: /reservar/[slug]

## Tech stack

- Next.js App Router (Next.js 16 + React 19)
- Tailwind CSS v4
- Supabase (Auth, Postgres, Storage)
- Zod validation
- Framer Motion UI animations

## Local development

1. Install dependencies

```bash
npm install
```

2. Set environment variables in .env.local

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

3. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000

## Database and Supabase

- Canonical migrations live in `supabase/migrations` (currently `001` through `024`).
- Consolidated schema snapshots are available for manual setup:
  - `supabase/schema_part1_core.sql`
  - `supabase/schema_part2_features.sql`
  - `supabase/schema_part3_fixes_rbac.sql`
  - `supabase/full_schema.sql`
- Optional seed file: `supabase/seed_test_data.sql`
- Demo data helper: `scripts/create-demo-user.ts` (requires SUPABASE_SERVICE_ROLE_KEY)

## Notes

- Booking availability is calculated server-side via `/api/public/[slug]/availability`.
- The public booking page injects a dynamic PWA manifest via `/api/public/[slug]/manifest`.
