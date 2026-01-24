import { cn } from '@/lib/utils/cn'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 px-4 text-center',
      className
    )}>
      {Icon && (
        <div className="mb-4 p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50">
          <Icon className="w-10 h-10 text-zinc-400 dark:text-zinc-500" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">
          {description}
        </p>
      )}
      {action}
    </div>
  )
}
