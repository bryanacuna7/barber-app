'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock3,
  Users,
  Scissors,
  MoreHorizontal,
  Plus,
  X,
  UserPlus,
  CalendarPlus,
  LayoutGrid,
  CalendarClock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { animations } from '@/lib/design-system'
import { haptics, isMobileDevice } from '@/lib/utils/mobile'
import { MoreMenuDrawer } from './more-menu-drawer'
import { QuickActionsSheet } from './quick-actions-sheet'
import { useBusiness } from '@/contexts/business-context'
import { useTodayStats } from '@/hooks/queries/useTodayStats'
import type { UserRole } from '@/lib/auth/roles'

const ownerNavigation = [
  { name: 'Citas', href: '/citas', icon: Calendar },
  { name: 'Clientes', href: '/clientes', icon: Users },
  // Center slot is the + button (rendered separately)
  { name: 'Servicios', href: '/servicios', icon: Scissors },
]

type NavItem = (typeof ownerNavigation)[number]

// Pages accessible through "More" menu (for active indicator)
const ownerMorePages = [
  '/dashboard',
  '/analiticas',
  '/lealtad/configuracion',
  '/barberos',
  '/mi-dia',
  '/suscripcion',
  '/changelog',
  '/guia',
  '/configuracion',
]

const barberMorePages = ['/clientes', '/analiticas', '/guia']

const ownerQuickActions = [
  {
    name: 'Nueva Cita',
    description: 'Con fecha y hora',
    href: '/citas',
    icon: CalendarPlus,
    action: 'create-appointment',
  },
  {
    name: 'Walk-in',
    description: 'Sin reserva, llegó ahora',
    href: '/citas',
    icon: Clock3,
    action: 'walk-in',
  },
  {
    name: 'Nuevo Cliente',
    description: 'Registrar cliente nuevo',
    href: '/clientes',
    icon: UserPlus,
    action: 'create-client',
  },
  {
    name: 'Nuevo Servicio',
    description: 'Agregar servicio al catálogo',
    href: '/servicios',
    icon: LayoutGrid,
    action: 'create-service',
  },
]

interface BottomNavProps {
  isAdmin?: boolean
  isBarber?: boolean
}

