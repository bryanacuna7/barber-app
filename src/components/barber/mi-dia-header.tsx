'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface MiDiaHeaderProps {
  barberName: string
  date: string
  stats: {
    total: number
    pending: number
    confirmed: number
    completed: number
    cancelled: number
    no_show: number
  }
  lastUpdated: Date | null
  className?: string
}

/**
 * Header component for Mi Dia staff view
 * Shows date, barber name, summary stats, and last updated time
 */
export function MiDiaHeader({ barberName, date, stats, lastUpdated, className }: MiDiaHeaderProps) {
  const formatDate = (dateString: string) => {
    // Append T12:00:00 to avoid UTC midnight timezone shift
    // "2026-02-09" parsed as UTC → in CR (UTC-6) becomes Feb 8 at 6PM
    const dateObj = new Date(`${dateString}T12:00:00`)
    return new Intl.DateTimeFormat('es-CR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(dateObj)
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('es-CR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const activeAppointments = stats.pending + stats.confirmed

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('px-0 py-5 sm:px-0', className)}
      data-testid="mi-dia-header"
    >
      {/* Title Section */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white truncate">Mi Día</h1>
          <p className="text-sm text-muted mt-1 truncate" data-testid="barber-name">
            {barberName}
          </p>
        </div>

        {/* Date Badge */}
        <div
          className="flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl"
          data-testid="current-date"
        >
          <Calendar className="h-4 w-4 text-muted" aria-hidden="true" />
          <span className="text-sm font-medium text-zinc-900 dark:text-white capitalize">
            {formatDate(date)}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-50 dark:bg-zinc-800/60 rounded-xl px-3 py-2.5"
          data-testid="stat-total"
        >
          <p className="text-xs text-muted font-medium">Total</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-0.5">{stats.total}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-blue-50 dark:bg-blue-950/30 rounded-xl px-3 py-2.5"
          data-testid="stat-pending"
        >
          <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">Agendadas</p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-300 mt-0.5">
            {activeAppointments}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl px-3 py-2.5"
          data-testid="stat-completed"
        >
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Completadas</p>
          <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 mt-0.5">
            {stats.completed}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-amber-50 dark:bg-amber-950/30 rounded-xl px-3 py-2.5"
          data-testid="stat-no-show"
        >
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">No asistió</p>
          <p className="text-2xl font-bold text-amber-900 dark:text-amber-300 mt-0.5">
            {stats.no_show}
          </p>
        </motion.div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-1.5 mt-3 text-xs text-zinc-500 dark:text-zinc-500"
          aria-live="polite"
        >
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          <span data-testid="last-updated">Actualizado {formatTime(lastUpdated)}</span>
        </motion.div>
      )}
    </motion.div>
  )
}
