# BarberApp

BarberApp is a web app for barbershops to manage appointments, clients, services, and staff, and to offer a branded online booking experience to customers.

## What the app does

- Provides a public booking page per business (e.g. /reservar/[slug])
- Lets owners manage appointments, services, clients, and staff from a dashboard
- Calculates availability based on operating hours, service duration, and buffer time
- Supports multi-barber teams with active/inactive status and invitation flow
- Tracks client history, spend, and segmentation (VIP/frequent/new/inactive)
- Allows brand customization (colors + logo) for the public booking page
- RBAC with 4 roles: super admin, business owner, barber, client
- Push notifications (VAPID/Web Push) for booking confirmations, reminders, and alerts
- Client dashboard (`/mi-cuenta`) with booking history, live tracking, and loyalty
- Public live tracking (`/track/[token]`) with Uber-style 5-state progress
- Smart duration prediction from historical data (per-barber, per-service)
- Demand-based discount scheduling (promo rules for low-demand hours)
- SINPE advance payment with proof verification (upload or WhatsApp)
- Client cancel/reschedule from tracking page with configurable policy
- PWA-friendly with installable experience (manifest + service worker)

## Primary user flows

Owner / admin

1. Sign up and log in
2. Configure business info, hours, buffer time, and branding
3. Create services and invite barbers
4. Share the public booking link
5. Manage appointments, clients, and analytics from the dashboard

Barber

1. Accept invitation email and set password
2. View daily agenda on Mi Dia
3. Check-in > Complete > Payment method (3 taps max)
4. Use "Llega Antes" to notify next client when finishing early

Client

1. Open the booking link
2. Choose a service (and barber if applicable)
3. Pick date and time (see discounts on low-demand slots)
4. Enter contact info and confirm
5. Optionally pay in advance via SINPE for a discount
6. Track appointment status in real-time via tracking link

## Main sections

- Public marketing page: /
- Auth: /login, /register, /forgot-password, /reset-password
- Dashboard: /dashboard (owner)
- Mi Dia: /mi-dia (barber daily view)
- Appointments: /citas
- Clients: /clientes
- Services: /servicios
- Barbers: /barberos
- Analytics: /analiticas
- Settings: /configuracion (7 subroutes)
- Client Portal: /mi-cuenta
- Public booking: /reservar/[slug]
- Live tracking: /track/[token]
- Super Admin: /admin/\*

## Tech stack

- Next.js 16 + React 19 (App Router)
- Tailwind CSS v4
- Supabase (Auth, Postgres, Storage, Realtime)
- Zod validation
- Framer Motion UI animations
- Deployed on Vercel

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

- Canonical migrations live in `supabase/migrations` (`001` through `037`).
- Schema documentation: `DATABASE_SCHEMA.md` (single source of truth).
- Optional seed file: `supabase/seed_test_data.sql`
- Demo data helper: `scripts/create-demo-user.ts` (requires SUPABASE_SERVICE_ROLE_KEY)

## Notes

- Booking availability is calculated server-side via `/api/public/[slug]/availability`.
- The public booking page injects a dynamic PWA manifest via `/api/public/[slug]/manifest`.
- See `ROADMAP.md` for what's next and `DECISIONS.md` for architectural rationale.
