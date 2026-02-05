'use client'

import React from 'react'
import { ComponentErrorBoundary } from './ComponentErrorBoundary'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, User, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { StatusBadge } from '@/components/ui/badge'
import type { AppointmentStatus } from '@/components/ui/badge'

interface CalendarErrorBoundaryProps {
  children: React.ReactNode
  appointments?: Array<{
    id: string
    start_time: string
    client_name: string
    service_name: string
    status: AppointmentStatus
  }>
  onReset?: () => void
}

/**
 * Calendar Error Boundary with Simple List Fallback
 *
 * When calendar rendering fails (complex 5-view system with 953 lines),
 * falls back to a simple list view of appointments.
 *
 * Reason: Calendar has high complexity (Day/Week/Month/List/Timeline views)
 */
function CalendarFallback({
  appointments,
  onRetry,
}: {
  appointments?: CalendarErrorBoundaryProps['appointments']
  onRetry?: () => void
}) {
  // Group appointments by date
  const groupedByDate = React.useMemo(() => {
    if (!appointments || appointments.length === 0) return {}

    return appointments.reduce(
      (acc, apt) => {
        const date = format(new Date(apt.start_time), 'yyyy-MM-dd')
        if (!acc[date]) acc[date] = []
        acc[date].push(apt)
        return acc
      },
      {} as Record<string, typeof appointments>
    )
  }, [appointments])

  const dates = Object.keys(groupedByDate).sort()

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Vista Simplificada
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              El calendario principal no está disponible temporalmente
            </p>
          </div>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Recargar calendario
            </Button>
          )}
        </div>

        {/* Simple List */}
        {dates.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 dark:text-gray-400">No hay citas programadas</p>
          </div>
        ) : (
          <div className="space-y-6">
            {dates.map((date) => {
              const dateObj = new Date(date)
              const dayAppointments = groupedByDate[date]

              return (
                <div key={date} className="space-y-3">
                  {/* Date Header */}
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Calendar className="h-4 w-4" />
                    {format(dateObj, "EEEE d 'de' MMMM", { locale: es })}
                  </div>

                  {/* Appointments for this date */}
                  <div className="space-y-2">
                    {dayAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-12 text-center">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {format(new Date(apt.start_time), 'HH:mm')}
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {apt.client_name}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {apt.service_name}
                          </p>
                        </div>

                        <div className="flex-shrink-0">
                          <StatusBadge status={apt.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}

export function CalendarErrorBoundary({
  children,
  appointments,
  onReset,
}: CalendarErrorBoundaryProps) {
  return (
    <ComponentErrorBoundary
      fallback={<CalendarFallback appointments={appointments} onRetry={onReset} />}
      fallbackTitle="Error en el calendario"
      fallbackDescription="No se pudo cargar la vista de calendario"
      showReset={false} // Custom reset button in fallback
      onReset={onReset}
      onError={(error) => {
        console.error('[CalendarErrorBoundary] Calendar rendering failed:', error)
      }}
    >
      {children}
    </ComponentErrorBoundary>
  )
}

export default CalendarErrorBoundary
