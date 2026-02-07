/**
 * SpendingTier Component
 *
 * Visual indicator of client spending tier
 * Based on demo-fusion.html design
 */

import { Award, TrendingUp } from 'lucide-react'

interface SpendingTierProps {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  amount: number
  className?: string
}

const tierConfig = {
  bronze: {
    label: 'Bronce',
    color: 'text-amber-700 dark:text-amber-600',
    bgColor:
      'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
    borderColor: 'border-amber-300 dark:border-amber-700',
    iconBg: 'bg-amber-500/20',
  },
  silver: {
    label: 'Plata',
    color: 'text-zinc-600 dark:text-zinc-400',
    bgColor: 'bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-700',
    borderColor: 'border-zinc-300 dark:border-zinc-600',
    iconBg: 'bg-zinc-500/20',
  },
  gold: {
    label: 'Oro',
    color: 'text-yellow-600 dark:text-yellow-500',
    bgColor:
      'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20',
    borderColor: 'border-yellow-400 dark:border-yellow-600',
    iconBg: 'bg-yellow-500/20',
  },
  platinum: {
    label: 'Platino',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor:
      'bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
    borderColor: 'border-purple-400 dark:border-purple-600',
    iconBg: 'bg-purple-500/20',
  },
}

export function SpendingTier({ tier, amount, className = '' }: SpendingTierProps) {
  const config = tierConfig[tier]

  return (
    <div className={`rounded-xl p-4 border-2 ${config.bgColor} ${config.borderColor} ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`rounded-lg p-2 ${config.iconBg}`}>
          <Award className={`h-5 w-5 ${config.color}`} />
        </div>
        <TrendingUp className={`h-4 w-4 ${config.color}`} />
      </div>
      <div>
        <p className={`text-sm font-medium mb-1 ${config.color}`}>Nivel {config.label}</p>
        <p className="text-2xl font-bold text-zinc-900 dark:text-white">
          ₡{amount.toLocaleString('es-CR')}
        </p>
        <p className="text-xs text-muted mt-1">Gastado histórico</p>
      </div>
    </div>
  )
}
