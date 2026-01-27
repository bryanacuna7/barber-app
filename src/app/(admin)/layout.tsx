import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/admin'
import { AdminSidebar, AdminBottomNav } from '@/components/admin/admin-sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify admin status
  const adminUser = await verifyAdmin(supabase)

  if (!adminUser) {
    // Not an admin, redirect to regular dashboard
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <AdminSidebar />

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <AdminBottomNav />
    </div>
  )
}
