'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { IOSTimePicker, TimePickerTrigger } from '@/components/ui/ios-time-picker'
import { IOSToggle } from '@/components/ui/ios-toggle'
import { FadeInUp, StaggeredList, StaggeredItem } from '@/components/ui/motion'
import { AdvancedSettingsSection } from '@/components/settings/advanced-settings-section'
import { useBusiness } from '@/contexts/business-context'
import { useBusinessSettings, useUpdateBusinessSettings } from '@/hooks/queries/useSettings'
import { ComponentErrorBoundary } from '@/components/error-boundaries/ComponentErrorBoundary'
import { QueryError } from '@/components/ui/query-error'
import type { OperatingHours, DayHours } from '@/types'
import { SettingsSubrouteHeader } from '@/components/settings/settings-subroute-header'

const DAYS = [
  { key: 'mon', label: 'Lunes', short: 'Lun' },
  { key: 'tue', label: 'Martes', short: 'Mar' },
  { key: 'wed', label: 'Miércoles', short: 'Mié' },
  { key: 'thu', label: 'Jueves', short: 'Jue' },
  { key: 'fri', label: 'Viernes', short: 'Vie' },
  { key: 'sat', label: 'Sábado', short: 'Sáb' },
  { key: 'sun', label: 'Domingo', short: 'Dom' },
] as const

const DEFAULT_HOURS: DayHours = { open: '09:00', close: '18:00' }

type TimePickerState = {
  isOpen: boolean
  day: keyof OperatingHours | null
  field: 'open' | 'close'
}

