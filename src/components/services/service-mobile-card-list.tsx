'use client'

import { motion, useAnimationControls } from 'framer-motion'
import { Pencil, Trash2, Star } from 'lucide-react'
import { SwipeableRow } from '@/components/ui/swipeable-row'
import { formatCurrency } from '@/lib/utils'
import { type MockService, ServiceIcon, getCategoryColor, CATEGORY_LABELS } from './service-types'

interface ServiceMobileCardListProps {
  services: MockService[]
  listTransitionControls: ReturnType<typeof useAnimationControls>
  onEdit: (service: MockService) => void
  onDelete: (service: MockService) => void
  onSelect?: (service: MockService) => void
}

export function ServiceMobileCardList({
  services,
  listTransitionControls,
  onEdit,
  onDelete,
  onSelect,
}: ServiceMobileCardListProps) {
  return (
    <motion.div initial={false} animate={listTransitionControls} className="lg:hidden">
      {services.map((service, index) => (
        <div key={service.id}>
          {index > 0 && <div className="mx-4 h-px bg-zinc-100 dark:bg-zinc-800/60" />}
          <SwipeableRow
            showAffordance={false}
            leftActions={[
              {
                icon: <Pencil className="h-5 w-5" />,
                label: 'Editar',
                color: 'bg-blue-500',
                onClick: () => onEdit(service),
              },
            ]}
            rightActions={[
              {
                icon: <Trash2 className="h-5 w-5" />,
                label: 'Eliminar',
                color: 'bg-red-500',
                onClick: () => onDelete(service),
              },
            ]}
          >
            <button
              onClick={() => onSelect?.(service)}
              className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left bg-white dark:bg-zinc-950 active:bg-zinc-100 dark:active:bg-zinc-900 transition-colors"
            >
              {/* Service icon */}
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/[0.06] shrink-0">
                <ServiceIcon
                  iconName={service.iconName}
                  className="h-[18px] w-[18px] text-zinc-600 dark:text-zinc-300"
                />
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-zinc-900 dark:text-white truncate">
                  {service.name}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {service.duration_minutes} min ·{' '}
                  <span className={getCategoryColor(service.category).text}>
                    {CATEGORY_LABELS[service.category]}
                  </span>
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 flex items-center gap-1">
                  {service.avg_rating != null && service.avg_rating > 0 && (
                    <>
                      <Star className="w-3 h-3 text-amber-500 dark:text-amber-400 fill-current" />
                      {service.avg_rating.toFixed(1)} ·{' '}
                    </>
                  )}
                  {service.bookings_this_month} reservas
                </p>
              </div>

              {/* Price */}
              <span className="text-sm font-semibold text-zinc-900 dark:text-white tabular-nums shrink-0">
                {formatCurrency(service.price)}
              </span>
            </button>
          </SwipeableRow>
        </div>
      ))}
    </motion.div>
  )
}
