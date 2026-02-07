'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * KPICard Component
 *
 * Unified KPI card component extracted from 7 winning UI/UX demos.
 * Supports 3 variants: default, hero, and compact.
 *
 * Found in:
 * - Clientes Demo Fusion (lines 621-722): Rich KPI with trends
 * - Analiticas Demo Fusion (lines 188-242, 537-586): Hero + Secondary
 * - Servicios Demo D (lines 468-540): Sidebar stats
 * - Mi Día Demo B (lines 699-724): Simple stat cards
 * - Barberos Demo B (lines 381-409): Mini stats grid
 *
 * @example
 * // Default variant
 * <KPICard
 *   label="Ingresos Totales"
 *   value="$45,231"
 *   icon={<DollarSign className="h-6 w-6" />}
 *   trend={{ direction: 'up', percentage: 12.5 }}
 *   iconBackground="bg-green-500/10"
 *   iconColor="text-green-600 dark:text-green-400"
 * />
 *
 * @example
 * // Hero variant (2x size, full gradient)
 * <KPICard
 *   variant="hero"
 *   label="Ingresos Totales"
 *   value="$45,231"
 *   icon={<DollarSign className="h-8 w-8" />}
 *   gradient="from-violet-600 via-purple-600 to-blue-600"
 *   sparkline={[3000, 3200, 3100, 3400, 3300, 3600, 3500]}
 *   trend={{ direction: 'up', percentage: 12.5 }}
 * />
 *
 * @example
 * // Compact variant (for sidebars)
 * <KPICard
 *   variant="compact"
 *   label="Servicios Activos"
 *   value={12}
 *   icon={<Package className="h-5 w-5" />}
 *   iconBackground="bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/30"
 *   iconColor="text-violet-600 dark:text-violet-400"
 * />
 */

export interface KPICardProps {
  /** Label displayed above the value */
  label: string

  /** Main value to display (can be string or number) */
  value: string | number

  /** Icon element to display */
  icon: React.ReactNode

  /** Trend information (optional) */
  trend?: {
    /** Direction of the trend */
    direction: 'up' | 'down' | 'neutral'
    /** Percentage change */
    percentage: number
    /** Show comparison badge (Analiticas style) */
    showBadge?: boolean
  }

  /** Subtitle text displayed below value (optional) */
  subtitle?: string

  /** Full gradient background (for hero variant) */
  gradient?: string

  /** Icon background color/gradient */
  iconBackground?: string

  /** Icon color classes */
  iconColor?: string

  /** Sparkline data for mini chart (hero variant only) */
  sparkline?: number[]

  /** Visual variant */
  variant?: 'default' | 'hero' | 'compact'

  /** Custom className for container */
  className?: string

  /** Click handler */
  onClick?: () => void

  /** Comparison value for side-by-side display (optional) */
  comparisonValue?: string | number
}

/**
 * Sparkline mini chart component
 * Used in hero variant (from Analiticas Demo Fusion)
 */
function Sparkline({
  data,
  color = 'white',
  className,
}: {
  data: number[]
  color?: string
  className?: string
}) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((value - min) / range) * 100
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg viewBox="0 0 100 30" className={cn('w-full h-8', className)} preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color === 'white' ? 'currentColor' : color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-80"
      />
    </svg>
  )
}

/**
 * Comparison Badge component
 * Shows percentage change with colored badge (from Analiticas Demo Fusion)
 */
function ComparisonBadge({
  direction,
  percentage,
}: {
  direction: 'up' | 'down' | 'neutral'
  percentage: number
}) {
  const isPositive = direction === 'up'
  const isNegative = direction === 'down'

  return (
    <div
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm',
        isPositive && 'bg-green-500/20 text-green-300',
        isNegative && 'bg-red-500/20 text-red-300',
        !isPositive && !isNegative && 'bg-zinc-500/20 text-zinc-300'
      )}
    >
      {isPositive && <TrendingUp className="h-3 w-3" />}
      {isNegative && <TrendingDown className="h-3 w-3" />}
      {!isPositive && !isNegative && <Minus className="h-3 w-3" />}
      <span>
        {isPositive ? '+' : ''}
        {percentage}%
      </span>
    </div>
  )
}

/**
 * Trend Indicator component
 * Shows trend icon and percentage (from Clientes Demo Fusion)
 */
function TrendIndicator({
  direction,
  percentage,
}: {
  direction: 'up' | 'down' | 'neutral'
  percentage: number
}) {
  const isPositive = direction === 'up'
  const isNegative = direction === 'down'

  return (
    <div className="flex items-center gap-1 text-sm">
      {isPositive && <TrendingUp className="h-4 w-4 text-green-500" />}
      {isNegative && <TrendingDown className="h-4 w-4 text-red-500" />}
      {!isPositive && !isNegative && <Minus className="h-4 w-4 text-zinc-500" />}
      <span
        className={cn(
          'font-semibold',
          isPositive && 'text-green-600 dark:text-green-400',
          isNegative && 'text-red-600 dark:text-red-400',
          !isPositive && !isNegative && 'text-zinc-600 dark:text-zinc-400'
        )}
      >
        {isPositive ? '+' : ''}
        {percentage}%
      </span>
    </div>
  )
}

