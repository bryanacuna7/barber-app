import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { detectUserRole, getStaffPermissions, canBarberAccessPath } from '@/lib/auth/roles'
import { Sidebar } from '@/components/dashboard/sidebar'
import { MobileHeader } from '@/components/dashboard/mobile-header'
import { BottomNav } from '@/components/dashboard/bottom-nav'
import { ThemeProvider } from '@/components/theme-provider'
import { TrialBanner } from '@/components/subscription/trial-banner'
import { TourProvider } from '@/lib/tours/tour-provider'
import { TourTooltip } from '@/components/tours/tour-tooltip'
import { BusinessProvider } from '@/contexts/business-context'
import { CommandPaletteProvider } from '@/components/dashboard/command-palette'
import { AlertTriangle, Lock } from 'lucide-react'
import { OfflineBanner } from '@/components/dashboard/offline-banner'
import { InstallPrompt } from '@/components/pwa/install-prompt'

const manifestVersion =
  process.env.NEXT_PUBLIC_MANIFEST_VERSION ?? process.env.VERCEL_GIT_COMMIT_SHA ?? '1'

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return {}

  const roleInfo = await detectUserRole(supabase, user.id)
  if (!roleInfo?.businessId) return {}

  const { data: business } = await supabase
    .from('businesses')
    .select('name, slug')
    .eq('id', roleInfo.businessId)
    .maybeSingle()

  const businessName = business?.name?.trim()
  if (!businessName) return {}

  const params = new URLSearchParams({
    businessName,
    v: manifestVersion,
  })

  if (business.slug) {
    params.set('businessSlug', business.slug)
  }

  return {
    applicationName: businessName,
    manifest: `/api/pwa/manifest?${params.toString()}`,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: businessName,
    },
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Detect user role (admin > owner > barber > client)
  const roleInfo = await detectUserRole(supabase, user.id)

  // Client role → redirect to client dashboard
  if (roleInfo?.role === 'client') {
    redirect('/mi-cuenta')
  }

  // No role found — not owner, not barber, not admin, not client
  if (!roleInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <AlertTriangle className="h-8 w-8 text-muted" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-white">
            Sin Negocio Registrado
          </h1>
          <p className="mt-2 text-muted">
            No tienes un negocio asociado a tu cuenta. Por favor contacta a soporte.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Link
              href="/login"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Cerrar Sesión
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Admin without business: show context switcher
  if (roleInfo.isAdmin && !roleInfo.businessId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <AlertTriangle className="h-8 w-8 text-muted" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-white">
            Selecciona tu contexto
          </h1>
          <p className="mt-2 text-muted">
            Tu cuenta es admin y no tiene negocio asociado. Puedes ir al panel admin o crear un
            negocio para usar el dashboard operativo.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/admin"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Ir al Panel Admin
            </Link>
            <Link
              href="/onboarding"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Crear negocio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Fetch business data AND onboarding in parallel to reduce TTFB
  // staff_permissions from migration 027 — not in generated types yet, using `as any`
  const businessSelect =
    'id, name, brand_primary_color, brand_secondary_color, logo_url, is_active, staff_permissions' as any
  const needsOnboarding = roleInfo.isOwner && !roleInfo.isAdmin && !pathname.includes('/onboarding')

  const [businessResult, onboardingResult] = await Promise.all([
    (roleInfo.isOwner
      ? supabase.from('businesses').select(businessSelect).eq('owner_id', user.id).single()
      : supabase
          .from('businesses')
          .select(businessSelect)
          .eq('id', roleInfo.businessId)
          .single()) as unknown as Promise<{ data: any }>,
    needsOnboarding && roleInfo.businessId
      ? supabase
          .from('business_onboarding')
          .select('completed')
          .eq('business_id', roleInfo.businessId)
          .single()
      : Promise.resolve({ data: null }),
  ])

  const business = businessResult.data

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <AlertTriangle className="h-8 w-8 text-muted" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-white">
            Sin Negocio Registrado
          </h1>
          <p className="mt-2 text-muted">
            No tienes un negocio asociado a tu cuenta. Por favor contacta a soporte.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Link
              href="/login"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Cerrar Sesión
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const businessName = business.name || 'Mi Barbería'
  const brandColor = business.brand_primary_color || '#27272A'
  const brandSecondary = business.brand_secondary_color || null
  const logoUrl = business.logo_url || null
  const isActive = business.is_active ?? true
  const staffPermissions = getStaffPermissions(business.staff_permissions)
  const isCitasRoute = pathname.startsWith('/citas')
  const isMiDiaRoute = pathname.startsWith('/mi-dia')

  // Check onboarding status (already fetched in parallel above)
  if (
    needsOnboarding &&
    onboardingResult.data &&
    !(onboardingResult.data as { completed: boolean }).completed
  ) {
    redirect('/onboarding')
  }

  // If business is inactive, show suspended message (skip for admin)
  if (!isActive && !roleInfo.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-white">
            Negocio Suspendido
          </h1>
          <p className="mt-2 text-muted">
            Tu negocio ha sido suspendido. Por favor contacta a soporte para más información.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Link
              href="/login"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Cerrar Sesión
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Page guard for barbers: check if they can access the current page
  const isBarberDenied =
    roleInfo.role === 'barber' && pathname && !canBarberAccessPath(pathname, staffPermissions)

  // Barber landing: redirect root/dashboard to mi-dia
  if (roleInfo.role === 'barber' && (pathname === '/dashboard' || pathname === '')) {
    redirect('/mi-dia')
  }

  return (
    <BusinessProvider
      businessId={business.id}
      userId={user.id}
      userEmail={user.email}
      userRole={roleInfo.role}
      isOwner={roleInfo.isOwner}
      isBarber={roleInfo.isBarber}
      isAdmin={roleInfo.isAdmin}
      barberId={roleInfo.barberId}
      staffPermissions={staffPermissions}
    >
      <TourProvider businessId={business.id}>
        <CommandPaletteProvider>
          <div className="min-h-screen">
            <ThemeProvider primaryColor={brandColor} secondaryColor={brandSecondary} />
            <OfflineBanner />
            {roleInfo.isOwner && (
              <Sidebar businessName={businessName} logoUrl={logoUrl} isAdmin={roleInfo.isAdmin} />
            )}

            {/* Mobile header with notification bell (self-managed by pathname on client) */}
            <MobileHeader businessName={businessName} logoUrl={logoUrl} />

            {/* Main content */}
            <main id="main-content" className={roleInfo.isOwner ? 'lg:pl-64' : ''}>
              <div
                className={
                  isCitasRoute || isMiDiaRoute
                    ? 'px-4 pt-0 pb-24 sm:px-6 sm:py-6 lg:px-8 lg:py-7 lg:pb-10'
                    : 'px-4 py-5 pb-24 sm:px-6 sm:py-6 lg:px-8 lg:py-7 lg:pb-10'
                }
              >
                {roleInfo.isOwner && <TrialBanner />}
                {isBarberDenied ? <AccessDenied /> : children}
              </div>
            </main>

            {/* Mobile bottom navigation */}
            <BottomNav isAdmin={roleInfo.isAdmin} isBarber={roleInfo.isBarber} />

            {/* Tour tooltip overlay (owner only) */}
            {roleInfo.isOwner && <TourTooltip />}

            {/* PWA install prompt (contextual, shows after 3 visits) */}
            <InstallPrompt />
          </div>
        </CommandPaletteProvider>
      </TourProvider>
    </BusinessProvider>
  )
}

function AccessDenied() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-sm w-full text-center px-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <Lock className="h-7 w-7 text-zinc-400 dark:text-zinc-500" />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-zinc-900 dark:text-white">
          Acceso restringido
        </h2>
        <p className="mt-2 text-sm text-muted">Esta sección no está habilitada para tu rol.</p>
        <Link
          href="/mi-dia"
          className="mt-6 inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-medium text-white"
          style={{ backgroundColor: 'var(--brand-primary)' }}
        >
          Ir a Mi Día
        </Link>
      </div>
    </div>
  )
}
