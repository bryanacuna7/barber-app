'use client'

import { Search, X } from 'lucide-react'
import type { AppointmentStatus } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'

interface AppointmentFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: AppointmentStatus | 'all'
  onStatusFilterChange: (status: AppointmentStatus | 'all') => void
  className?: string
}

const statusOptions: { value: AppointmentStatus | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'Todas', color: 'bg-zinc-500' },
  { value: 'pending', label: 'Pendientes', color: 'bg-blue-500' },
  { value: 'confirmed', label: 'Confirmadas', color: 'bg-blue-500' },
  { value: 'completed', label: 'Listas', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Canceladas', color: 'bg-red-500' },
  { value: 'no_show', label: 'No vino', color: 'bg-zinc-400' },
]

export function AppointmentFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  className,
}: AppointmentFiltersProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Search - más compacto */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 dark:text-zinc-500" />
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            'w-full pl-10 pr-10 py-2.5 rounded-xl text-sm',
            'bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50',
            'text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-500',
            'focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600',
            'transition-colors shadow-sm'
          )}
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        )}
      </div>

      {/* Status Filter - scroll horizontal, más compacto */}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onStatusFilterChange(option.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shrink-0',
                'transition-[background-color,border-color,color,transform] active:scale-95 border',
                statusFilter === option.value
                  ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800/60 dark:text-zinc-400 dark:border-zinc-700/40 dark:hover:bg-zinc-700/60'
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full', option.color)} />
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
