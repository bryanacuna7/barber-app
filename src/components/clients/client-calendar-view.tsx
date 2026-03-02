'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { format, isSameDay, getDaysInMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import { getClientSegment } from '@/lib/utils/client-segments'
import { segmentConfig } from '@/components/clients/segment-config'
import { animations } from '@/lib/design-system'
import type { Client } from '@/types'

interface ClientCalendarViewProps {
  clients: Client[]
  currentMonth: Date
  setCurrentMonth: (date: Date) => void
  onClientClick?: (client: Client) => void
}

function getIntensityColor(count: number): string {
  if (count === 0) return 'bg-zinc-100 dark:bg-zinc-800'
  if (count === 1) return 'bg-blue-200 dark:bg-blue-900/40'
  if (count === 2) return 'bg-blue-400 dark:bg-blue-700'
  if (count >= 3) return 'bg-blue-600 dark:bg-blue-500'
  return 'bg-zinc-100 dark:bg-zinc-800'
}

export function ClientCalendarView({
  clients,
  currentMonth,
  setCurrentMonth,
  onClientClick,
}: ClientCalendarViewProps) {
  const goToPrevMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() - 1)
    setCurrentMonth(newMonth)
  }

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + 1)
    setCurrentMonth(newMonth)
  }

  const activeClientsThisMonth = useMemo(
    () =>
      clients.filter((c) => {
        if (!c.last_visit_at) return false
        const visitDate = new Date(c.last_visit_at)
        return (
          visitDate.getMonth() === currentMonth.getMonth() &&
          visitDate.getFullYear() === currentMonth.getFullYear()
        )
      }),
    [clients, currentMonth]
  )

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const daysInMonth = getDaysInMonth(currentMonth)
    const startDayOfWeek = firstDay.getDay() // 0 = Sunday
    const today = new Date()

    const days: React.ReactNode[] = []

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)

      const visitsOnDay = clients.filter((client) => {
        if (!client.last_visit_at) return false
        return isSameDay(new Date(client.last_visit_at), date)
      }).length

      const isToday = isSameDay(date, today)

      days.push(
        <motion.div
          key={day}
          className={`aspect-square rounded-lg ${getIntensityColor(visitsOnDay)} relative cursor-pointer transition-[filter] hover:brightness-110 ${
            isToday ? 'ring-2 ring-inset ring-purple-500' : ''
          }`}
          title={`${day} ${format(currentMonth, 'MMMM', { locale: es })} - ${visitsOnDay} visitas`}
        >
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-muted">
            {day}
          </span>
          {visitsOnDay > 0 && (
            <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-white" />
          )}
        </motion.div>
      )
    }

    return days
  }, [clients, currentMonth])

  return (
    <motion.div
      key="calendar"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm"
    >
      {/* Header with month navigation */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-foreground">Calendario de Actividad</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevMonth}
            className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ChevronRight className="h-5 w-5 rotate-180 text-muted" />
          </button>
          <span className="text-lg font-semibold text-foreground px-4">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </span>
          <button
            onClick={goToNextMonth}
            className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-muted" />
          </button>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {/* Day labels */}
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted pb-2">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">Menos</span>
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-4 w-4 rounded bg-blue-200 dark:bg-blue-900/40" />
            <div className="h-4 w-4 rounded bg-blue-400 dark:bg-blue-700" />
            <div className="h-4 w-4 rounded bg-blue-600 dark:bg-blue-500" />
          </div>
          <span className="text-sm text-muted">Más</span>
        </div>

        {/* Monthly visit count */}
        <div className="text-sm text-muted">{activeClientsThisMonth.length} visitas este mes</div>
      </div>

      {/* Active clients list for current month */}
      <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <h4 className="text-lg font-semibold text-foreground mb-4">Clientes Activos Este Mes</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeClientsThisMonth.slice(0, 6).map((client) => {
            const segment = getClientSegment(client)
            const config = segmentConfig[segment]
            const SegmentIcon = config.icon

            return (
              <motion.button
                key={client.id}
                onClick={() => onClientClick?.(client)}
                whileTap={{ scale: 0.98 }}
                transition={animations.spring.snappy}
                className="flex items-center gap-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 p-3 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 text-sm font-semibold text-zinc-600 dark:text-zinc-300 shrink-0">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="font-medium text-sm text-foreground truncate">{client.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <SegmentIcon className={`h-3 w-3 ${config.color.split(' ')[1]}`} />
                    <span className="text-xs text-muted truncate">
                      {client.total_visits} visitas
                    </span>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
