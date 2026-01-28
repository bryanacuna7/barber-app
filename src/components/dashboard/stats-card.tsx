'use client'

import { type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

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
  delay?: number
}

const variants = {
  default: {
    bg: 'bg-white dark:bg-zinc-900',
    iconBg: 'bg-zinc-100 dark:bg-zinc-800',
    iconColor: 'text-zinc-600 dark:text-zinc-400',
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
  delay = 0,
}: StatsCardProps) {
  const styles = variants[variant]
  const isGradient = styles.gradient

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 24,
        delay,
      }}
      whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-4 sm:p-5',
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
          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/0 opacity-0"
            whileHover={{ opacity: [0, 1, 0], x: ['-100%', '100%'] }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
        </>
      )}

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'text-[13px] font-medium uppercase tracking-wide truncate',
              isGradient ? 'text-white/80' : 'text-zinc-500 dark:text-zinc-400'
            )}
          >
            {title}
          </p>

          <motion.p
            key={String(value)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={cn(
              'mt-1.5 text-[28px] sm:text-[32px] font-bold tracking-tight truncate',
              isGradient ? 'text-white' : 'text-zinc-900 dark:text-white'
            )}
          >
            {value}
          </motion.p>

          {description && (
            <p
              className={cn(
                'mt-0.5 text-[13px] truncate',
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
            'flex h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-xl',
            styles.iconBg,
            isGradient && 'ring-4 ring-white/10'
          )}
        >
          <Icon className={cn('h-5 w-5 sm:h-6 sm:w-6', styles.iconColor)} />
        </div>
      </div>

      {/* Decorative circle */}
      {isGradient && (
        <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-white/10" />
      )}
    </motion.div>
  )
}

// Alternative compact stats for mobile
export function StatsRow({
  stats,
}: {
  stats: Array<{ label: string; value: string | number }>
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-around rounded-2xl bg-zinc-900 p-4 dark:bg-zinc-800"
    >
      {stats.map((stat, i) => (
        <div key={stat.label} className="flex flex-col items-center">
          {i > 0 && (
            <div className="absolute left-0 top-1/2 h-8 w-px -translate-y-1/2 bg-zinc-700" />
          )}
          <span className="text-[11px] uppercase tracking-wide text-zinc-400">
            {stat.label}
          </span>
          <motion.span
            key={String(stat.value)}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="mt-0.5 text-2xl font-bold text-white"
          >
            {stat.value}
          </motion.span>
        </div>
      ))}
    </motion.div>
  )
}
