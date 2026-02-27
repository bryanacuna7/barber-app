import { cn } from '@/lib/utils/cn'
import type { ReactNode } from 'react'
import type { BadgeVariant } from '@/types'

type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  pulse?: boolean
  className?: string
}

const variantClasses: Partial<Record<BadgeVariant, string>> = {
  default: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  secondary: 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200',
  primary: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  danger: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400',
  error: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400',
  info: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  pending: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400',
  outline:
    'bg-transparent border border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400',
}

const dotColors: Partial<Record<BadgeVariant, string>> = {
  default: 'bg-zinc-500',
  secondary: 'bg-zinc-600',
  primary: 'bg-blue-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  pending: 'bg-violet-500',
  outline: 'bg-zinc-400',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  pulse = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        'transition-colors duration-200',
        variantClasses[variant] || variantClasses.default,
        sizeClasses[size],
        className
      )}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={cn(
                'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
                dotColors[variant] || dotColors.default
              )}
            />
          )}
          <span
            className={cn(
              'relative inline-flex rounded-full h-2 w-2',
              dotColors[variant] || dotColors.default
            )}
          />
        </span>
      )}
      {children}
    </span>
  )
}

// Appointment status specific badges
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

const statusConfig: Record<
  AppointmentStatus,
  { label: string; variant: BadgeVariant; dot: boolean; pulse: boolean }
> = {
  pending: { label: 'Agendada', variant: 'info', dot: true, pulse: false },
  confirmed: { label: 'Agendada', variant: 'info', dot: true, pulse: false },
  completed: { label: 'Completada', variant: 'success', dot: true, pulse: false },
  cancelled: { label: 'Cancelada', variant: 'danger', dot: false, pulse: false },
  no_show: { label: 'No asistió', variant: 'warning', dot: false, pulse: false },
}

interface StatusBadgeProps {
  status: AppointmentStatus
  size?: BadgeSize
  className?: string
}

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge
      variant={config.variant}
      size={size}
      dot={config.dot}
      pulse={config.pulse}
      className={className}
    >
      {config.label}
    </Badge>
  )
}
