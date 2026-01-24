'use client'

import { useMemo } from 'react'
import { format, isSameDay, setHours, setMinutes } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { AppointmentCard } from './appointment-card'
import { EmptyState } from '@/components/ui/empty-state'
import { Calendar } from 'lucide-react'
import type { Appointment } from '@/types'
import type { AppointmentStatus } from '@/components/ui/badge'

interface DayScheduleProps {
  date: Date
  appointments: (Appointment & {
    client?: { name: string; phone: string } | null
    service?: { name: string } | null
  })[]
  onAddAppointment?: (date: Date, hour: number) => void
  onStatusChange?: (id: string, status: AppointmentStatus) => void
  onEdit?: (appointment: Appointment) => void
  onDelete?: (id: string) => void
  onWhatsApp?: (phone: string) => void
  startHour?: number
  endHour?: number
  className?: string
}

export function DaySchedule({
  date,
  appointments,
  onAddAppointment,
  onStatusChange,
  onEdit,
  onDelete,
  onWhatsApp,
  startHour = 8,
  endHour = 20,
  className
}: DayScheduleProps) {
  const hours = useMemo(() => {
    const result = []
    for (let hour = startHour; hour < endHour; hour++) {
      result.push(hour)
    }
    return result
  }, [startHour, endHour])

  const getAppointmentsForHour = (hour: number) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.scheduled_at)
      return aptDate.getHours() === hour && isSameDay(aptDate, date)
    })
  }

  const dayAppointments = appointments.filter(apt =>
    isSameDay(new Date(apt.scheduled_at), date)
  )

  if (dayAppointments.length === 0) {
    return (
      <div className={className}>
        <EmptyState
          icon={Calendar}
          title="Sin citas programadas"
          description={`No hay citas para ${format(date, "EEEE, d 'de' MMMM", { locale: es })}`}
        />
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* Time grid */}
      <div className="space-y-0">
        {hours.map((hour) => {
          const hourAppointments = getAppointmentsForHour(hour)
          const timeLabel = `${hour.toString().padStart(2, '0')}:00`

          return (
            <div
              key={hour}
              className="group flex min-h-[80px] border-t border-zinc-200 dark:border-zinc-800 first:border-t-0"
            >
              {/* Time label */}
              <div className="w-16 flex-shrink-0 pt-2 pr-4 text-right">
                <span className="text-sm font-medium text-zinc-400">
                  {timeLabel}
                </span>
              </div>

              {/* Appointments slot */}
              <div className="flex-1 py-2 pl-4 border-l border-zinc-200 dark:border-zinc-800 relative">
                {hourAppointments.length > 0 ? (
                  <div className="space-y-2">
                    {hourAppointments.map((apt) => (
                      <AppointmentCard
                        key={apt.id}
                        appointment={apt}
                        variant="compact"
                        onStatusChange={onStatusChange}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onWhatsApp={onWhatsApp}
                      />
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={() => onAddAppointment?.(date, hour)}
                    className={cn(
                      'absolute inset-2 rounded-lg',
                      'border-2 border-dashed border-transparent',
                      'opacity-0 group-hover:opacity-100 group-hover:border-zinc-300 dark:group-hover:border-zinc-700',
                      'flex items-center justify-center',
                      'transition-all duration-200',
                      'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    )}
                  >
                    <Plus className="w-5 h-5 text-zinc-400" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
