/**
 * ActivityItem Component
 *
 * Timeline item for client activity history
 * Based on demo-fusion.html design
 */

import { LucideIcon } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ActivityItemProps {
  icon: LucideIcon
  iconColor: string
  iconBgColor: string
  title: string
  description: string
  date: Date
  amount?: number
  isLast?: boolean
}

export function ActivityItem({
  icon: Icon,
  iconColor,
  iconBgColor,
  title,
  description,
  date,
  amount,
  isLast = false,
}: ActivityItemProps) {
  return (
    <div className="relative flex gap-3">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-700" />
      )}

      {/* Icon */}
      <div
        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBgColor}`}
      >
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-zinc-900 dark:text-white text-sm">{title}</p>
            <p className="text-xs text-muted mt-0.5">{description}</p>
          </div>
          {amount !== undefined && (
            <span className="shrink-0 text-sm font-semibold text-green-600 dark:text-green-400">
              +₡{amount.toLocaleString('es-CR')}
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
          {format(date, "d 'de' MMMM, yyyy", { locale: es })}
        </p>
      </div>
    </div>
  )
}
