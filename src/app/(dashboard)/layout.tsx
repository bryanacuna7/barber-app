import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'
import { BottomNav } from '@/components/dashboard/bottom-nav'
import { ThemeProvider } from '@/components/theme-provider'

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

  // Get business info including brand
  const { data: business } = await supabase
    .from('businesses')
    .select('name, brand_primary_color, brand_secondary_color, logo_url')
    .eq('owner_id', user.id)
    .single()

  const businessName = business?.name || 'Mi Barbería'
  const brandColor = business?.brand_primary_color || '#007AFF'
  const brandSecondary = business?.brand_secondary_color || null
  const logoUrl = business?.logo_url || null

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <ThemeProvider primaryColor={brandColor} secondaryColor={brandSecondary} />
      <Sidebar businessName={businessName} logoUrl={logoUrl} />

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
