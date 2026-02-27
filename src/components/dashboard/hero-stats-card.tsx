'use client'

import { cn } from '@/lib/utils'
import { compactCurrencyForMobile } from '@/lib/utils/format'
import { AnimatedNumber } from '@/components/ui/motion'

interface HeroMetric {
  label: string
  value: string | number
  description: string
}

interface HeroStatsCardProps {
  left: HeroMetric
  right: HeroMetric
}

export function HeroStatsCard({ left, right }: HeroStatsCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-5 sm:p-6',
        'bg-gradient-to-br from-emerald-500 to-teal-600',
        'shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30',
        'transition-shadow duration-300'
      )}
    >
      {/* Gradient overlays for depth — same as StatsCard gradient variants */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
      <div className="pointer-events-none absolute inset-0 hidden lg:block bg-gradient-to-br from-white/[0.08] via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-x-5 top-0 hidden h-px bg-gradient-to-r from-transparent via-white/60 to-transparent lg:block" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 lg:hidden" />

      {/* Content: two metrics side by side */}
      <div className="relative flex items-end justify-between">
        <HeroMetricColumn metric={left} />
        <HeroMetricColumn metric={right} align="right" />
      </div>
    </div>
  )
}

function HeroMetricColumn({
  metric,
  align = 'left',
}: {
  metric: HeroMetric
  align?: 'left' | 'right'
}) {
  const { label, value, description } = metric
  const valueText = typeof value === 'number' ? value.toLocaleString('es-CR') : String(value)
  const compactMobile = typeof value === 'number' ? null : compactCurrencyForMobile(valueText)

  return (
    <div className={align === 'right' ? 'text-right' : ''}>
      <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.1em] text-white/70">
        {label}
      </p>
      <p className="mt-1 font-bold tracking-tight leading-[1.05] whitespace-nowrap tabular-nums text-[32px] sm:text-[52px] text-white">
        {typeof value === 'number' ? (
          <AnimatedNumber value={value} />
        ) : compactMobile ? (
          <>
            <span className="sm:hidden">{compactMobile}</span>
            <span className="hidden sm:inline">{value}</span>
          </>
        ) : (
          value
        )}
      </p>
      <p className="mt-0.5 text-xs sm:text-sm text-white/60">{description}</p>
    </div>
  )
}
