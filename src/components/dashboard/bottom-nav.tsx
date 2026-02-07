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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { animations } from '@/lib/design-system'
import { haptics, isMobileDevice } from '@/lib/utils/mobile'
import { MoreMenuDrawer } from './more-menu-drawer'

const navigation = [
  { name: 'Citas', href: '/citas', icon: Calendar },
  { name: 'Clientes', href: '/clientes', icon: Users },
  // Center slot is the + button (rendered separately)
  { name: 'Servicios', href: '/servicios', icon: Scissors },
]

// Pages accessible through "More" menu
const morePages = [
  '/dashboard',
  '/analiticas',
  '/lealtad/configuracion',
  '/barberos',
  '/suscripcion',
  '/changelog',
  '/configuracion',
]

const quickActions = [
  { name: 'Nueva Cita', href: '/citas', icon: CalendarPlus, action: 'create-appointment' },
  { name: 'Nuevo Cliente', href: '/clientes', icon: UserPlus, action: 'create-client' },
  { name: 'Nuevo Servicio', href: '/servicios', icon: LayoutGrid, action: 'create-service' },
]

interface BottomNavProps {
  isAdmin?: boolean
}

export function BottomNav({ isAdmin = false }: BottomNavProps = {}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false)

  // Check if current page is in "More" menu
  const currentPath = pathname || ''
  const isMoreActive =
    currentPath.length > 0 &&
    morePages.some((page) => currentPath === page || currentPath.startsWith(`${page}/`))

  const handleQuickAction = (action: (typeof quickActions)[number]) => {
    setIsQuickActionOpen(false)
    if (isMobileDevice()) haptics.selection()
    // Navigate with intent=create so destination page auto-opens create form
    router.push(`${action.href}?intent=create`)
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="px-2 pb-3 pb-safe-offset-3">
          <div className="mx-auto flex max-w-[95%] items-center justify-around gap-0 rounded-full bg-white/80 dark:bg-black/60 px-1.5 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08),0_-2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2),0_-2px_12px_rgba(0,0,0,0.15)] backdrop-blur-xl border border-black/10 dark:border-white/10">
            {/* Left tabs: Citas, Clientes */}
            {navigation.slice(0, 2).map((item) => {
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
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black',
                    isActive
                      ? 'text-blue-500 dark:text-blue-300'
                      : 'text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute inset-0 rounded-full bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-400/25 dark:to-blue-500/35 ring-1 ring-blue-200 dark:ring-blue-300/30 shadow-[0_0_12px_rgba(59,130,246,0.15),inset_0_1px_0_rgba(255,255,255,0.5)] dark:shadow-[0_0_20px_rgba(96,165,250,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]"
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
            <button
              onClick={() => {
                setIsQuickActionOpen(true)
                if (isMobileDevice()) haptics.tap()
              }}
              aria-label="Crear nuevo"
              aria-haspopup="true"
              aria-expanded={isQuickActionOpen}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5 rounded-full px-3 py-1.5',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
              )}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 shadow-lg shadow-blue-500/30"
              >
                <Plus className="h-5 w-5 text-white" strokeWidth={2.5} />
              </motion.div>
            </button>

            {/* Right tabs: Servicios */}
            {navigation.slice(2).map((item) => {
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
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black',
                    isActive
                      ? 'text-blue-500 dark:text-blue-300'
                      : 'text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute inset-0 rounded-full bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-400/25 dark:to-blue-500/35 ring-1 ring-blue-200 dark:ring-blue-300/30 shadow-[0_0_12px_rgba(59,130,246,0.15),inset_0_1px_0_rgba(255,255,255,0.5)] dark:shadow-[0_0_20px_rgba(96,165,250,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]"
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
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black',
                isMoreActive
                  ? 'text-blue-500 dark:text-blue-300'
                  : 'text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              )}
              aria-label="Más opciones"
              aria-haspopup="true"
              aria-expanded={isMoreOpen}
            >
              {isMoreActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute inset-0 rounded-full bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-400/25 dark:to-blue-500/35 ring-1 ring-blue-200 dark:ring-blue-300/30 shadow-[0_0_12px_rgba(59,130,246,0.15),inset_0_1px_0_rgba(255,255,255,0.5)] dark:shadow-[0_0_20px_rgba(96,165,250,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]"
                  transition={{
                    type: 'spring',
                    stiffness: 350,
                    damping: 30,
                    mass: 1,
                  }}
                />
              )}

              <motion.div
                animate={{
                  scale: isMoreActive ? 1.15 : 1,
                  y: isMoreActive ? -2 : 0,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                  mass: 0.8,
                }}
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

      {/* Quick Action Sheet */}
      <AnimatePresence>
        {isQuickActionOpen && (
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
              <div className="mx-4 mb-safe-offset-4 rounded-2xl bg-white dark:bg-[#2C2C2E] shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-4 pb-2">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    Crear nuevo
                  </h3>
                  <button
                    onClick={() => setIsQuickActionOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-700 min-w-[44px] min-h-[44px]"
                    aria-label="Cerrar"
                  >
                    <X className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                  </button>
                </div>
                {/* Actions */}
                <div className="px-2 pb-4 pt-1">
                  {quickActions.map((action) => (
                    <button
                      key={action.action}
                      onClick={() => handleQuickAction(action)}
                      className="w-full flex items-center gap-4 px-4 py-3.5 min-h-[44px] rounded-xl text-left hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/20">
                        <action.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
      <MoreMenuDrawer isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} isAdmin={isAdmin} />
    </>
  )
}
