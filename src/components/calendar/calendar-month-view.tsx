'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, isSameDay, startOfWeek, endOfWeek, addMinutes, parseISO, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronsUp, ChevronsDown } from 'lucide-react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Appointment = any

interface MonthDay {
  date: Date
  appointments: Appointment[]
  isCurrentMonth: boolean
}

interface CalendarMonthViewProps {
  monthDays: MonthDay[]
  today: Date
  selectedDate: Date
  onDayClick: (date: Date) => void
}

// Stable color palette for barberos
const BARBER_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
]

function hashBarberIdx(barberId: string): number {
  let hash = 0
  for (let i = 0; i < barberId.length; i++) {
    hash = (hash * 31 + barberId.charCodeAt(i)) & 0xffffffff
  }
  return Math.abs(hash) % BARBER_COLORS.length
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending: {
      label: 'Pendiente',
      className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    },
    confirmed: {
      label: 'Confirmada',
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    },
    completed: {
      label: 'Completada',
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    },
    cancelled: {
      label: 'Cancelada',
      className: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
    },
    no_show: {
      label: 'No Show',
      className: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
    },
    in_progress: {
      label: 'En curso',
      className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
    },
  }
  const pill = map[status] ?? map.pending
  return (
    <span
      className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-none ${pill.className}`}
    >
      {pill.label}
    </span>
  )
}

function MonthAppointmentRow({ apt }: { apt: Appointment }) {
  const startTime = isValid(parseISO(apt.scheduled_at))
    ? format(parseISO(apt.scheduled_at), 'H:mm')
    : '—'
  const endTime = isValid(parseISO(apt.scheduled_at))
    ? format(
        addMinutes(
          parseISO(apt.scheduled_at),
          apt.duration_minutes || apt.service?.duration_minutes || 30
        ),
        'H:mm'
      )
    : '—'
  const isCancelled = apt.status === 'cancelled' || apt.status === 'no_show'
  const accentColor =
    apt.status === 'completed'
      ? 'bg-emerald-500'
      : apt.status === 'confirmed'
        ? 'bg-blue-500'
        : apt.status === 'in_progress'
          ? 'bg-violet-500'
          : apt.status === 'cancelled'
            ? 'bg-zinc-400'
            : apt.status === 'no_show'
              ? 'bg-red-400'
              : 'bg-amber-400'

  return (
    <div className={`flex items-stretch gap-0 px-3 py-2.5 ${isCancelled ? 'opacity-40' : ''}`}>
      {/* Stacked time */}
      <div className="flex flex-col items-end justify-center w-10 shrink-0 mr-2">
        <span
          className={`text-[12px] font-semibold leading-tight ${isCancelled ? 'line-through' : 'text-foreground'}`}
        >
          {startTime}
        </span>
        <span className="text-[11px] leading-tight text-subtle">{endTime}</span>
      </div>
      {/* Color accent bar */}
      <div className={`w-[3px] rounded-full shrink-0 ${accentColor}`} />
      {/* Content */}
      <div className="flex-1 min-w-0 pl-2.5">
        <p
          className={`text-[13px] font-semibold leading-tight truncate ${isCancelled ? 'line-through text-muted' : 'text-foreground'}`}
        >
          {apt.service?.name || apt.notes || 'Sin servicio'}
        </p>
        <p className="text-[12px] text-subtle leading-tight truncate mt-0.5">
          {apt.client?.full_name || apt.client?.name || 'Cliente'}
        </p>
      </div>
      {/* Right: price + pill */}
      <div className="flex flex-col items-end justify-center shrink-0 pl-2 gap-1">
        <span
          className={`text-[13px] font-semibold tabular-nums ${isCancelled ? 'line-through text-muted' : 'text-foreground'}`}
        >
          {apt.service?.price != null
            ? `₡${Number(apt.service.price).toLocaleString('es-CR')}`
            : '—'}
        </span>
        <StatusPill status={apt.status} />
      </div>
    </div>
  )
}

// Group array of days into weeks (arrays of 7)
function groupIntoWeeks(days: MonthDay[]): MonthDay[][] {
  const weeks: MonthDay[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  return weeks
}

export const CalendarMonthView = React.memo(function CalendarMonthView({
  monthDays,
  today,
  selectedDate,
  onDayClick,
}: CalendarMonthViewProps) {
  const [collapsed, setCollapsed] = useState(false)

  // Build stable barber→color map from all appointments in the month
  const barberColorMap = useMemo(() => {
    const map = new Map<string, string>()
    monthDays.forEach((d) => {
      d.appointments.forEach((apt) => {
        const bid = apt.barber_id || apt.staff_id
        if (bid && !map.has(bid)) {
          map.set(bid, BARBER_COLORS[hashBarberIdx(bid)])
        }
      })
    })
    return map
  }, [monthDays])

  const allWeeks = useMemo(() => groupIntoWeeks(monthDays), [monthDays])

  // When collapsed, show only the week containing selectedDate
  const selectedWeekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const selectedWeekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })

  const visibleWeeks = collapsed
    ? allWeeks.filter((week) =>
        week.some((d) => d.date >= selectedWeekStart && d.date <= selectedWeekEnd)
      )
    : allWeeks

  // Appointments for selected day (sorted by time)
  const selectedDayApts = useMemo(() => {
    const dayEntry = monthDays.find((d) => isSameDay(d.date, selectedDate))
    if (!dayEntry) return []
    return [...dayEntry.appointments].sort((a, b) => {
      const aTime = a.scheduled_at ?? ''
      const bTime = b.scheduled_at ?? ''
      return aTime.localeCompare(bTime)
    })
  }, [monthDays, selectedDate])

  const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

  return (
    <div className="px-4">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((day, i) => (
          <div key={i} className="text-center text-[11px] font-semibold text-subtle py-1.5">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid — weeks animate in/out */}
      <div className="grid grid-cols-7 overflow-hidden">
        <AnimatePresence initial={false}>
          {visibleWeeks.map((week, wi) => (
            <motion.div
              key={`week-${week[0]?.date?.toISOString()}`}
              className="contents"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            >
              {week.map((day) => {
                const isToday = isSameDay(day.date, today)
                const isSelected = isSameDay(day.date, selectedDate)
                // Unique barber dots (max 3)
                const uniqueBarberIds: string[] = []
                day.appointments.forEach((apt) => {
                  const bid = apt.barber_id || apt.staff_id
                  if (bid && !uniqueBarberIds.includes(bid)) uniqueBarberIds.push(bid)
                })
                const dotBids = uniqueBarberIds.slice(0, 3)
                const hasOverflow = uniqueBarberIds.length > 3

                return (
                  <motion.button
                    key={day.date.toISOString()}
                    onClick={() => onDayClick(day.date)}
                    whileTap={{ scale: 0.9 }}
                    className={`flex flex-col items-center py-1.5 cursor-pointer rounded-xl transition-colors ${
                      !day.isCurrentMonth ? 'opacity-25' : ''
                    } ${isSelected && !isToday ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}
                  >
                    {/* Date number */}
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[13px] font-semibold leading-none transition-colors ${
                        isToday
                          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold'
                          : isSelected
                            ? 'text-foreground'
                            : 'text-foreground'
                      }`}
                    >
                      {format(day.date, 'd')}
                    </span>

                    {/* Barbero dots */}
                    <div className="flex items-center justify-center gap-[3px] mt-0.5 h-2">
                      {day.appointments.length === 0 && <span className="h-1.5 w-1.5 opacity-0" />}
                      {dotBids.map((bid) => (
                        <span
                          key={bid}
                          aria-hidden="true"
                          className={`inline-block w-1.5 h-1.5 rounded-full ${barberColorMap.get(bid) ?? 'bg-blue-500'}`}
                        />
                      ))}
                      {hasOverflow && (
                        <span className="text-[9px] leading-none text-subtle font-medium">···</span>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-1 mx-auto mt-2 mb-4 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-widest text-subtle hover:text-foreground transition-colors"
        aria-label={collapsed ? 'Expandir calendario' : 'Colapsar calendario'}
      >
        {collapsed ? (
          <>
            <ChevronsDown className="w-3.5 h-3.5" /> Expandir
          </>
        ) : (
          <>
            <ChevronsUp className="w-3.5 h-3.5" /> Colapsar
          </>
        )}
      </button>

      {/* Selected day appointment list */}
      <div className="space-y-1">
        {/* Day label */}
        <div className="flex items-center gap-2 px-1 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted">
            {format(selectedDate, "EEE d 'de' MMMM", { locale: es }).toUpperCase()}
          </span>
          {selectedDayApts.length > 0 && (
            <span className="text-[11px] text-subtle">
              — {selectedDayApts.length} cita{selectedDayApts.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {selectedDayApts.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200/80 dark:border-0 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-muted shadow-sm dark:shadow-none">
            Sin citas este día
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-0 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none divide-y divide-zinc-100/80 dark:divide-zinc-800/50">
            {selectedDayApts.map((apt) => (
              <MonthAppointmentRow key={apt.id} apt={apt} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
})
