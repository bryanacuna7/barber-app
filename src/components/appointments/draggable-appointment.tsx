'use client'

import { memo } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { format } from 'date-fns'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { Appointment } from '@/types'

type AppointmentWithRelations = Appointment & {
  client?: { id: string; name: string; phone: string; email?: string } | null
  service?: { id: string; name: string; duration_minutes: number; price: number } | null
}

interface StatusColorMap {
  pending: string
  confirmed: string
  completed: string
  cancelled: string
  no_show: string
}

interface DraggableAppointmentProps {
  appointment: AppointmentWithRelations
  topPosition: number
  height: number
  statusColors: StatusColorMap
  isDragEnabled: boolean
  isBeingDragged: boolean
  onClick: () => void
  columnIndex?: number
  totalColumns?: number
}

export const DraggableAppointment = memo(function DraggableAppointment({
  appointment,
  topPosition,
  height,
  statusColors,
  isDragEnabled,
  isBeingDragged,
  onClick,
  columnIndex = 0,
  totalColumns = 1,
}: DraggableAppointmentProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: appointment.id,
    disabled: !isDragEnabled,
    data: {
      appointment,
    },
  })

  // Calculate width and left position for concurrent appointments
  // Use calc() to account for padding/margins between appointments
  const gapSize = totalColumns > 1 ? 6 : 8 // 6px gap for multiple, 8px for single
  const columnWidthPercent = 100 / totalColumns
  const leftPositionPercent = columnIndex * columnWidthPercent

  // During drag, remove absolute positioning to prevent compound transform offset
  // Only use transform for positioning when dragging
  const style: React.CSSProperties = isDragging
    ? {
        // When dragging, remove top positioning and only use transform
        height: `${Math.max(height, 30)}px`,
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        zIndex: 50,
      }
    : {
        // When not dragging, use absolute positioning with column-based width/left
        top: `${topPosition}px`,
        height: `${Math.max(height, 30)}px`,
        left: `calc(${leftPositionPercent}% + ${gapSize / 2}px)`,
        width: `calc(${columnWidthPercent}% - ${gapSize}px)`,
      }

  const aptDate = new Date(appointment.scheduled_at)

  // Dynamic content based on appointment height for better readability
  const showCompactView = height < 50
  const showMediumView = height >= 50 && height < 70

  // Build tooltip with full appointment details
  const serviceName = appointment.service?.name || 'Servicio no especificado'
  const duration = appointment.service?.duration_minutes || appointment.duration_minutes || 60
  const tooltipText = `${format(aptDate, 'HH:mm')} - ${appointment.client?.name || 'Sin cliente'}\n${serviceName} (${duration} min)`

  return (
    <div
      ref={setNodeRef}
      style={style}
      title={tooltipText}
      className={cn(
        !isDragging && 'absolute',
        isDragging && 'relative',
        'rounded-md border-l-4 pointer-events-auto',
        'text-left overflow-hidden',
        'transition-all duration-150',
        statusColors[appointment.status],
        isDragEnabled && 'cursor-grab hover:shadow-md hover:scale-[1.02]',
        isDragging && 'opacity-50 shadow-lg scale-105 cursor-grabbing',
        isBeingDragged && !isDragging && 'opacity-30',
        !isDragEnabled && 'cursor-pointer',
        // Dynamic padding based on size - increased for better breathing room
        showCompactView ? 'px-2 py-1.5' : 'p-3'
      )}
      onClick={(e) => {
        // Only trigger click if not dragging
        if (!isDragging) {
          e.stopPropagation()
          onClick()
        }
      }}
      {...(isDragEnabled ? { ...attributes, ...listeners } : {})}
    >
      {/* Drag handle indicator for draggable appointments */}
      {isDragEnabled && !showCompactView && (
        <div className="absolute top-1 right-1 opacity-40 hover:opacity-70 hidden md:block">
          <GripVertical className="w-3 h-3" />
        </div>
      )}

      {/* Compact view: Client name only (for small appointments) */}
      {showCompactView && (
        <div className="font-semibold text-[9px] leading-tight truncate pr-4">
          {appointment.client?.name || 'Sin cliente'}
        </div>
      )}

      {/* Medium view: Client name, one line (for medium appointments) */}
      {showMediumView && (
        <div className="font-semibold text-[10px] leading-tight truncate pr-4">
          {appointment.client?.name || 'Sin cliente'}
        </div>
      )}

      {/* Full view: Client name + service (for large appointments) */}
      {!showCompactView && !showMediumView && (
        <>
          <div className="font-semibold text-[10px] md:text-xs leading-tight truncate pr-4">
            {appointment.client?.name || 'Sin cliente'}
          </div>
          {appointment.service && (
            <div className="text-[9px] opacity-75 truncate mt-0.5">{appointment.service.name}</div>
          )}
        </>
      )}

      {/* Visual indicator that appointment is not draggable */}
      {!isDragEnabled &&
        (appointment.status === 'completed' ||
          appointment.status === 'cancelled' ||
          appointment.status === 'no_show') && (
          <div className="absolute inset-0 bg-zinc-500/5 pointer-events-none" />
        )}
    </div>
  )
})
