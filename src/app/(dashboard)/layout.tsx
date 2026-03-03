import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { detectUserRole, getStaffPermissions, type UserRoleInfo } from '@/lib/auth/roles'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { MobileHeader } from '@/components/dashboard/mobile-header'
import { BottomNav } from '@/components/dashboard/bottom-nav'
import { ThemeProvider } from '@/components/theme-provider'
import { TrialBanner } from '@/components/subscription/trial-banner'
import { TourProvider } from '@/lib/tours/tour-provider'
import { TourTooltip } from '@/components/tours/tour-tooltip'
import { BusinessProvider } from '@/contexts/business-context'
import { CommandPaletteProvider } from '@/components/dashboard/command-palette'
import { AlertTriangle } from 'lucide-react'
import { OfflineBanner } from '@/components/dashboard/offline-banner'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import { OpenInAppBanner } from '@/components/pwa/open-in-app-banner'
import { NextUpChip } from '@/components/dashboard/next-up-chip'
import { normalizeDisplayBusinessName } from '@/lib/branding'
import { LogoutButton } from '@/components/dashboard/logout-button'
import { DashboardContentArea } from '@/components/dashboard/dashboard-content-area'
import { ShortcutProvider } from '@/lib/keyboard/shortcut-provider'

const manifestVersion =
  process.env.NEXT_PUBLIC_MANIFEST_VERSION ?? process.env.VERCEL_GIT_COMMIT_SHA ?? '1'

const businessSelect =
  'id, name, slug, brand_primary_color, brand_secondary_color, logo_url, is_active, staff_permissions'

type DashboardAuthContext = {
  user: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null
  roleInfo: UserRoleInfo | null
}

type DashboardBusiness = {
  id: string
  name: string
  slug: string | null
  brand_primary_color: string | null
  brand_secondary_color: string | null
  logo_url: string | null
  is_active: boolean | null
  staff_permissions: unknown
}

const getDashboardAuthContext = cache(async (): Promise<DashboardAuthContext> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, roleInfo: null }
  }

  const roleInfo = await detectUserRole(supabase, user.id)
  return { user, roleInfo }
})

const getDashboardBusiness = cache(
  async (businessId: string): Promise<DashboardBusiness | null> => {
    if (!businessId) return null

    const supabase = await createClient()
    const { data: business } = await supabase
      .from('businesses')
      .select(businessSelect)
      .eq('id', businessId)
      .maybeSingle()

    return (business as DashboardBusiness | null) ?? null
  }
)

const getBusinessOnboarding = cache(
  async (businessId: string): Promise<{ completed: boolean } | null> => {
    if (!businessId) return null

    const supabase = await createClient()
    const { data } = await supabase
      .from('business_onboarding')
      .select('completed')
      .eq('business_id', businessId)
      .maybeSingle()

    return data as { completed: boolean } | null
  }
)

export async function generateMetadata(): Promise<Metadata> {
  const { user, roleInfo } = await getDashboardAuthContext()
  if (!user) return {}
  if (!roleInfo?.businessId) return {}

  const business = await getDashboardBusiness(roleInfo.businessId)

  const businessName = normalizeDisplayBusinessName(business?.name)
  if (!businessName) return {}

  const params = new URLSearchParams({
    businessName,
    v: manifestVersion,
  })

  if (business?.slug) {
    params.set('businessSlug', business.slug)
  }

  return {
    title: {
      absolute: businessName,
    },
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
  const { user, roleInfo } = await getDashboardAuthContext()

  if (!user) {
    redirect('/login')
  }

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
            <LogoutButton className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
              Cerrar Sesión
            </LogoutButton>
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
  // This layout only serves (dashboard) routes — /onboarding is a separate route group,
  // so the old `!pathname.includes('/onboarding')` guard is unnecessary.
  const needsOnboarding = roleInfo.isOwner && !roleInfo.isAdmin

  const [business, onboardingResult] = await Promise.all([
    getDashboardBusiness(roleInfo.businessId),
    needsOnboarding ? getBusinessOnboarding(roleInfo.businessId) : Promise.resolve(null),
  ])

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
            <LogoutButton className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
              Cerrar Sesión
            </LogoutButton>
          </div>
        </div>
      </div>
    )
  }

  const businessName = normalizeDisplayBusinessName(business.name)
  const businessSlug = business.slug ?? undefined
  const brandColor = business.brand_primary_color || '#27272A'
  const brandSecondary = business.brand_secondary_color || null
  const logoUrl = business.logo_url || null
  const isActive = business.is_active ?? true
  const staffPermissions = getStaffPermissions(business.staff_permissions)

  // Check onboarding status (already fetched in parallel above)
  if (needsOnboarding && onboardingResult && !onboardingResult.completed) {
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
            <LogoutButton className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
              Cerrar Sesión
            </LogoutButton>
          </div>
        </div>
      </div>
    )
  }

  // Barber page guard + route-dependent padding moved to DashboardContentArea (client component)
  // to eliminate the headers() call that made this layout fully dynamic.

  return (
    <BusinessProvider
      businessId={business.id}
      slug={businessSlug}
      userId={user.id}
      userEmail={user.email}
      userName={
        (user.user_metadata?.full_name as string) ||
        (user.user_metadata?.name as string) ||
        undefined
      }
      userAvatarUrl={
        (user.user_metadata?.avatar_url as string) ||
        (user.user_metadata?.picture as string) ||
        undefined
      }
      userRole={roleInfo.role}
      isOwner={roleInfo.isOwner}
      isBarber={roleInfo.isBarber}
      isAdmin={roleInfo.isAdmin}
      barberId={roleInfo.barberId}
      staffPermissions={staffPermissions}
    >
      <TourProvider businessId={business.id}>
        <CommandPaletteProvider>
          <ShortcutProvider>
            <div className="min-h-screen">
              <ThemeProvider primaryColor={brandColor} secondaryColor={brandSecondary} />
              <OfflineBanner />

              {/* Mobile header with notification bell (self-managed by pathname on client) */}
              <MobileHeader businessName={businessName} logoUrl={logoUrl} />

              {roleInfo.isOwner ? (
                <DashboardShell
                  businessName={businessName}
                  businessSlug={businessSlug}
                  logoUrl={logoUrl}
                  isBarber={roleInfo.isBarber}
                >
                  <DashboardContentArea banner={<TrialBanner />}>{children}</DashboardContentArea>
                </DashboardShell>
              ) : (
                <main id="main-content">
                  <DashboardContentArea>{children}</DashboardContentArea>
                </main>
              )}

              {/* Next-up appointment chip — above bottom nav, outside /citas */}
              <NextUpChip />

              {/* Mobile bottom navigation */}
              <BottomNav isAdmin={roleInfo.isAdmin} isBarber={roleInfo.isBarber} />

              {/* Tour tooltip overlay (owner only) */}
              {roleInfo.isOwner && <TourTooltip />}

              {/* PWA install prompt (contextual, shows after 3 visits) */}
              <InstallPrompt />
              {/* Banner for iOS users who ended up in browser after OAuth redirect */}
              <OpenInAppBanner />
            </div>
          </ShortcutProvider>
        </CommandPaletteProvider>
      </TourProvider>
    </BusinessProvider>
  )
}
