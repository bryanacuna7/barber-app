'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
} from 'lucide-react'
import { Drawer } from '@/components/ui/drawer'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'

interface MoreMenuDrawerProps {
  isOpen: boolean
  onClose: () => void
  isAdmin?: boolean
}

const menuItems = [
  {
    name: 'Inicio',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Resumen del negocio',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
  },
  {
    name: 'Analíticas',
    href: '/analiticas',
    icon: BarChart3,
    description: 'Reportes y estadísticas',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    name: 'Lealtad',
    href: '/lealtad/configuracion',
    icon: Gift,
    description: 'Programa de recompensas',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
  {
    name: 'Barberos',
    href: '/barberos',
    icon: Scissors,
    description: 'Gestionar equipo',
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30',
  },
  {
    name: 'Suscripción',
    href: '/suscripcion',
    icon: CreditCard,
    description: 'Plan y facturación',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  {
    name: 'Novedades',
    href: '/changelog',
    icon: History,
    description: 'Versiones y cambios recientes',
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
  },
  {
    name: 'Configuración',
    href: '/configuracion',
    icon: Settings,
    description: 'Ajustes del negocio',
    color: 'text-zinc-600 dark:text-zinc-400',
    bgColor: 'bg-zinc-100 dark:bg-zinc-800',
  },
]

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

export function MoreMenuDrawer({ isOpen, onClose, isAdmin = false }: MoreMenuDrawerProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLinkClick = () => {
    // Close drawer after navigation
    setTimeout(() => {
      onClose()
    }, 200)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    onClose()
    router.push('/login')
    router.refresh()
  }

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Más opciones" showCloseButton={false}>
      <div className="space-y-6">
        {/* Main Pages */}
        <div className="space-y-2">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <motion.div
                key={item.name}
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
                      isActive
                        ? 'text-zinc-600 dark:text-zinc-400'
                        : 'text-zinc-400 dark:text-zinc-600'
                    )}
                  />
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Admin Panel Link (if admin) */}
        {isAdmin && (
          <>
            <div className="border-t border-zinc-200 dark:border-zinc-800" />
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: menuItems.length * 0.05 }}
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
                    pathname === '/admin'
                      ? 'text-zinc-600 dark:text-zinc-400'
                      : 'text-zinc-400 dark:text-zinc-600'
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
          transition={{ delay: menuItems.length * 0.05 }}
        >
          <button
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

        {/* Divider */}
        <div className="border-t border-zinc-200 dark:border-zinc-800" />

        {/* External Links */}
        <div className="space-y-2">
          {externalLinks.map((item, index) => {
            const Icon = item.icon

            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (menuItems.length + index) * 0.05 }}
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
                    <Icon className="h-6 w-6 text-zinc-600 dark:text-zinc-400" strokeWidth={2} />
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

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="pt-4 text-center"
        >
          <p className="text-sm text-zinc-400 dark:text-zinc-600">BarberShop Pro v1.0</p>
        </motion.div>
      </div>
    </Drawer>
  )
}
