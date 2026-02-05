'use client'

import { memo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { format } from 'date-fns'
import { cn } from '@/lib/utils/cn'

interface DroppableTimeSlotProps {
  id: string
  day: Date
  hour: number
  isOver: boolean
  hasConflict: boolean
  isDragging: boolean
  onClick: () => void
}

export const DroppableTimeSlot = memo(function DroppableTimeSlot({
  id,
  day,
  hour,
  isOver,
  hasConflict,
  isDragging,
  onClick,
}: DroppableTimeSlotProps) {
  const { setNodeRef } = useDroppable({
    id,
    data: {
      day,
      hour,
    },
  })

  // Determine visual state
  const isValidDrop = isOver && !hasConflict
  const isInvalidDrop = isOver && hasConflict

  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      className={cn(
        'w-full h-[60px] border-b border-zinc-200 dark:border-zinc-700',
        'block p-0 outline-none', // Enforce block and remove potential padding
        'transition-colors duration-150',
        'text-left text-xs text-zinc-400',
        // Default hover state (when not dragging)
        !isDragging && 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
        // Dragging states - highlight drop zones
        isDragging && !isOver && !hasConflict && 'bg-blue-50/30 dark:bg-blue-900/10',
        // Valid drop zone (over and no conflict)
        isValidDrop && 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
        // Invalid drop zone (over but has conflict)
        isInvalidDrop && 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
        // Conflict indicator when dragging but not over this slot
        isDragging && hasConflict && !isOver && 'bg-red-50/50 dark:bg-red-900/10'
      )}
      aria-label={`Crear cita ${format(day, 'd MMM')} ${hour}:00`}
    >
      {/* Visual indicator when hovering during drag */}
      {isValidDrop && (
        <div className="flex items-center justify-center h-full">
          <span className="text-green-600 dark:text-green-400 text-[10px] font-medium">
            Soltar aqui
          </span>
        </div>
      )}
      {isInvalidDrop && (
        <div className="flex items-center justify-center h-full">
          <span className="text-red-600 dark:text-red-400 text-[10px] font-medium">
            Horario ocupado
          </span>
        </div>
      )}
    </button>
  )
})
