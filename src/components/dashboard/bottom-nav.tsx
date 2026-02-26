'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
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
import { useBusiness } from '@/contexts/business-context'
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
  { name: 'Nueva Cita', href: '/citas', icon: CalendarPlus, action: 'create-appointment' },
  { name: 'Nuevo Cliente', href: '/clientes', icon: UserPlus, action: 'create-client' },
  { name: 'Nuevo Servicio', href: '/servicios', icon: LayoutGrid, action: 'create-service' },
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

  // Try to read role from context (may fail if outside provider during SSR edge cases)
  let userRole: UserRole = 'owner'
  let contextIsBarber = isBarber
  let staffPermissions = {
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
    contextIsBarber = ctx.isBarber
  } catch {
    // Fallback: use props
    userRole = isBarber ? 'barber' : isAdmin ? 'admin' : 'owner'
  }

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
    router.push(`${action.href}?intent=create`)
  }

  const handlePlusClick = () => {
    if (isMobileDevice()) haptics.tap()
    if (isBarberRole) {
      // Barber: go directly to create cita (skip action sheet)
      router.push('/citas?intent=create')
    } else {
      setIsQuickActionOpen(true)
    }
  }

  // Left tabs (before + button)
  const leftTabs = isBarberRole ? navigation : ownerNavigation.slice(0, 2)

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="px-2 pb-3 pb-safe-offset-3">
          <div className="mx-auto flex max-w-[95%] items-center justify-around gap-0 rounded-full bg-white/80 dark:bg-black/60 px-1.5 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08),0_-2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2),0_-2px_12px_rgba(0,0,0,0.15)] backdrop-blur-xl border border-black/10 dark:border-zinc-800/80">
            {/* Left tabs */}
            {leftTabs.map((item) => {
              const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.name}
                  onClick={() => {
                    if (isMobileDevice()) haptics.selection()
                  }}
                  className={cn(
                    'relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-1.5',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black',
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
                </Link>
              )
            })}

            {/* Center: + Button (Global Create Action) */}
            {showPlusButton && (
              <button
                onClick={handlePlusClick}
                aria-label="Crear nuevo"
                aria-haspopup={!isBarberRole}
                aria-expanded={isQuickActionOpen}
                className="relative flex flex-col items-center justify-center gap-0.5 rounded-full px-3 py-1.5 focus-visible:outline-none focus-visible:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex h-[36px] w-[36px] items-center justify-center rounded-full"
                  style={{
                    background: `linear-gradient(135deg, var(--brand-primary), var(--brand-primary-dark, var(--brand-primary)))`,
                    boxShadow: `0 4px 14px rgba(var(--brand-primary-rgb), 0.4)`,
                  }}
                >
                  <Plus
                    className="h-5 w-5"
                    style={{ color: 'var(--brand-primary-contrast, #fff)' }}
                    strokeWidth={2.5}
                  />
                </motion.div>
              </button>
            )}

            {/* Right tabs: Servicios (or empty for barber if disabled) */}
            {rightNavItems.map((item) => {
              const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.name}
                  onClick={() => {
                    if (isMobileDevice()) haptics.selection()
                  }}
                  className={cn(
                    'relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-1.5',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black',
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
                </Link>
              )
            })}

            {/* More Button */}
            <button
              onClick={() => {
                setIsMoreOpen(true)
                if (isMobileDevice()) haptics.selection()
              }}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-1.5',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black',
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

      {/* Quick Action Sheet (owner only) */}
      <AnimatePresence>
        {isQuickActionOpen && !isBarberRole && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQuickActionOpen(false)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden"
            />
            {/* Action Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={animations.spring.sheet}
              className="fixed bottom-0 left-0 right-0 z-[61] lg:hidden"
            >
              <div className="mx-4 mb-safe-offset-4 overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-2xl dark:border-zinc-700/80 dark:bg-[#232326]">
                {/* Header */}
                <div className="flex items-center justify-between px-5 pb-2 pt-4">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    Crear nuevo
                  </h3>
                  <button
                    onClick={() => setIsQuickActionOpen(false)}
                    className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    aria-label="Cerrar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {/* Actions */}
                <div className="px-2 pb-4 pt-1">
                  {ownerQuickActions.map((action) => (
                    <button
                      key={action.action}
                      onClick={() => handleQuickAction(action)}
                      className="flex min-h-[44px] w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-zinc-900 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]/40 dark:text-zinc-100 dark:hover:bg-zinc-800/80"
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl border bg-zinc-100 dark:bg-zinc-700/60"
                        style={{ borderColor: 'rgba(var(--brand-primary-rgb), 0.28)' }}
                      >
                        <action.icon className="h-5 w-5 text-[var(--brand-primary-on-light)] dark:text-zinc-100" />
                      </div>
                      <span className="text-base font-medium text-zinc-900 dark:text-white">
                        {action.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
