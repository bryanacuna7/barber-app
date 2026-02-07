/**
 * RelationshipStrength Component
 *
 * Visual indicator of client relationship strength
 * Based on demo-fusion.html design
 */

import { Heart } from 'lucide-react'

interface RelationshipStrengthProps {
  strength: 'weak' | 'moderate' | 'strong' | 'excellent'
  className?: string
}

const strengthConfig = {
  weak: {
    label: 'Débil',
    color: 'text-zinc-400 dark:text-zinc-500',
    bgColor: 'bg-zinc-100 dark:bg-zinc-800',
    hearts: 1,
  },
  moderate: {
    label: 'Moderada',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    hearts: 2,
  },
  strong: {
    label: 'Fuerte',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    hearts: 3,
  },
  excellent: {
    label: 'Excelente',
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    hearts: 4,
  },
}

export function RelationshipStrength({ strength, className = '' }: RelationshipStrengthProps) {
  const config = strengthConfig[strength]

  return (
    <div className={`rounded-xl p-4 ${config.bgColor} ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Relación</span>
        <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Heart
            key={i}
            className={`h-5 w-5 ${
              i < config.hearts
                ? `${config.color} fill-current`
                : 'text-zinc-300 dark:text-zinc-700'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
