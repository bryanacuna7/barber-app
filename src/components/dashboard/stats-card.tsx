'use client'

import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatedNumber } from '@/components/ui/motion'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info'
}

const variants = {
  default: {
    bg: 'bg-white dark:bg-zinc-900',
    iconBg: 'bg-zinc-100 dark:bg-zinc-800',
    iconColor: 'text-muted',
    gradient: null,
    shadow: 'shadow-sm hover:shadow-md',
  },
  primary: {
    bg: 'bg-gradient-to-br from-blue-600 to-blue-700',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
    gradient: true,
    shadow: 'shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30',
  },
  success: {
    bg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
    gradient: true,
    shadow: 'shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30',
  },
  warning: {
    bg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
    gradient: true,
    shadow: 'shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30',
  },
  info: {
    bg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
    gradient: true,
    shadow: 'shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30',
  },
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = 'default',
}: StatsCardProps) {
  const styles = variants[variant]
  const isGradient = styles.gradient
  const valueText = typeof value === 'number' ? value.toLocaleString('es-CR') : String(value)
  const hasLongValue = valueText.length >= 10
  const hasVeryLongValue = valueText.length >= 13

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-3.5 sm:p-5',
        'transition-all duration-300',
        styles.bg,
        styles.shadow,
        !isGradient && 'border border-zinc-200 dark:border-zinc-800'
      )}
    >
      {/* Gradient overlay for depth */}
      {isGradient && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          {/* Static sheen for desktop: keeps premium feel without motion noise */}
          <div className="pointer-events-none absolute inset-0 hidden lg:block bg-gradient-to-br from-white/[0.08] via-transparent to-transparent" />
          <div className="pointer-events-none absolute inset-x-5 top-0 hidden h-px bg-gradient-to-r from-transparent via-white/60 to-transparent lg:block" />
          {/* Static shine — mobile only */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 lg:hidden" />
        </>
      )}

      <div className="relative flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'text-[11px] sm:text-sm font-medium uppercase tracking-[0.08em] sm:tracking-wide leading-tight',
              isGradient ? 'text-white/80' : 'text-muted'
            )}
          >
            {title}
          </p>

          <p
            className={cn(
              'mt-1.5 font-bold tracking-tight leading-[1.05] [overflow-wrap:anywhere]',
              hasVeryLongValue
                ? 'text-[20px] sm:text-[28px]'
                : hasLongValue
                  ? 'text-[22px] sm:text-[30px]'
                  : 'text-[26px] sm:text-[32px]',
              isGradient ? 'text-white' : 'text-zinc-900 dark:text-white'
            )}
          >
            {typeof value === 'number' ? (
              <AnimatedNumber value={value} />
            ) : (
              value
            )}
          </p>

          {description && (
            <p
              className={cn(
                'mt-0.5 text-xs sm:text-sm leading-tight',
                isGradient ? 'text-white/70' : 'text-zinc-400 dark:text-zinc-500'
              )}
            >
              {description}
            </p>
          )}

          {trend && (
            <div
              className={cn(
                'mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold',
                trend.isPositive
                  ? isGradient
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : isGradient
                    ? 'bg-white/20 text-white'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              )}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        <div
          className={cn(
            'flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-xl',
            styles.iconBg,
            isGradient && 'ring-4 ring-white/10'
          )}
        >
          <Icon className={cn('h-4 w-4 sm:h-6 sm:w-6', styles.iconColor)} />
        </div>
      </div>

      {/* Decorative circle — mobile only */}
      {isGradient && (
        <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-white/10 lg:hidden" />
      )}
    </div>
  )
}

// Alternative compact stats for mobile
export function StatsRow({ stats }: { stats: Array<{ label: string; value: string | number }> }) {
  return (
    <div className="flex items-center justify-around rounded-2xl bg-zinc-900 p-4 dark:bg-zinc-800">
      {stats.map((stat, i) => (
        <div key={stat.label} className="flex flex-col items-center">
          {i > 0 && (
            <div className="absolute left-0 top-1/2 h-8 w-px -translate-y-1/2 bg-zinc-700" />
          )}
          <span className="text-[11px] uppercase tracking-wide text-zinc-400">{stat.label}</span>
          <span className="mt-0.5 text-2xl font-bold text-white">{stat.value}</span>
        </div>
      ))}
    </div>
  )
}
