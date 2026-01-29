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
} from 'lucide-react'
import { Drawer } from '@/components/ui/drawer'
import { cn } from '@/lib/utils/cn'

interface MoreMenuDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  {
    name: 'Analíticas',
    href: '/analiticas',
    icon: BarChart3,
    description: 'Reportes y estadísticas',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
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

export function MoreMenuDrawer({ isOpen, onClose }: MoreMenuDrawerProps) {
  const pathname = usePathname()

  const handleLinkClick = () => {
    // Close drawer after navigation
    setTimeout(() => {
      onClose()
    }, 200)
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
                    <p className="text-[17px] font-semibold text-zinc-900 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                      {item.description}
                    </p>
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
                    <p className="text-[17px] font-semibold text-zinc-900 dark:text-white">
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
          <p className="text-[13px] text-zinc-400 dark:text-zinc-600">BarberShop Pro v1.0</p>
        </motion.div>
      </div>
    </Drawer>
  )
}
