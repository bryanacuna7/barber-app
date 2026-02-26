'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Users,
  CreditCard,
  Settings,
  LogOut,
  UserRound,
  Shield,
  TrendingUp,
  Share2,
  History,
  Search,
  CalendarClock,
  BookOpen,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { useCommandPalette } from '@/components/dashboard/command-palette'

interface NavItem {
  name: string
  href: string
  icon: typeof LayoutDashboard
}

const baseNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Citas', href: '/citas', icon: Calendar },
  { name: 'Servicios', href: '/servicios', icon: Scissors },
  { name: 'Equipo', href: '/barberos', icon: UserRound },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Analíticas', href: '/analiticas', icon: TrendingUp },
  { name: 'Suscripción', href: '/suscripcion', icon: CreditCard },
  { name: 'Referencias', href: '/referencias', icon: Share2 },
  { name: 'Novedades', href: '/changelog', icon: History },
  { name: 'Guía', href: '/guia', icon: BookOpen },
  { name: 'Configuración', href: '/configuracion', icon: Settings },
]

const sidebarSections = [
  { id: 'operacion', label: 'Operación', items: ['/dashboard', '/citas', '/mi-dia', '/servicios'] },
  { id: 'gestion', label: 'Gestión', items: ['/barberos', '/clientes'] },
  { id: 'crecimiento', label: 'Crecimiento', items: ['/analiticas', '/referencias'] },
  { id: 'ayuda', label: 'Ayuda', items: ['/changelog', '/guia'] },
  { id: 'cuenta', label: 'Cuenta', items: ['/suscripcion', '/configuracion'] },
] as const

interface SidebarProps {
  businessName: string
  logoUrl?: string | null
  isAdmin?: boolean
  isBarber?: boolean
}

interface SidebarContentProps {
  businessName: string
  logoUrl?: string | null
  isAdmin?: boolean
  isBarber?: boolean
  pathname: string
  onLogout: () => void
  onLinkClick?: () => void
}

function SidebarContent({
  businessName,
  logoUrl,
  isAdmin,
  isBarber = false,
  pathname,
  onLogout,
  onLinkClick,
}: SidebarContentProps) {
  const { open: openCommandPalette } = useCommandPalette()
  const navigation = isBarber
    ? [
        baseNavigation[0],
        baseNavigation[1],
        { name: 'Mi Día', href: '/mi-dia', icon: CalendarClock },
        ...baseNavigation.slice(2),
      ]
    : baseNavigation
  const navigationByHref = new Map(navigation.map((item) => [item.href, item]))

  return (
    <>
      {/* Logo and notifications */}
      <div className="flex h-14 items-center justify-between border-b border-zinc-200/50 px-4 dark:border-zinc-800/50">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onLinkClick}>
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-7 w-7 rounded-lg object-cover" />
          ) : (
            <Scissors className="h-5 w-5 text-zinc-900 dark:text-white" />
          )}
          <span className="font-semibold text-sm truncate max-w-[130px]">{businessName}</span>
        </Link>
        <NotificationBell />
      </div>

      {/* Quick search trigger */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={openCommandPalette}
          className="flex w-full items-center gap-2.5 rounded-lg border border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">Buscar...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-zinc-200/70 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/70 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {sidebarSections.map((section) => {
          const sectionItems = section.items
            .map((href) => navigationByHref.get(href))
            .filter((item): item is NavItem => Boolean(item))

          if (sectionItems.length === 0) return null

          return (
            <section
              key={section.id}
              className="rounded-2xl border border-zinc-200/70 bg-white/55 p-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:border-zinc-800/70 dark:bg-white/[0.03] dark:shadow-[0_10px_24px_rgba(0,0,0,0.24)]"
            >
              <div className="mb-1.5 border-b border-zinc-200/70 px-1.5 pb-1.5 dark:border-zinc-800/70">
                <p className="whitespace-nowrap text-[12px] font-semibold leading-5 tracking-[0.05em] text-zinc-500 dark:text-zinc-400">
                  {section.label}
                </p>
              </div>

              <div className="space-y-0.5">
                {sectionItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onLinkClick}
                      className={cn(
                        'group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all',
                        isActive
                          ? 'bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900'
                          : 'text-zinc-600 hover:bg-zinc-100/90 dark:text-zinc-400 dark:hover:bg-zinc-800/80'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'h-[18px] w-[18px]',
                          isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'
                        )}
                      />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })}
      </nav>

      {/* Admin Panel + Logout — separated */}
      <div className="border-t border-zinc-200/50 px-3 py-3 dark:border-zinc-800/50 space-y-0.5">
        {isAdmin && (
          <Link
            href="/admin"
            onClick={onLinkClick}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <Shield className="h-[18px] w-[18px] opacity-60" />
            Admin Panel
          </Link>
        )}
        <button
          onClick={onLogout}
          data-testid="logout-button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          <LogOut className="h-[18px] w-[18px] opacity-60" />
          Cerrar Sesión
        </button>
      </div>
    </>
  )
}

export function Sidebar({ businessName, logoUrl, isAdmin, isBarber = false }: SidebarProps) {
  const pathname = usePathname()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <>
      {/* Desktop sidebar only - mobile uses bottom nav */}
      <aside
        data-tour="sidebar"
        className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-zinc-200/50 dark:lg:border-zinc-800/50 bg-gradient-to-b from-white/30 via-white/70 to-white/90 dark:from-zinc-900/30 dark:via-zinc-900/70 dark:to-zinc-900/90 backdrop-blur-md transition-colors duration-300"
      >
        <SidebarContent
          businessName={businessName}
          logoUrl={logoUrl}
          isAdmin={isAdmin}
          isBarber={isBarber}
          pathname={pathname}
          onLogout={handleLogout}
        />
      </aside>
    </>
  )
}
