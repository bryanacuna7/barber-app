import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'
import { BottomNav } from '@/components/dashboard/bottom-nav'

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

  // Get business info
  const { data: business } = await supabase
    .from('businesses')
    .select('name')
    .eq('owner_id', user.id)
    .single()

  const businessName = business?.name || 'Mi Barbería'

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar businessName={businessName} />

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
