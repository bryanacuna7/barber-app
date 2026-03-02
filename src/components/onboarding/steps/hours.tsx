'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IOSTimePicker, TimePickerTrigger } from '@/components/ui/ios-time-picker'
import { IOSToggle } from '@/components/ui/ios-toggle'

interface HoursProps {
  onNext: (hours: OperatingHours) => void
  onBack: () => void
  initialHours?: OperatingHours
}

interface DayHours {
  open: string
  close: string
  enabled: boolean
}

export interface OperatingHours {
  [key: string]: DayHours
}

const DAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
]

const DEFAULT_HOURS: OperatingHours = {
  monday: { open: '09:00', close: '18:00', enabled: true },
  tuesday: { open: '09:00', close: '18:00', enabled: true },
  wednesday: { open: '09:00', close: '18:00', enabled: true },
  thursday: { open: '09:00', close: '18:00', enabled: true },
  friday: { open: '09:00', close: '18:00', enabled: true },
  saturday: { open: '09:00', close: '18:00', enabled: true },
  sunday: { open: '09:00', close: '18:00', enabled: false },
}

export function Hours({ onNext, onBack, initialHours }: HoursProps) {
  const [hours, setHours] = useState<OperatingHours>(initialHours || DEFAULT_HOURS)
  const [pickerState, setPickerState] = useState<{
    isOpen: boolean
    day: string | null
    field: 'open' | 'close' | null
  }>({ isOpen: false, day: null, field: null })

  const handleToggleDay = (day: string) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }))
  }

  const openTimePicker = (day: string, field: 'open' | 'close') => {
    setPickerState({ isOpen: true, day, field })
  }

  const handleTimeChange = (value: string) => {
    if (pickerState.day && pickerState.field) {
      setHours((prev) => ({
        ...prev,
        [pickerState.day!]: { ...prev[pickerState.day!], [pickerState.field!]: value },
      }))
    }
    setPickerState({ isOpen: false, day: null, field: null })
  }

  const handleSubmit = () => {
    onNext(hours)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
          <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
          Horario de Atención
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Define los días y horarios en que tu barbería está abierta
        </p>
      </div>

      {/* Days list */}
      <div className="space-y-3 mb-8">
        {DAYS.map((day, index) => (
          <motion.div
            key={day.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`
              rounded-2xl bg-white dark:bg-zinc-800 p-4 border border-zinc-200 dark:border-zinc-700
              ${!hours[day.key].enabled ? 'opacity-50' : ''}
            `}
          >
            <div className="flex items-center justify-between gap-4">
              {/* Day name + toggle */}
              <div className="flex items-center gap-3 min-w-[140px]">
                <IOSToggle
                  checked={hours[day.key].enabled}
                  onChange={() => handleToggleDay(day.key)}
                />
                <span className="font-medium text-zinc-900 dark:text-white">{day.label}</span>
              </div>

              {/* Time pickers */}
              {hours[day.key].enabled && (
                <div className="flex items-center gap-3">
                  <TimePickerTrigger
                    value={hours[day.key].open}
                    onClick={() => openTimePicker(day.key, 'open')}
                  />
                  <span className="text-zinc-400 dark:text-zinc-600">—</span>
                  <TimePickerTrigger
                    value={hours[day.key].close}
                    onClick={() => openTimePicker(day.key, 'close')}
                  />
                </div>
              )}

              {!hours[day.key].enabled && (
                <span className="text-sm text-zinc-400 dark:text-zinc-600">Cerrado</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-between">
        <Button variant="outline" onClick={onBack} className="group">
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Atrás
        </Button>
        <Button onClick={handleSubmit} className="group bg-blue-600 hover:bg-blue-700 text-white">
          Continuar
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>

      {/* Time Picker Modal */}
      <IOSTimePicker
        isOpen={pickerState.isOpen}
        onClose={() => setPickerState({ isOpen: false, day: null, field: null })}
        value={
          pickerState.day && pickerState.field ? hours[pickerState.day][pickerState.field] : '09:00'
        }
        onChange={handleTimeChange}
        title={pickerState.field === 'open' ? 'Hora de Apertura' : 'Hora de Cierre'}
      />
    </motion.div>
  )
}
