/**
 * Client Segment Visual Configuration
 *
 * UI constants (labels, colors, icons) for client segments.
 * Business logic lives in @/lib/utils/client-segments.ts
 */

import { Crown, Star, UserPlus, User } from 'lucide-react'
import type { ClientSegmentType } from '@/lib/utils/client-segments'

export const segmentConfig: Record<
  ClientSegmentType,
  {
    label: string
    color: string
    icon: typeof Crown
    description: string
  }
> = {
  vip: {
    label: 'VIP',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    icon: Crown,
    description: '5+ visitas o ₡50,000+ gastados',
  },
  frequent: {
    label: 'Frecuente',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    icon: Star,
    description: '3-4 visitas',
  },
  new: {
    label: 'Nuevo',
    color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    icon: UserPlus,
    description: '1-2 visitas',
  },
  inactive: {
    label: 'Inactivo',
    color: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
    icon: User,
    description: 'Sin visitas en 30+ días',
  },
}