export function BottomNav({ isAdmin = false, isBarber = false }: BottomNavProps = {}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false)
  const [keepQuickActionNavOnTop, setKeepQuickActionNavOnTop] = useState(false)

  // Read business context once. BottomNav always renders inside BusinessProvider
  // for logged-in users; the catch is a guard against rare SSR edge cases.
  let ctx: ReturnType<typeof useBusiness> | null = null
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    ctx = useBusiness()
  } catch {
    ctx = null
  }

  const userRole: UserRole = ctx?.userRole ?? (isBarber ? 'barber' : isAdmin ? 'admin' : 'owner')
  const contextIsBarber = ctx?.isBarber ?? isBarber
  const staffPermissions = ctx?.staffPermissions ?? {
    nav_citas: true,
    nav_servicios: true,
    nav_clientes: false,
    nav_analiticas: false,
    nav_changelog: true,
    can_create_citas: true,
    can_view_all_citas: false,
  }

  // Badge count for Citas tab — always called (hooks rules compliant)
  const { data: todayStats } = useTodayStats(ctx?.businessId)
  const citasBadgeCount = todayStats?.count ?? 0

  const isBarberRole = userRole === 'barber'
  // Owners/admins who are also barbers — get Mi Día quick access in tabs
  const isOwnerBarber = contextIsBarber && (userRole === 'owner' || userRole === 'admin')

  // Build navigation based on role + permissions
  let navigation = ownerNavigation
  if (isBarberRole) {
    const barberTabs: NavItem[] = []
    // Mi Día always first for barbers
    barberTabs.push({ name: 'Mi Día', href: '/mi-dia', icon: CalendarClock })
    // Citas if enabled
    if (staffPermissions.nav_citas) {
      barberTabs.push({ name: 'Citas', href: '/citas', icon: Calendar })
    }
    navigation = barberTabs
  }

  // Right side tabs (after + button)
  const rightNavItems = isBarberRole
    ? staffPermissions.nav_servicios
      ? [{ name: 'Servicios', href: '/servicios', icon: Scissors }]
      : []
    : isOwnerBarber
      ? [{ name: 'Mi Día', href: '/mi-dia', icon: CalendarClock }]
      : ownerNavigation.slice(2)

  // Determine which "more" pages for active indicator
  const morePages = isBarberRole
    ? barberMorePages
    : isOwnerBarber
      ? ownerMorePages.filter((p) => p !== '/mi-dia').concat('/servicios')
      : ownerMorePages

  // Check if current page is in "More" menu
  const currentPath = pathname || ''
  const isMoreActive =
    currentPath.length > 0 &&
    morePages.some((page) => currentPath === page || currentPath.startsWith(`${page}/`))

  // Should the + button be visible? For barbers, only if can_create_citas
  const showPlusButton = !isBarberRole || staffPermissions.can_create_citas

  const handleQuickAction = (action: (typeof ownerQuickActions)[number]) => {
    setIsQuickActionOpen(false)
    if (isMobileDevice()) haptics.selection()
    if (action.action === 'walk-in') {
      router.push('/citas?intent=walk-in')
    } else {
      router.push(`${action.href}?intent=create`)
    }
  }

  const handlePlusClick = () => {
    if (isMobileDevice()) haptics.tap()
    if (isBarberRole) {
      // Barber: go directly to create cita (skip action sheet)
      router.push('/citas?intent=create')
    } else {
      setIsQuickActionOpen((prev) => !prev)
    }
  }

  // Left tabs (before + button)
  const leftTabs = isBarberRole ? navigation : ownerNavigation.slice(0, 2)
  const quickActions = ownerQuickActions.map((action) => ({
    id: action.action,
    label: action.name,
    description: action.description,
    icon: action.icon,
    onSelect: () => handleQuickAction(action),
  }))
  const isQuickActionCompactMode = (isQuickActionOpen || keepQuickActionNavOnTop) && !isBarberRole

  useEffect(() => {
    if (isQuickActionOpen) {
      setKeepQuickActionNavOnTop(true)
      return
    }

    if (!keepQuickActionNavOnTop) return

    const timeout = window.setTimeout(() => {
      setKeepQuickActionNavOnTop(false)
    }, 180)

    return () => window.clearTimeout(timeout)
  }, [isQuickActionOpen, keepQuickActionNavOnTop])

  return (
    <>
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 lg:hidden',
          isQuickActionCompactMode ? 'z-[206]' : 'z-50'
        )}
      >
        <div className="px-2 pb-3 pb-safe-offset-3">
          <div
            className={cn(
              'mx-auto flex max-w-[95%] items-center justify-around gap-0 rounded-full px-1.5 py-1.5',
              isQuickActionCompactMode
                ? 'bg-transparent border border-transparent shadow-none backdrop-blur-0'
                : 'bg-white/80 dark:bg-black/60 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08),0_-2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2),0_-2px_12px_rgba(0,0,0,0.15)] backdrop-blur-xl border border-black/10 dark:border-zinc-800/80'
            )}
          >
            {/* Left tabs */}
            {leftTabs.map((item) => {
              const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`)
              return (
                <button
                  key={item.name}
                  type="button"
                  disabled={isQuickActionCompactMode}
                  aria-hidden={isQuickActionCompactMode}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.name}
                  onClick={() => {
                    if (isMobileDevice()) haptics.selection()
                    router.push(item.href)
                  }}
                  className={cn(
                    'relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-1.5 transition-[opacity,transform] duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black',
                    isQuickActionCompactMode && 'pointer-events-none scale-95 opacity-0',
                    isActive
                      ? 'text-zinc-900 dark:text-white'
                      : 'text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute inset-0 rounded-full nav-indicator"
                      transition={animations.spring.snappy}
                    />
                  )}

                  <motion.div
                    animate={{
                      scale: isActive ? 1.15 : 1,
                      y: isActive ? -2 : 0,
                    }}
                    transition={animations.spring.default}
                    className="relative z-10 flex h-[26px] w-[26px] items-center justify-center"
                  >
                    <item.icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.5 : 2} />
                    {/* Badge: today's remaining appointments on Citas tab */}
                    {item.href === '/citas' && citasBadgeCount > 0 && !isActive && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                        className="absolute -right-1 -top-1 flex h-[14px] min-w-[14px] items-center justify-center rounded-full px-[3px] text-[9px] font-bold leading-none text-white"
                        style={{ backgroundColor: 'var(--brand-primary)' }}
                      >
                        {citasBadgeCount > 9 ? '9+' : citasBadgeCount}
                      </motion.span>
                    )}
                  </motion.div>

                  <span
                    className="relative z-10 text-[11px] leading-none tracking-tight"
                    style={{ fontWeight: isActive ? 600 : 500 }}
                  >
                    {item.name}
                  </span>
                </button>
              )
            })}

            {/* Center: + Button (Global Create Action) */}
            {showPlusButton && (
              <button
                onClick={handlePlusClick}
                aria-label={isQuickActionOpen ? 'Cerrar crear nuevo' : 'Crear nuevo'}
                aria-haspopup={!isBarberRole}
                aria-expanded={isQuickActionOpen}
                aria-pressed={isQuickActionOpen}
                className="relative flex flex-col items-center justify-center gap-0.5 rounded-full px-3 py-1.5 focus-visible:outline-none focus-visible:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
              >
                <motion.div
                  whileTap={{ scale: 0.94 }}
                  animate={{
                    scale: isQuickActionOpen ? 1.08 : 1,
                    boxShadow: isQuickActionOpen
                      ? `0 8px 20px rgba(var(--brand-primary-rgb), 0.58)`
                      : `0 4px 14px rgba(var(--brand-primary-rgb), 0.4)`,
                  }}
                  transition={{ type: 'spring', stiffness: 520, damping: 34, mass: 0.7 }}
                  className="flex h-[36px] w-[36px] items-center justify-center rounded-full"
                  style={{
                    background: isQuickActionOpen
                      ? 'rgba(24,24,27,0.95)'
                      : `linear-gradient(135deg, var(--brand-primary), var(--brand-primary-dark, var(--brand-primary)))`,
                    border: isQuickActionOpen
                      ? '1px solid rgba(var(--brand-primary-rgb), 0.45)'
                      : 'none',
                  }}
                >
                  <div className="relative h-5 w-5">
                    <motion.span
                      initial={false}
                      animate={{
                        opacity: isQuickActionOpen ? 0 : 1,
                        scale: isQuickActionOpen ? 0.78 : 1,
                        rotate: isQuickActionOpen ? -55 : 0,
                      }}
                      transition={{ duration: 0.14, ease: [0.33, 1, 0.68, 1] }}
                      className="absolute inset-0 inline-flex items-center justify-center"
                    >
                      <Plus
                        className="h-5 w-5"
                        style={{ color: 'var(--brand-primary-contrast, #fff)' }}
                        strokeWidth={2.75}
                      />
                    </motion.span>

                    <motion.span
                      initial={false}
                      animate={{
                        opacity: isQuickActionOpen ? 1 : 0,
                        scale: isQuickActionOpen ? 1 : 0.78,
                        rotate: isQuickActionOpen ? 0 : 55,
                      }}
                      transition={{ duration: 0.14, ease: [0.33, 1, 0.68, 1] }}
                      className="absolute inset-0 inline-flex items-center justify-center"
                    >
                      <X className="h-5 w-5 text-white" strokeWidth={2.75} />
                    </motion.span>
                  </div>
                </motion.div>
              </button>
            )}

            {/* Right tabs: Servicios (or empty for barber if disabled) */}
            {rightNavItems.map((item) => {
              const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`)
              return (
                <button
                  key={item.name}
                  type="button"
                  disabled={isQuickActionCompactMode}
                  aria-hidden={isQuickActionCompactMode}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.name}
                  onClick={() => {
                    if (isMobileDevice()) haptics.selection()
                    router.push(item.href)
                  }}
                  className={cn(
                    'relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-1.5 transition-[opacity,transform] duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black',
                    isQuickActionCompactMode && 'pointer-events-none scale-95 opacity-0',
                    isActive
                      ? 'text-zinc-900 dark:text-white'
                      : 'text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute inset-0 rounded-full nav-indicator"
                      transition={animations.spring.snappy}
                    />
                  )}

                  <motion.div
                    animate={{
                      scale: isActive ? 1.15 : 1,
                      y: isActive ? -2 : 0,
                    }}
                    transition={animations.spring.default}
                    className="relative z-10 flex h-[26px] w-[26px] items-center justify-center"
                  >
                    <item.icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.5 : 2} />
                  </motion.div>

                  <span
                    className="relative z-10 text-[11px] leading-none tracking-tight"
                    style={{ fontWeight: isActive ? 600 : 500 }}
                  >
                    {item.name}
                  </span>
                </button>
              )
            })}

            {/* More Button */}
            <button
              disabled={isQuickActionCompactMode}
              aria-hidden={isQuickActionCompactMode}
              onClick={() => {
                setIsMoreOpen(true)
                if (isMobileDevice()) haptics.selection()
              }}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-1.5 transition-[opacity,transform] duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black',
                isQuickActionCompactMode && 'pointer-events-none scale-95 opacity-0',
                isMoreActive
                  ? 'text-zinc-900 dark:text-white'
                  : 'text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              )}
              aria-label="Más opciones"
              aria-haspopup="true"
              aria-expanded={isMoreOpen}
            >
              {isMoreActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute inset-0 rounded-full nav-indicator"
                  transition={animations.spring.snappy}
                />
              )}

              <motion.div
                animate={{
                  scale: isMoreActive ? 1.15 : 1,
                  y: isMoreActive ? -2 : 0,
                }}
                transition={animations.spring.default}
                className="relative z-10 flex h-[26px] w-[26px] items-center justify-center"
              >
                <MoreHorizontal
                  className="h-[22px] w-[22px]"
                  strokeWidth={isMoreActive ? 2.5 : 2}
                />
              </motion.div>

              <span
                className="relative z-10 text-[11px] leading-none tracking-tight"
                style={{ fontWeight: isMoreActive ? 600 : 500 }}
              >
                Más
              </span>
            </button>
          </div>
        </div>
      </nav>

      <QuickActionsSheet
        isOpen={isQuickActionOpen && !isBarberRole}
        onClose={() => setIsQuickActionOpen(false)}
        title="Crear nuevo"
        actions={quickActions}
        showBottomConnector
        bottomOffsetPx={56}
      />

      {/* More Menu Drawer */}
      <MoreMenuDrawer
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        isAdmin={isAdmin}
        isBarber={isBarber}
      />
    </>
  )
}
