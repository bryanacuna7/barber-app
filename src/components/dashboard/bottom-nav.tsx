'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, Calendar, Users, Scissors, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MoreMenuDrawer } from './more-menu-drawer'

const navigation = [
  { name: 'Inicio', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Citas', href: '/citas', icon: Calendar },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Servicios', href: '/servicios', icon: Scissors },
]

// Pages accessible through "More" menu
const morePages = [
  '/analiticas',
  '/lealtad/configuracion',
  '/barberos',
  '/suscripcion',
  '/configuracion',
]

export function BottomNav() {
  const pathname = usePathname()
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  // Check if current page is in "More" menu
  const isMoreActive = morePages.some((page) => pathname === page)

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="px-2 pb-3 pb-safe-offset-3">
          <div className="mx-auto flex max-w-[95%] items-center justify-around gap-0 rounded-full bg-white/80 dark:bg-black/60 px-1.5 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08),0_-2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2),0_-2px_12px_rgba(0,0,0,0.15)] backdrop-blur-xl border border-black/10 dark:border-white/10">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.name}
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
                      scale: isActive ? 1.15 : 1,
                      y: isActive ? -2 : 0,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 20,
                      mass: 0.8,
                    }}
                    className="relative z-10 flex h-[26px] w-[26px] items-center justify-center"
                  >
                    <item.icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.5 : 2} />
                  </motion.div>

                  <span
                    className="relative z-10 text-[10px] leading-none tracking-tight"
                    style={{ fontWeight: isActive ? 600 : 500 }}
                  >
                    {item.name}
                  </span>
                </Link>
              )
            })}

            {/* More Button */}
            <button
              onClick={() => setIsMoreOpen(true)}
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
                className="relative z-10 text-[10px] leading-none tracking-tight"
                style={{ fontWeight: isMoreActive ? 600 : 500 }}
              >
                Más
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* More Menu Drawer */}
      <MoreMenuDrawer isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
    </>
  )
}
