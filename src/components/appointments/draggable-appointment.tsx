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
}

export const DraggableAppointment = memo(function DraggableAppointment({
  appointment,
  topPosition,
  height,
  statusColors,
  isDragEnabled,
  isBeingDragged,
  onClick,
}: DraggableAppointmentProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: appointment.id,
    disabled: !isDragEnabled,
    data: {
      appointment,
    },
  })

  // Remove absolute positioning during drag to prevent compound transform offset
  const style = {
    top: isDragging ? undefined : `${topPosition}px`,
    left: isDragging ? 0 : undefined,
    right: isDragging ? undefined : undefined,
    width: isDragging ? '140px' : undefined,
    height: `${Math.max(height, 40)}px`,
    ...(transform && {
      transform: CSS.Translate.toString(transform),
      zIndex: 50,
    }),
  }

  const aptDate = new Date(appointment.scheduled_at)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        !isDragging && 'absolute left-0.5 right-0.5 md:left-1 md:right-1',
        isDragging && 'relative',
        'rounded-md border-l-4 p-1 md:p-2 pointer-events-auto',
        'text-left text-[10px] md:text-xs overflow-hidden',
        'transition-all duration-150',
        statusColors[appointment.status],
        isDragEnabled && 'cursor-grab hover:shadow-md hover:scale-[1.02]',
        isDragging && 'opacity-50 shadow-lg scale-105 cursor-grabbing',
        isBeingDragged && !isDragging && 'opacity-30',
        !isDragEnabled && 'cursor-pointer'
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
      {isDragEnabled && (
        <div className="absolute top-1 right-1 opacity-40 hover:opacity-70 hidden md:block">
          <GripVertical className="w-3 h-3" />
        </div>
      )}

      <div className="font-semibold truncate pr-4">
        {format(aptDate, 'HH:mm')} - {appointment.client?.name || 'Sin cliente'}
      </div>
      {appointment.service && (
        <div className="text-[9px] md:text-[10px] opacity-80 truncate">
          {appointment.service.name}
        </div>
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
