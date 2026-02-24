'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Building2,
  Clock,
  Palette,
  Settings,
  Users,
  Banknote,
  Tag,
  ArrowRight,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FadeInUp } from '@/components/ui/motion'
import { SettingsSearchModal } from '@/components/settings/settings-search-modal'
import { animations } from '@/lib/design-system'
import { ComponentErrorBoundary } from '@/components/error-boundaries/ComponentErrorBoundary'

const SETTINGS_CARDS = [
  {
    href: '/configuracion/general',
    title: 'Información General',
    subtitle: 'Nombre, teléfono, dirección y enlace de reservas',
    icon: Building2,
    color: 'blue',
    delay: 0.1,
  },
  {
    href: '/configuracion/horario',
    title: 'Horario de Atención',
    subtitle: 'Días y horas de operación, tiempos de buffer',
    icon: Clock,
    color: 'purple',
    delay: 0.2,
  },
  {
    href: '/configuracion/branding',
    title: 'Marca y Estilo',
    subtitle: 'Colores, logo y personalización visual',
    icon: Palette,
    color: 'pink',
    delay: 0.3,
  },
  {
    href: '/configuracion/avanzado',
    title: 'Configuración Avanzada',
    subtitle: 'Notificaciones, lealtad y opciones avanzadas',
    icon: Settings,
    color: 'amber',
    delay: 0.4,
  },
  {
    href: '/configuracion/equipo',
    title: 'Equipo y Accesos',
    subtitle: 'Qué pueden ver y hacer tus miembros del equipo',
    icon: Users,
    color: 'teal',
    delay: 0.5,
  },
  {
    href: '/configuracion/pagos',
    title: 'Métodos de Pago',
    subtitle: 'Qué métodos de pago aceptas en tu negocio',
    icon: Banknote,
    color: 'emerald',
    delay: 0.6,
  },
  {
    href: '/configuracion/promociones',
    title: 'Slots Promocionales',
    subtitle: 'Descuentos en horarios de baja demanda para llenar tu agenda',
    icon: Tag,
    color: 'orange',
    delay: 0.7,
  },
] as const

const COLOR_CLASSES: Record<
  string,
  {
    hoverBorder: string
    iconBg: string
    iconBgHover: string
    iconText: string
    arrowHover: string
  }
> = {
  blue: {
    hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-600',
    iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    iconBgHover: 'group-hover:bg-blue-500/20 dark:group-hover:bg-blue-500/30',
    iconText: 'text-blue-600 dark:text-blue-400',
    arrowHover: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
  },
  purple: {
    hoverBorder: 'hover:border-purple-300 dark:hover:border-purple-600',
    iconBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    iconBgHover: 'group-hover:bg-purple-500/20 dark:group-hover:bg-purple-500/30',
    iconText: 'text-purple-600 dark:text-purple-400',
    arrowHover: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
  },
  pink: {
    hoverBorder: 'hover:border-pink-300 dark:hover:border-pink-600',
    iconBg: 'bg-pink-500/10 dark:bg-pink-500/20',
    iconBgHover: 'group-hover:bg-pink-500/20 dark:group-hover:bg-pink-500/30',
    iconText: 'text-pink-600 dark:text-pink-400',
    arrowHover: 'group-hover:text-pink-600 dark:group-hover:text-pink-400',
  },
  amber: {
    hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-600',
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    iconBgHover: 'group-hover:bg-amber-500/20 dark:group-hover:bg-amber-500/30',
    iconText: 'text-amber-600 dark:text-amber-400',
    arrowHover: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
  },
  teal: {
    hoverBorder: 'hover:border-teal-300 dark:hover:border-teal-600',
    iconBg: 'bg-teal-500/10 dark:bg-teal-500/20',
    iconBgHover: 'group-hover:bg-teal-500/20 dark:group-hover:bg-teal-500/30',
    iconText: 'text-teal-600 dark:text-teal-400',
    arrowHover: 'group-hover:text-teal-600 dark:group-hover:text-teal-400',
  },
  emerald: {
    hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-600',
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    iconBgHover: 'group-hover:bg-emerald-500/20 dark:group-hover:bg-emerald-500/30',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    arrowHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
  },
  orange: {
    hoverBorder: 'hover:border-orange-300 dark:hover:border-orange-600',
    iconBg: 'bg-orange-500/10 dark:bg-orange-500/20',
    iconBgHover: 'group-hover:bg-orange-500/20 dark:group-hover:bg-orange-500/30',
    iconText: 'text-orange-600 dark:text-orange-400',
    arrowHover: 'group-hover:text-orange-600 dark:group-hover:text-orange-400',
  },
}

export default function ConfiguracionPage() {
  const router = useRouter()
  const [searchModalOpen, setSearchModalOpen] = useState(false)

  // Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchModalOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Navigate from search modal to subroutes
  function handleSearchNavigate(tabId: string) {
    router.push(`/configuracion/${tabId}`)
  }

  return (
    <ComponentErrorBoundary
      fallbackTitle="Error en Configuración"
      fallbackDescription="Ocurrió un error al cargar la página de configuración"
    >
      <div className="min-h-screen pb-24 lg:pb-6">
        {/* Header */}
        <FadeInUp>
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="app-page-title">Configuración</h1>
              <p className="app-page-subtitle mt-1 lg:hidden">
                Administra los datos y preferencias de tu negocio
              </p>
            </div>
            {/* Search Button with Cmd+K */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSearchModalOpen(true)}
              className="h-10 px-4"
              aria-label="Buscar configuraciones"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline text-[13px]">Buscar</span>
              <kbd className="hidden lg:inline px-1.5 py-0.5 rounded bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 text-[11px] font-mono text-zinc-500">
                {typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Mac') !== -1
                  ? '\u2318'
                  : 'Ctrl'}
                K
              </kbd>
            </Button>
          </div>
        </FadeInUp>

        {/* Navigation Cards Grid */}
        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
          {SETTINGS_CARDS.map((card) => {
            const Icon = card.icon
            const colors = COLOR_CLASSES[card.color]

            return (
              <Link key={card.href} href={card.href} className="block">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: card.delay, ...animations.spring.gentle }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-6 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 ${colors.hoverBorder} transition-all shadow-sm hover:shadow-md text-left group`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-xl ${colors.iconBg} ${colors.iconBgHover} transition-colors`}
                    >
                      <Icon className={`h-6 w-6 ${colors.iconText}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[17px] font-semibold text-zinc-900 dark:text-white mb-1">
                        {card.title}
                      </h3>
                      <p className="text-[15px] text-muted">{card.subtitle}</p>
                    </div>
                    <ArrowRight
                      className={`h-5 w-5 text-zinc-400 dark:text-zinc-500 ${colors.arrowHover} transition-colors flex-shrink-0 mt-1`}
                    />
                  </div>
                </motion.div>
              </Link>
            )
          })}
        </div>

        {/* Settings Search Modal */}
        <SettingsSearchModal
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          onNavigate={handleSearchNavigate}
        />
      </div>
    </ComponentErrorBoundary>
  )
}
