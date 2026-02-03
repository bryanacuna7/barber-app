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
    const dateObj = new Date(dateString)
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
      className={cn(
        'bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800',
        'px-4 py-5 sm:px-6',
        className
      )}
    >
      {/* Title Section */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white truncate">Mi Día</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 truncate">{barberName}</p>
        </div>

        {/* Date Badge */}
        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
          <Calendar className="h-4 w-4 text-zinc-600 dark:text-zinc-400" aria-hidden="true" />
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
          className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl px-3 py-2.5"
        >
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Total</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-0.5">{stats.total}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-blue-50 dark:bg-blue-950/30 rounded-xl px-3 py-2.5"
        >
          <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">Pendientes</p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-300 mt-0.5">
            {activeAppointments}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl px-3 py-2.5"
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
          <span>Actualizado {formatTime(lastUpdated)}</span>
        </motion.div>
      )}
    </motion.div>
  )
}
