'use client'

import { motion } from 'framer-motion'
import {
  UserPlus,
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  Sparkles,
  Target,
  type LucideIcon,
} from 'lucide-react'
import { ComponentErrorBoundary } from '@/components/error-boundaries'
import { formatCurrencyCompact } from '@/lib/utils'
import { animations } from '@/lib/design-system'
import type { ClientMetrics } from '@/hooks/queries/useClientMetrics'

interface ClientStatsSectionProps {
  metrics: ClientMetrics
  statsExpanded: boolean
}

interface StatCardConfig {
  key: string
  label: string
  helper: string
  value: string | number
  icon: LucideIcon
  accentIcon: LucideIcon
  iconBgClass: string
  iconTextClass: string
  topLineClass: string
  glowClass: string
  valueClass?: string
}

export function ClientStatsSection({ metrics, statsExpanded }: ClientStatsSectionProps) {
  const statCards: StatCardConfig[] = [
    {
      key: 'new',
      label: 'Clientes nuevos',
      helper: 'este mes',
      value: metrics.newThisMonth,
      icon: UserPlus,
      accentIcon: Sparkles,
      iconBgClass: 'bg-green-500/15 dark:bg-green-500/25',
      iconTextClass: 'text-green-600 dark:text-green-400',
      topLineClass: 'via-emerald-500/60',
      glowClass: 'from-green-400/8 to-emerald-400/8',
    },
    {
      key: 'active',
      label: 'Clientes activos',
      helper: 'últimos 30 días',
      value: metrics.recentActive,
      icon: Users,
      accentIcon: TrendingUp,
      iconBgClass: 'bg-blue-500/15 dark:bg-blue-500/25',
      iconTextClass: 'text-blue-600 dark:text-blue-400',
      topLineClass: 'via-blue-500/60',
      glowClass: 'from-blue-400/8 to-indigo-400/8',
    },
    {
      key: 'revenue',
      label: 'Ingresos',
      helper: 'histórico',
      value: formatCurrencyCompact(metrics.totalRevenue),
      icon: DollarSign,
      accentIcon: TrendingUp,
      iconBgClass: 'bg-emerald-500/15 dark:bg-emerald-500/25',
      iconTextClass: 'text-emerald-600 dark:text-emerald-400',
      topLineClass: 'via-amber-500/60',
      glowClass: 'from-emerald-400/8 to-teal-400/8',
      valueClass: 'text-[1.65rem] lg:text-[1.75rem]',
    },
    {
      key: 'avg',
      label: 'Ticket promedio',
      helper: 'por cliente',
      value: formatCurrencyCompact(metrics.avgValue),
      icon: Activity,
      accentIcon: Target,
      iconBgClass: 'bg-purple-500/15 dark:bg-purple-500/25',
      iconTextClass: 'text-purple-600 dark:text-purple-400',
      topLineClass: 'via-violet-500/60',
      glowClass: 'from-purple-400/8 to-violet-400/8',
      valueClass: 'text-[1.65rem] lg:text-[1.75rem]',
    },
  ]

  return (
    <div className={`${statsExpanded ? '' : 'hidden lg:block'}`}>
      <ComponentErrorBoundary
        fallbackTitle="Error en estadísticas"
        fallbackDescription="No se pudieron cargar las métricas de clientes"
      >
        <div className="-mx-4 px-4 lg:mx-0 lg:px-0">
          <div className="flex gap-3 overflow-x-auto pb-2 lg:pb-0 lg:grid lg:grid-cols-4 lg:gap-4 scrollbar-hide">
            {statCards.map((card) => {
              const Icon = card.icon
              const AccentIcon = card.accentIcon
              return (
                <motion.div
                  key={card.key}
                  className="shrink-0 min-w-[180px] flex-shrink-0 lg:min-w-0"
                  whileTap={{ scale: 0.98 }}
                  transition={animations.spring.gentle}
                >
                  <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-white/[0.04] px-3.5 py-3.5 lg:px-4 lg:py-4.5 min-h-[112px] shadow-[0_1px_2px_rgba(16,24,40,0.05),0_1px_3px_rgba(16,24,40,0.04)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)]">
                    <div
                      className={`pointer-events-none absolute inset-x-4 top-0 hidden h-px bg-gradient-to-r from-transparent ${card.topLineClass} to-transparent lg:block`}
                    />
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`rounded-xl p-2 lg:p-2.5 ${card.iconBgClass}`}>
                          <Icon className={`h-4 w-4 lg:h-5 lg:w-5 ${card.iconTextClass}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] lg:text-xs font-medium text-muted uppercase tracking-wide truncate">
                            {card.label}
                          </p>
                          <p className="text-[11px] text-muted/75 truncate">{card.helper}</p>
                        </div>
                      </div>
                      <AccentIcon
                        className={`h-3.5 w-3.5 shrink-0 ${card.iconTextClass} opacity-50`}
                      />
                    </div>

                    <div className="mt-3">
                      <p
                        className={`font-bold text-foreground leading-none tracking-tight truncate text-[1.85rem] lg:text-[2rem] ${
                          card.valueClass ?? ''
                        }`}
                      >
                        {card.value}
                      </p>
                    </div>

                    <div
                      className={`pointer-events-none absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br ${card.glowClass} rounded-full blur-2xl`}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </ComponentErrorBoundary>
    </div>
  )
}
