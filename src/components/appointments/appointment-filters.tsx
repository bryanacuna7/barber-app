'use client'

import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge, type AppointmentStatus } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'

interface AppointmentFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: AppointmentStatus | 'all'
  onStatusFilterChange: (status: AppointmentStatus | 'all') => void
  className?: string
}

const statusOptions: { value: AppointmentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'confirmed', label: 'Confirmadas' },
  { value: 'completed', label: 'Completadas' },
  { value: 'cancelled', label: 'Canceladas' },
  { value: 'no_show', label: 'No asistió' }
]

export function AppointmentFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  className
}: AppointmentFiltersProps) {
  const hasActiveFilters = search || statusFilter !== 'all'

  const clearFilters = () => {
    onSearchChange('')
    onStatusFilterChange('all')
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            'w-full pl-12 pr-4 py-3 rounded-xl',
            'bg-white dark:bg-zinc-900',
            'border border-zinc-200 dark:border-zinc-800',
            'text-zinc-900 dark:text-zinc-100',
            'placeholder:text-zinc-400',
            'focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent',
            'transition-all duration-200'
          )}
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        )}
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-zinc-400 mr-1" />
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onStatusFilterChange(option.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium',
              'transition-all duration-200',
              'border',
              statusFilter === option.value
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent'
                : 'bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
            )}
          >
            {option.label}
          </button>
        ))}

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="ml-2 flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>
    </div>
  )
}
