'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Scissors,
  CreditCard,
  Settings,
  FileText,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Gift,
  LogOut,
  LayoutDashboard,
  History,
  Shield,
  CalendarClock,
  Users,
  Trophy,
  Target,
} from 'lucide-react'
import { Drawer } from '@/components/ui/drawer'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/contexts/business-context'
import type { StaffPermissions, UserRole } from '@/lib/auth/roles'

interface MoreMenuDrawerProps {
  isOpen: boolean
  onClose: () => void
  isAdmin?: boolean
  isBarber?: boolean
}

// All possible menu items with permission keys
interface MenuItem {
  name: string
  href: string
  icon: typeof LayoutDashboard
  description: string
  color: string
  bgColor: string
  /** If set, this item is only shown for barbers when this permission is true */
  barberPermission?: keyof StaffPermissions
  /** If true, this item is NEVER shown to barbers */
  ownerOnly?: boolean
  /** If true, this item is only shown in "Más" for barbers (owners have it in bottom nav) */
  barberMenuOnly?: boolean
}

const menuItems: MenuItem[] = [
  {
    name: 'Inicio',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Resumen del negocio',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    ownerOnly: true,
  },
  {
    name: 'Analíticas',
    href: '/analiticas',
    icon: BarChart3,
    description: 'Reportes y estadísticas',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    barberPermission: 'nav_analiticas',
  },
  {
    name: 'Lealtad',
    href: '/lealtad/configuracion',
    icon: Gift,
    description: 'Programa de recompensas',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    ownerOnly: true,
  },
  {
    name: 'Equipo',
    href: '/barberos',
    icon: Scissors,
    description: 'Gestionar equipo',
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30',
    ownerOnly: true,
  },
  {
    name: 'Clientes',
    href: '/clientes',
    icon: Users,
    description: 'Lista de clientes',
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30',
    barberPermission: 'nav_clientes',
    barberMenuOnly: true,
  },
  {
    name: 'Suscripción',
    href: '/suscripcion',
    icon: CreditCard,
    description: 'Plan y facturación',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    ownerOnly: true,
  },
  {
    name: 'Novedades',
    href: '/changelog',
    icon: History,
    description: 'Versiones y cambios recientes',
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
    barberPermission: 'nav_changelog',
  },
  {
    name: 'Logros',
    href: '/barberos/logros',
    icon: Trophy,
    description: 'Logros del equipo',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  {
    name: 'Desafíos',
    href: '/barberos/desafios',
    icon: Target,
    description: 'Competencias y retos',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  {
    name: 'Configuración',
    href: '/configuracion',
    icon: Settings,
    description: 'Ajustes del negocio',
    color: 'text-muted',
    bgColor: 'bg-zinc-100 dark:bg-zinc-800',
    ownerOnly: true,
  },
]

const barberMenuItem: MenuItem = {
  name: 'Mi Día',
  href: '/mi-dia',
  icon: CalendarClock,
  description: 'Tu agenda de hoy',
  color: 'text-teal-600 dark:text-teal-400',
  bgColor: 'bg-teal-100 dark:bg-teal-900/30',
}

const externalLinks = [
  {
    name: 'Documentación',
    href: '#',
    icon: FileText,
    external: true,
  },
  {
    name: 'Soporte',
    href: '#',
    icon: HelpCircle,
    external: true,
  },
]

function dedupeMenuItemsByHref(items: MenuItem[]): MenuItem[] {
  const seen = new Set<string>()

  return items.filter((item) => {
    if (seen.has(item.href)) return false
    seen.add(item.href)
    return true
  })
}

export function MoreMenuDrawer({
  isOpen,
  onClose,
  isAdmin = false,
  isBarber = false,
}: MoreMenuDrawerProps) {
  const pathname = usePathname()

  // Read role + permissions from context
  let userRole: UserRole = 'owner'
  let staffPermissions: StaffPermissions = {
    nav_citas: true,
    nav_servicios: true,
    nav_clientes: false,
    nav_analiticas: false,
    nav_changelog: true,
    can_create_citas: true,
    can_view_all_citas: false,
  }
  try {
    const ctx = useBusiness()
    userRole = ctx.userRole
    staffPermissions = ctx.staffPermissions
    isBarber = ctx.isBarber
  } catch {
    userRole = isBarber ? 'barber' : isAdmin ? 'admin' : 'owner'
  }

  const isBarberRole = userRole === 'barber'

  // Build filtered menu items based on role
  const filteredItems = (() => {
    if (!isBarberRole) {
      // Owner/admin: show all items except those already in bottom nav
      const ownerItems = menuItems.filter((item) => !item.barberMenuOnly)
      const items = isBarber ? [barberMenuItem, ...ownerItems] : ownerItems
      return dedupeMenuItemsByHref(items)
    }

    // Barber role: filter by permissions
    const items: MenuItem[] = []

    for (const item of menuItems) {
      // Skip owner-only items
      if (item.ownerOnly) continue

      // Check barber permission (if configured)
      if (item.barberPermission) {
        if (staffPermissions[item.barberPermission]) {
          items.push(item)
        }
      } else {
        // Items without ownerOnly or barberPermission are visible to all roles
        items.push(item)
      }
    }

    return dedupeMenuItemsByHref(items)
  })()

  const handleLinkClick = () => {
    setTimeout(() => {
      onClose()
    }, 200)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    // Hard redirect to avoid middleware race condition (cookies may not be cleared
    // before a soft navigation hits the server, causing a bounce back to /dashboard)
    window.location.href = '/login'
  }

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Más opciones" showCloseButton={false}>
      <div className="space-y-6">
        {/* Main Pages */}
        {filteredItems.length > 0 && (
          <div className="space-y-2">
            {filteredItems.map((item, index) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={cn(
                      'flex items-center gap-4 rounded-2xl p-4 transition-all duration-200',
                      'border border-zinc-200 dark:border-zinc-800',
                      isActive
                        ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    )}
                  >
                    {/* Icon */}
                    <div className={cn('rounded-xl p-3', item.bgColor)}>
                      <Icon className={cn('h-6 w-6', item.color)} strokeWidth={2} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-sm text-muted">{item.description}</p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight
                      className={cn(
                        'h-5 w-5 transition-colors',
                        isActive ? 'text-muted' : 'text-zinc-400 dark:text-zinc-600'
                      )}
                    />
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Admin Panel Link (if admin) */}
        {isAdmin && (
          <>
            <div className="border-t border-zinc-200 dark:border-zinc-800" />
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: filteredItems.length * 0.05 }}
            >
              <Link
                href="/admin"
                onClick={handleLinkClick}
                className={cn(
                  'flex items-center gap-4 rounded-2xl p-4 transition-all duration-200',
                  'border border-zinc-200 dark:border-zinc-800',
                  pathname === '/admin'
                    ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                )}
              >
                {/* Icon */}
                <div className="rounded-xl bg-purple-100 dark:bg-purple-900/30 p-3">
                  <Shield
                    className="h-6 w-6 text-purple-600 dark:text-purple-400"
                    strokeWidth={2}
                  />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-zinc-900 dark:text-white">Panel Admin</p>
                  <p className="text-sm text-muted">Gestión del sistema</p>
                </div>

                {/* Arrow */}
                <ChevronRight
                  className={cn(
                    'h-5 w-5 transition-colors',
                    pathname === '/admin' ? 'text-muted' : 'text-zinc-400 dark:text-zinc-600'
                  )}
                />
              </Link>
            </motion.div>
          </>
        )}

        {/* Divider */}
        <div className="border-t border-zinc-200 dark:border-zinc-800" />

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: filteredItems.length * 0.05 }}
        >
          <button
            type="button"
            onClick={handleLogout}
            data-testid="logout-button"
            className={cn(
              'flex w-full items-center gap-4 rounded-2xl p-4 transition-all duration-200',
              'border border-zinc-200 dark:border-zinc-800',
              'hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800'
            )}
          >
            {/* Icon */}
            <div className="rounded-xl bg-red-100 dark:bg-red-900/30 p-3">
              <LogOut className="h-6 w-6 text-red-600 dark:text-red-400" strokeWidth={2} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-lg font-semibold text-zinc-900 dark:text-white">Cerrar Sesión</p>
            </div>
          </button>
        </motion.div>

        {/* External Links (owner only) */}
        {!isBarberRole && (
          <>
            <div className="border-t border-zinc-200 dark:border-zinc-800" />
            <div className="space-y-2">
              {externalLinks.map((item, index) => {
                const Icon = item.icon

                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (filteredItems.length + index) * 0.05 }}
                  >
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'flex items-center gap-4 rounded-2xl p-4 transition-all duration-200',
                        'border border-zinc-200 dark:border-zinc-800',
                        'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                      )}
                    >
                      {/* Icon */}
                      <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-3">
                        <Icon className="h-6 w-6 text-muted" strokeWidth={2} />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                          {item.name}
                        </p>
                      </div>

                      {/* External Icon */}
                      <ExternalLink className="h-5 w-5 text-zinc-400 dark:text-zinc-600" />
                    </a>
                  </motion.div>
                )
              })}
            </div>
          </>
        )}

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="pt-4 text-center"
        >
          <p className="text-sm text-zinc-400 dark:text-zinc-600">BarberApp v{process.env.NEXT_PUBLIC_APP_VERSION ?? '0.9.8'}</p>
        </motion.div>
      </div>
    </Drawer>
  )
}
