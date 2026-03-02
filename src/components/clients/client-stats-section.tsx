'use client'

import { motion } from 'framer-motion'
import { UserPlus, Users, DollarSign, Activity, TrendingUp, Sparkles, Target } from 'lucide-react'
import { ComponentErrorBoundary } from '@/components/error-boundaries'
import { formatCurrencyCompact } from '@/lib/utils'
import { animations } from '@/lib/design-system'
import type { ClientMetrics } from '@/hooks/queries/useClientMetrics'

interface ClientStatsSectionProps {
  metrics: ClientMetrics
  statsExpanded: boolean
}

export function ClientStatsSection({ metrics, statsExpanded }: ClientStatsSectionProps) {
  return (
    <div className={`${statsExpanded ? '' : 'hidden lg:block'}`}>
      <ComponentErrorBoundary
        fallbackTitle="Error en estadísticas"
        fallbackDescription="No se pudieron cargar las métricas de clientes"
      >
        <div className="-mx-4 px-4 lg:mx-0 lg:px-0">
          <div className="flex gap-3 overflow-x-auto pb-2 lg:pb-0 lg:grid lg:grid-cols-4 lg:gap-4 scrollbar-hide">
            {/* Clientes Nuevos */}
            <motion.div
              className="shrink-0 min-w-[140px] flex-shrink-0 lg:min-w-0"
              whileTap={{ scale: 0.98 }}
              transition={animations.spring.gentle}
            >
              <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-white/[0.04] px-3 py-3 lg:px-4 lg:py-4 shadow-[0_1px_2px_rgba(16,24,40,0.05),0_1px_3px_rgba(16,24,40,0.04)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)] cursor-pointer">
                <div className="pointer-events-none absolute inset-x-4 top-0 hidden h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent lg:block" />
                <div className="flex items-start justify-between mb-1.5 lg:mb-2">
                  <div className="rounded-xl bg-green-500/15 dark:bg-green-500/25 p-2 lg:p-2.5">
                    <UserPlus className="h-4 w-4 lg:h-5 lg:w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <Sparkles className="h-3.5 w-3.5 lg:hidden text-green-500/40" />
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-zinc-900 dark:text-white leading-none">
                  {metrics.newThisMonth}
                </p>
                <p className="text-xs text-muted mt-1 lg:mt-1.5">nuevos</p>
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-green-400/8 to-emerald-400/8 rounded-full blur-2xl lg:hidden" />
              </div>
            </motion.div>

            {/* Clientes Activos */}
            <motion.div
              className="shrink-0 min-w-[140px] flex-shrink-0 lg:min-w-0"
              whileTap={{ scale: 0.98 }}
              transition={animations.spring.gentle}
            >
              <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-white/[0.04] px-3 py-3 lg:px-4 lg:py-4 shadow-[0_1px_2px_rgba(16,24,40,0.05),0_1px_3px_rgba(16,24,40,0.04)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)] cursor-pointer">
                <div className="pointer-events-none absolute inset-x-4 top-0 hidden h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent lg:block" />
                <div className="flex items-start justify-between mb-1.5 lg:mb-2">
                  <div className="rounded-xl bg-blue-500/15 dark:bg-blue-500/25 p-2 lg:p-2.5">
                    <Users className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <TrendingUp className="h-3.5 w-3.5 lg:hidden text-blue-500/60" />
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-zinc-900 dark:text-white leading-none">
                  {metrics.recentActive}
                </p>
                <p className="text-xs text-muted mt-1 lg:mt-1.5">activos</p>
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-blue-400/8 to-indigo-400/8 rounded-full blur-2xl lg:hidden" />
              </div>
            </motion.div>

            {/* Ingresos Totales */}
            <motion.div
              className="shrink-0 min-w-[140px] flex-shrink-0 lg:min-w-0"
              whileTap={{ scale: 0.98 }}
              transition={animations.spring.gentle}
            >
              <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-white/[0.04] px-3 py-3 lg:px-4 lg:py-4 shadow-[0_1px_2px_rgba(16,24,40,0.05),0_1px_3px_rgba(16,24,40,0.04)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)] cursor-pointer">
                <div className="pointer-events-none absolute inset-x-4 top-0 hidden h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent lg:block" />
                <div className="flex items-start justify-between mb-1.5 lg:mb-2">
                  <div className="rounded-xl bg-emerald-500/15 dark:bg-emerald-500/25 p-2 lg:p-2.5">
                    <DollarSign className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <TrendingUp className="h-3.5 w-3.5 lg:hidden text-emerald-500/60" />
                </div>
                <p className="text-xl lg:text-2xl font-bold text-zinc-900 dark:text-white leading-none truncate">
                  {formatCurrencyCompact(metrics.totalRevenue)}
                </p>
                <p className="text-xs text-muted mt-1 lg:mt-1.5">ingresos</p>
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-emerald-400/8 to-teal-400/8 rounded-full blur-2xl lg:hidden" />
              </div>
            </motion.div>

            {/* Valor Promedio */}
            <motion.div
              className="shrink-0 min-w-[140px] flex-shrink-0 lg:min-w-0"
              whileTap={{ scale: 0.98 }}
              transition={animations.spring.gentle}
            >
              <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-white/[0.04] px-3 py-3 lg:px-4 lg:py-4 shadow-[0_1px_2px_rgba(16,24,40,0.05),0_1px_3px_rgba(16,24,40,0.04)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)] cursor-pointer">
                <div className="pointer-events-none absolute inset-x-4 top-0 hidden h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent lg:block" />
                <div className="flex items-start justify-between mb-1.5 lg:mb-2">
                  <div className="rounded-xl bg-purple-500/15 dark:bg-purple-500/25 p-2 lg:p-2.5">
                    <Activity className="h-4 w-4 lg:h-5 lg:w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <Target className="h-3.5 w-3.5 lg:hidden text-purple-500/40" />
                </div>
                <p className="text-xl lg:text-2xl font-bold text-zinc-900 dark:text-white leading-none truncate">
                  {formatCurrencyCompact(metrics.avgValue)}
                </p>
                <p className="text-xs text-muted mt-1 lg:mt-1.5">promedio</p>
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-purple-400/8 to-violet-400/8 rounded-full blur-2xl lg:hidden" />
              </div>
            </motion.div>
          </div>
        </div>
      </ComponentErrorBoundary>
    </div>
  )
}
