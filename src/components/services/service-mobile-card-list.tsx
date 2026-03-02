'use client'

import { motion, AnimatePresence, useAnimationControls } from 'framer-motion'
import { Pencil, Trash2, Star } from 'lucide-react'
import { SwipeableRow } from '@/components/ui/swipeable-row'
import { formatCurrency } from '@/lib/utils'
import { animations } from '@/lib/design-system'
import { type MockService, ServiceIcon, getCategoryColor, CATEGORY_LABELS } from './service-types'

// ----------------------------------------------------------------------------
// Props Interface
// ----------------------------------------------------------------------------

interface ServiceMobileCardListProps {
  services: MockService[]
  listTransitionControls: ReturnType<typeof useAnimationControls>
  onEdit: (service: MockService) => void
  onDelete: (service: MockService) => void
}

// ----------------------------------------------------------------------------
// Component
//
// Usage example:
//   <ServiceMobileCardList
//     services={sortedServices}
//     listTransitionControls={listTransitionControls}
//     onEdit={(service) => openEditServiceForm(service)}
//     onDelete={(service) => setDeleteService(service)}
//   />
// ----------------------------------------------------------------------------

export function ServiceMobileCardList({
  services,
  listTransitionControls,
  onEdit,
  onDelete,
}: ServiceMobileCardListProps) {
  return (
    <motion.div initial={false} animate={listTransitionControls} className="lg:hidden space-y-3">
      <AnimatePresence mode="popLayout">
        {services.map((service) => {
          const rightActions = [
            {
              icon: <Pencil className="h-5 w-5" />,
              label: 'Editar',
              color: 'bg-blue-500',
              onClick: () => onEdit(service),
            },
            {
              icon: <Trash2 className="h-5 w-5" />,
              label: 'Eliminar',
              color: 'bg-red-500',
              onClick: () => onDelete(service),
            },
          ]

          return (
            <motion.div
              key={service.id}
              layout
              exit={{ opacity: 0, x: -100 }}
              transition={animations.spring.layout}
            >
              <SwipeableRow rightActions={rightActions}>
                <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-4 shadow-[0_10px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_14px_32px_rgba(0,0,0,0.3)]">
                  {/* Row 1: Icon + Name */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800/60 flex-shrink-0">
                        <ServiceIcon
                          iconName={service.iconName}
                          className="h-4.5 w-4.5 text-zinc-700 dark:text-zinc-200"
                        />
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{service.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted">{service.duration_minutes} min</span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${getCategoryColor(service.category).bg} ${getCategoryColor(service.category).text}`}
                          >
                            {CATEGORY_LABELS[service.category]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Price + Bookings + Rating */}
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="font-bold text-foreground">
                      {formatCurrency(service.price)}
                    </span>
                    <span className="text-sm text-muted">
                      {service.bookings_this_month} reservas
                    </span>
                    <span className="flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-muted">{service.avg_rating?.toFixed(1) || 'N/A'}</span>
                    </span>
                  </div>
                </div>
              </SwipeableRow>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </motion.div>
  )
}
