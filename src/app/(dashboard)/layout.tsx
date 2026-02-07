import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/admin'
import { Sidebar } from '@/components/dashboard/sidebar'
import { MobileHeader } from '@/components/dashboard/mobile-header'
import { BottomNav } from '@/components/dashboard/bottom-nav'
import { ThemeProvider } from '@/components/theme-provider'
import { TrialBanner } from '@/components/subscription/trial-banner'
import { TourProvider } from '@/lib/tours/tour-provider'
import { TourTooltip } from '@/components/tours/tour-tooltip'
import { BusinessProvider } from '@/contexts/business-context'
import { AlertTriangle } from 'lucide-react'

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

  // Check if user is admin
  const isAdmin = !!(await verifyAdmin(supabase))

  // Get business info including is_active and ID
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, brand_primary_color, brand_secondary_color, logo_url, is_active')
    .eq('owner_id', user.id)
    .single()

  // If no business exists
  if (!business) {
    // Admin without business: explicit context switch (no silent redirect loop)
    if (isAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <AlertTriangle className="h-8 w-8 text-zinc-600 dark:text-zinc-400" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-white">
              Selecciona tu contexto
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
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
    // If regular user without business, show error message
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <AlertTriangle className="h-8 w-8 text-zinc-600 dark:text-zinc-400" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-white">
            Sin Negocio Registrado
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
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
  const brandColor = business.brand_primary_color || '#27272A' // Default monochrome
  const brandSecondary = business.brand_secondary_color || null
  const logoUrl = business.logo_url || null
  const isActive = business.is_active ?? true

  // Check onboarding status (skip for admin and if already on onboarding page)
  if (!isAdmin && !pathname.includes('/onboarding')) {
    const { data: onboarding } = await supabase
      .from('business_onboarding')
      .select('completed')
      .eq('business_id', business.id)
      .single()

    // If onboarding not completed, redirect to onboarding
    if (onboarding && !(onboarding as { completed: boolean }).completed) {
      redirect('/onboarding')
    }
  }

  // If business is inactive, show suspended message
  if (!isActive && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-white">
            Negocio Suspendido
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
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

  return (
    <BusinessProvider businessId={business.id} userId={user.id} userEmail={user.email}>
      <TourProvider businessId={business.id}>
        <div className="min-h-screen">
          <ThemeProvider primaryColor={brandColor} secondaryColor={brandSecondary} />
          <Sidebar businessName={businessName} logoUrl={logoUrl} isAdmin={isAdmin} />

          {/* Mobile header with notification bell */}
          <MobileHeader businessName={businessName} logoUrl={logoUrl} />

          {/* Main content */}
          <main id="main-content" className="lg:pl-64">
            <div className="px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
              <TrialBanner />
              {children}
            </div>
          </main>

          {/* Mobile bottom navigation */}
          <BottomNav isAdmin={isAdmin} />

          {/* Tour tooltip overlay */}
          <TourTooltip />
        </div>
      </TourProvider>
    </BusinessProvider>
  )
}