export function KPICard({
  label,
  value,
  icon,
  trend,
  subtitle,
  gradient,
  iconBackground = 'bg-zinc-100 dark:bg-zinc-800',
  iconColor = 'text-zinc-900 dark:text-white',
  sparkline,
  variant = 'default',
  className,
  onClick,
  comparisonValue,
}: KPICardProps) {
  // Hero variant (from Analiticas Demo Fusion - lines 188-242)
  if (variant === 'hero') {
    return (
      <motion.div
        whileHover={{ scale: onClick ? 1.02 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={onClick}
        className={cn(
          'relative overflow-hidden rounded-xl h-full',
          gradient ? `bg-gradient-to-br ${gradient}` : 'border-0 shadow-2xl',
          onClick && 'cursor-pointer',
          className
        )}
        style={
          !gradient
            ? {
                background: 'var(--brand-primary)',
                boxShadow: '0 25px 50px -12px rgba(var(--brand-primary-rgb), 0.2)',
              }
            : undefined
        }
      >
        {/* Mesh Gradient Overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-white rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-white rounded-full blur-[100px]" />
        </div>

        <div className="relative p-6 sm:p-8 h-full flex flex-col">
          {/* Header: Icon + Trend Badge */}
          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <div
              className={cn(
                'p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl',
                iconColor
              )}
            >
              {icon}
            </div>
            {trend?.showBadge && (
              <ComparisonBadge direction={trend.direction} percentage={trend.percentage} />
            )}
          </div>

          {/* Label */}
          <p className="text-white/80 text-xs sm:text-sm font-medium mb-1 sm:mb-2">{label}</p>

          {/* Value */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6">
            {value}
          </h2>

          {/* Subtitle */}
          {subtitle && <p className="text-white/70 text-xs sm:text-sm mb-4">{subtitle}</p>}

          {/* Sparkline */}
          {sparkline && sparkline.length > 0 && (
            <div className="mt-auto">
              <Sparkline data={sparkline} color="white" />
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  // Compact variant (from Servicios Demo D - lines 468-540, Barberos Demo B - lines 381-409)
  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: onClick ? 1.02 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        onClick={onClick}
        className={cn(
          'rounded-xl border border-zinc-200 bg-white p-4 shadow-sm',
          'dark:border-zinc-800 dark:bg-zinc-900',
          onClick && 'hover:shadow-md transition-shadow cursor-pointer',
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted mb-1">{label}</p>
            <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
            {subtitle && <p className="text-xs text-muted mt-1">{subtitle}</p>}
          </div>
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
              iconBackground,
              iconColor
            )}
          >
            {icon}
          </div>
        </div>

        {/* Optional trend at bottom */}
        {trend && !trend.showBadge && (
          <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <TrendIndicator direction={trend.direction} percentage={trend.percentage} />
          </div>
        )}
      </motion.div>
    )
  }

  // Default variant (from Clientes Demo Fusion - lines 621-722)
  return (
    <motion.div
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={onClick}
      className={cn(
        'rounded-xl bg-white dark:bg-zinc-900 p-5 sm:p-6',
        'shadow-sm border border-zinc-200 dark:border-zinc-800',
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Label */}
          <p className="text-xs sm:text-sm font-medium text-muted">{label}</p>

          {/* Value */}
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
            {value}
          </p>

          {/* Trend Indicator */}
          {trend && !trend.showBadge && (
            <div className="mt-2">
              <TrendIndicator direction={trend.direction} percentage={trend.percentage} />
            </div>
          )}

          {/* Subtitle */}
          {subtitle && <p className="mt-2 text-xs sm:text-sm text-muted">{subtitle}</p>}

          {/* Comparison Value */}
          {comparisonValue && (
            <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">vs {comparisonValue}</p>
          )}
        </div>

        {/* Icon */}
        <div className={cn('rounded-xl p-3 shrink-0', iconBackground, iconColor)}>{icon}</div>
      </div>

      {/* Optional sparkline at bottom */}
      {sparkline && sparkline.length > 0 && (
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Sparkline data={sparkline} color="#8b5cf6" className="opacity-60" />
        </div>
      )}
    </motion.div>
  )
}

/**
 * Pre-configured KPICard variants for common use cases
 */

/** Revenue KPI Card - Green themed with dollar icon */
export function RevenueKPICard(props: Omit<KPICardProps, 'iconBackground' | 'iconColor'>) {
  return (
    <KPICard
      {...props}
      iconBackground="bg-green-500/10"
      iconColor="text-green-600 dark:text-green-400"
    />
  )
}

/** Bookings KPI Card - Blue themed with calendar icon */
export function BookingsKPICard(props: Omit<KPICardProps, 'iconBackground' | 'iconColor'>) {
  return (
    <KPICard
      {...props}
      iconBackground="bg-blue-500/10"
      iconColor="text-blue-600 dark:text-blue-400"
    />
  )
}

/** Clients KPI Card - Purple themed with users icon */
export function ClientsKPICard(props: Omit<KPICardProps, 'iconBackground' | 'iconColor'>) {
  return (
    <KPICard
      {...props}
      iconBackground="bg-purple-500/10"
      iconColor="text-purple-600 dark:text-purple-400"
    />
  )
}

/** Services KPI Card - Violet themed with package icon */
export function ServicesKPICard(props: Omit<KPICardProps, 'iconBackground' | 'iconColor'>) {
  return (
    <KPICard
      {...props}
      iconBackground="bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/30"
      iconColor="text-violet-600 dark:text-violet-400"
    />
  )
}
