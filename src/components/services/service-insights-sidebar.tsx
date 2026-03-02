'use client'

import { motion } from 'framer-motion'
import { Package, Award, Star } from 'lucide-react'
import { animations } from '@/lib/design-system'
import { type MockService, ServiceIcon, getCategoryColor } from './service-types'

interface ServiceInsightsSidebarProps {
  isOpen: boolean
  totalServices: number
  topService: MockService | null
  activeServices: MockService[]
  top5Services: MockService[]
  maxBookings: number
}

export function ServiceInsightsSidebar({
  isOpen,
  totalServices,
  topService,
  activeServices,
  top5Services,
  maxBookings,
}: ServiceInsightsSidebarProps) {
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...animations.spring.default, delay: 0.1 }}
      className="hidden lg:block w-[320px] shrink-0 space-y-4"
    >
      {/* Quick Stats */}
      <div className="space-y-3">
        {/* Total Services */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          transition={animations.spring.snappy}
          className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted">Servicios Activos</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{totalServices}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/30">
              <Package className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
        </motion.div>

        {/* Top Service */}
        {topService && (
          <motion.div
            whileTap={{ scale: 0.98 }}
            transition={animations.spring.snappy}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted">Más Popular</p>
                <div className="mt-1 flex items-center gap-2 min-w-0">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800/60 shrink-0">
                    <ServiceIcon
                      iconName={topService.iconName}
                      className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-200"
                    />
                  </span>
                  <p className="text-base font-bold text-foreground truncate">{topService.name}</p>
                </div>
                <p className="text-xs text-muted">{topService.bookings_this_month} reservas</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30">
                <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Average Rating */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          transition={animations.spring.snappy}
          className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted">Rating Promedio</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {activeServices.length > 0
                  ? (
                      activeServices.reduce((sum, s) => sum + s.avg_rating, 0) /
                      activeServices.length
                    ).toFixed(1)
                  : '0.0'}
              </p>
              <p className="text-xs text-muted">
                {activeServices.reduce((sum, s) => sum + s.total_reviews, 0)} reviews
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30">
              <Star className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mini Chart */}
      <motion.div
        whileTap={{ scale: 0.98 }}
        transition={animations.spring.snappy}
        className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow"
      >
        <h3 className="mb-3 text-sm font-semibold text-foreground">Top 5 Servicios</h3>
        <div className="space-y-3">
          {top5Services.map((service, idx) => {
            const percentage = (service.bookings_this_month / maxBookings) * 100
            const categoryColor = getCategoryColor(service.category)

            return (
              <div key={service.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800/60 shrink-0">
                      <ServiceIcon
                        iconName={service.iconName}
                        className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-200"
                      />
                    </span>
                    <span className="font-medium text-foreground truncate">{service.name}</span>
                  </div>
                  <span className="ml-2 shrink-0 text-xs text-muted">
                    {service.bookings_this_month}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.4 + idx * 0.1 }}
                    className={`h-full rounded-full ${categoryColor.bg}`}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
