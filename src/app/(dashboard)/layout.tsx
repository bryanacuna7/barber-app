import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/admin'
import { Sidebar } from '@/components/dashboard/sidebar'
import { BottomNav } from '@/components/dashboard/bottom-nav'
import { ThemeProvider } from '@/components/theme-provider'
import { AlertTriangle } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const isAdmin = !!(await verifyAdmin(supabase))

  // Get business info including is_active
  const { data: business } = await supabase
    .from('businesses')
    .select('name, brand_primary_color, brand_secondary_color, logo_url, is_active')
    .eq('owner_id', user.id)
    .single()

  // If no business exists
  if (!business) {
    // If admin without business, redirect to admin panel
    if (isAdmin) {
      redirect('/admin')
    }
    // If regular user without business, show error message
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
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

  // If business is inactive, show suspended message
  if (!isActive && !isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <ThemeProvider primaryColor={brandColor} secondaryColor={brandSecondary} />
      <Sidebar businessName={businessName} logoUrl={logoUrl} isAdmin={isAdmin} />

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <BottomNav />
    </div>
  )
}
