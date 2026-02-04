'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Users,
  Settings,
  LogOut,
  UserRound,
  Shield,
  TrendingUp,
  Share2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { NotificationBell } from '@/components/notifications/notification-bell'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Citas', href: '/citas', icon: Calendar },
  { name: 'Servicios', href: '/servicios', icon: Scissors },
  { name: 'Barberos', href: '/barberos', icon: UserRound },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Analíticas', href: '/analiticas', icon: TrendingUp },
  { name: 'Referencias', href: '/referencias', icon: Share2 },
  { name: 'Configuración', href: '/configuracion', icon: Settings },
]

interface SidebarProps {
  businessName: string
  logoUrl?: string | null
  isAdmin?: boolean
}

interface SidebarContentProps {
  businessName: string
  logoUrl?: string | null
  isAdmin?: boolean
  pathname: string
  onLogout: () => void
  onLinkClick?: () => void
}

function SidebarContent({
  businessName,
  logoUrl,
  isAdmin,
  pathname,
  onLogout,
  onLinkClick,
}: SidebarContentProps) {
  return (
    <>
      {/* Logo and notifications */}
      <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={onLinkClick}>
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-7 w-7 rounded-lg object-cover" />
          ) : (
            <Scissors className="h-6 w-6" />
          )}
          <span className="font-semibold truncate max-w-[140px]">{businessName}</span>
        </Link>
        <NotificationBell />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[var(--brand-primary)] text-[var(--brand-primary-contrast)] ring-1 ring-white/10 dark:ring-white/20'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Admin Panel + Logout */}
      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800 space-y-1">
        {isAdmin && (
          <Link
            href="/admin"
            onClick={onLinkClick}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <Shield className="h-5 w-5" />
            Admin Panel
          </Link>
        )}
        <button
          onClick={onLogout}
          data-testid="logout-button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <LogOut className="h-5 w-5" />
          Cerrar Sesión
        </button>
      </div>
    </>
  )
}

export function Sidebar({ businessName, logoUrl, isAdmin }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Desktop sidebar only - mobile uses bottom nav */}
      <aside
        data-tour="sidebar"
        className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-zinc-200 lg:bg-white dark:lg:border-zinc-800 dark:lg:bg-zinc-900"
      >
        <SidebarContent
          businessName={businessName}
          logoUrl={logoUrl}
          isAdmin={isAdmin}
          pathname={pathname}
          onLogout={handleLogout}
        />
      </aside>
    </>
  )
}