export default function HorarioSettingsPage() {
  const router = useRouter()
  const { businessId } = useBusiness()
  const toast = useToast()

  const { data: business, isLoading: loading, error, refetch } = useBusinessSettings(businessId)
  const updateSettings = useUpdateBusinessSettings()

  const [timePicker, setTimePicker] = useState<TimePickerState>({
    isOpen: false,
    day: null,
    field: 'open',
  })

  const [formData, setFormData] = useState({
    booking_buffer_minutes: 15,
    advance_booking_days: 14,
    operating_hours: {
      mon: { ...DEFAULT_HOURS },
      tue: { ...DEFAULT_HOURS },
      wed: { ...DEFAULT_HOURS },
      thu: { ...DEFAULT_HOURS },
      fri: { ...DEFAULT_HOURS },
      sat: { open: '09:00', close: '14:00' },
      sun: null,
    } as OperatingHours,
  })

  // Sync form data with React Query data
  useEffect(() => {
    if (business) {
      setFormData({
        booking_buffer_minutes: business.bookingConfig?.bufferMinutes || 15,
        advance_booking_days: business.bookingConfig?.advanceBookingDays || 14,
        operating_hours:
          (business.operatingHours as unknown as OperatingHours) || formData.operating_hours,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business])

  function openTimePicker(day: keyof OperatingHours, field: 'open' | 'close') {
    setTimePicker({ isOpen: true, day, field })
  }

  function handleTimeChange(value: string) {
    if (!timePicker.day) return

    setFormData((prev) => ({
      ...prev,
      operating_hours: {
        ...prev.operating_hours,
        [timePicker.day!]: {
          ...(prev.operating_hours[timePicker.day!] || DEFAULT_HOURS),
          [timePicker.field]: value,
        },
      },
    }))
  }

  function toggleDay(day: keyof OperatingHours) {
    setFormData((prev) => ({
      ...prev,
      operating_hours: {
        ...prev.operating_hours,
        [day]: prev.operating_hours[day] ? null : { ...DEFAULT_HOURS },
      },
    }))
  }

  async function handleSave() {
    if (!businessId) return
    try {
      await updateSettings.mutateAsync({
        id: businessId,
        updates: {
          operating_hours: formData.operating_hours,
          booking_buffer_minutes: formData.booking_buffer_minutes,
          advance_booking_days: formData.advance_booking_days,
        },
      })
      toast.success('Horario guardado correctamente')
      router.refresh()
    } catch {
      toast.error('Error al guardar el horario')
    }
  }

  const currentTimeValue =
    timePicker.day && formData.operating_hours[timePicker.day]
      ? (formData.operating_hours[timePicker.day] as DayHours)[timePicker.field]
      : '09:00'

  // Error state
  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <QueryError error={error} onRetry={() => refetch()} title="Error al cargar horario" />
      </div>
    )
  }

  // Loading state
  if (loading || !business) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-8 w-8 rounded-full border-[3px] border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white"
        />
      </div>
    )
  }

  return (
    <ComponentErrorBoundary
      fallbackTitle="Error en Horario de Atención"
      fallbackDescription="Ocurrió un error al cargar la página de horario"
    >
      <div className="min-h-screen pb-24 lg:pb-6">
        {/* Header */}
        <FadeInUp>
          <SettingsSubrouteHeader
            title="Horario de Atención"
            subtitle="Días y horas de operación, tiempos de buffer"
          />
        </FadeInUp>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Operating Hours */}
          <FadeInUp delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[17px]">
                  <Clock className="h-5 w-5" />
                  Horario de Atención
                </CardTitle>
                <CardDescription>Toca las horas para cambiarlas</CardDescription>
              </CardHeader>
              <CardContent>
                <StaggeredList className="space-y-2">
                  {DAYS.map(({ key, label, short }) => {
                    const hours = formData.operating_hours[key]
                    const isOpen = hours !== null && hours !== undefined

                    return (
                      <StaggeredItem key={key}>
                        <motion.div
                          layout
                          className={`flex items-center gap-3 rounded-2xl p-3 transition-colors border-2 ${
                            isOpen
                              ? 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
                              : 'bg-zinc-50 dark:bg-zinc-900/30 border-zinc-200/50 dark:border-zinc-800/50'
                          }`}
                        >
                          <IOSToggle checked={isOpen} onChange={() => toggleDay(key)} size="sm" />
                          <span
                            className={`text-[15px] font-medium w-20 sm:w-24 ${
                              isOpen
                                ? 'text-zinc-900 dark:text-white'
                                : 'text-zinc-400 dark:text-zinc-600'
                            }`}
                          >
                            <span className="hidden sm:inline">{label}</span>
                            <span className="sm:hidden">{short}</span>
                          </span>
                          {isOpen ? (
                            <div className="flex items-center gap-2 ml-auto">
                              <TimePickerTrigger
                                value={hours?.open || '09:00'}
                                onClick={() => openTimePicker(key, 'open')}
                              />
                              <span className="text-zinc-400 text-[15px]">a</span>
                              <TimePickerTrigger
                                value={hours?.close || '18:00'}
                                onClick={() => openTimePicker(key, 'close')}
                              />
                            </div>
                          ) : (
                            <span className="text-[15px] text-zinc-400 ml-auto">Cerrado</span>
                          )}
                        </motion.div>
                      </StaggeredItem>
                    )
                  })}
                </StaggeredList>
              </CardContent>
            </Card>
          </FadeInUp>

          {/* Booking Settings - With Progressive Disclosure */}
          <FadeInUp delay={0.15}>
            <AdvancedSettingsSection
              title="Configuración Avanzada de Reservas"
              description="Personaliza tiempos de buffer y anticipación de reservas"
              badge="Avanzado"
              defaultExpanded={false}
            >
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div id="buffer-time">
                    <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wide text-muted">
                      Tiempo entre citas
                    </label>
                    <select
                      value={formData.booking_buffer_minutes}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          booking_buffer_minutes: Number(e.target.value),
                        }))
                      }
                      className="w-full h-12 rounded-xl border-0 bg-zinc-100/80 px-4 text-[15px] text-zinc-900 dark:bg-zinc-800/80 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:focus:ring-white/20 transition-all"
                    >
                      <option value={0}>Sin tiempo extra</option>
                      <option value={5}>5 minutos</option>
                      <option value={10}>10 minutos</option>
                      <option value={15}>15 minutos</option>
                      <option value={30}>30 minutos</option>
                    </select>
                    <p className="mt-2 text-[12px] text-muted">
                      Tiempo adicional entre citas para preparación o limpieza
                    </p>
                  </div>
                  <div id="advance-booking">
                    <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wide text-muted">
                      Días de anticipación
                    </label>
                    <select
                      value={formData.advance_booking_days}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          advance_booking_days: Number(e.target.value),
                        }))
                      }
                      className="w-full h-12 rounded-xl border-0 bg-zinc-100/80 px-4 text-[15px] text-zinc-900 dark:bg-zinc-800/80 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:focus:ring-white/20 transition-all"
                    >
                      <option value={7}>1 semana</option>
                      <option value={14}>2 semanas</option>
                      <option value={21}>3 semanas</option>
                      <option value={30}>1 mes</option>
                      <option value={60}>2 meses</option>
                    </select>
                    <p className="mt-2 text-[12px] text-muted">
                      Con cuánta anticipación los clientes pueden reservar
                    </p>
                  </div>
                </div>
              </div>
            </AdvancedSettingsSection>
          </FadeInUp>
        </div>

        {/* iOS Time Picker Sheet */}
        <IOSTimePicker
          isOpen={timePicker.isOpen}
          onClose={() => setTimePicker((prev) => ({ ...prev, isOpen: false }))}
          value={currentTimeValue}
          onChange={handleTimeChange}
          title={timePicker.field === 'open' ? 'Hora de apertura' : 'Hora de cierre'}
        />

        {/* Sticky Save Button */}
        <div className="fixed bottom-20 lg:bottom-6 left-0 right-0 lg:left-64 px-4 lg:px-8 z-30">
          <div className="max-w-3xl mx-auto">
            <Button
              onClick={handleSave}
              isLoading={updateSettings.isPending}
              className="w-full h-12 text-[15px] font-semibold shadow-lg"
            >
              <Save className="h-5 w-5 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </div>
      </div>
    </ComponentErrorBoundary>
  )
}
