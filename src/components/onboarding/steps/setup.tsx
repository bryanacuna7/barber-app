'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Scissors, User, ChevronDown, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IOSTimePicker, TimePickerTrigger } from '@/components/ui/ios-time-picker'
import { IOSToggle } from '@/components/ui/ios-toggle'
import { animations } from '@/lib/design-system'

// ─── Types ─────────────────────────────────────────────

export interface OperatingHours {
  [key: string]: { open: string; close: string; enabled: boolean }
}

export interface ServiceData {
  name: string
  price: number
  duration_minutes: number
}

export interface BarberData {
  name: string
  phone: string
  email: string
}

interface SetupProps {
  onNext: (data: { hours: OperatingHours; service: ServiceData; barber: BarberData }) => void
  onBack: () => void
  initialData?: {
    hours?: OperatingHours
    service?: ServiceData
    barber?: BarberData
  }
  businessName: string
}

// ─── Constants ─────────────────────────────────────────

const DAYS = [
  { key: 'monday', label: 'Lun' },
  { key: 'tuesday', label: 'Mar' },
  { key: 'wednesday', label: 'Mié' },
  { key: 'thursday', label: 'Jue' },
  { key: 'friday', label: 'Vie' },
  { key: 'saturday', label: 'Sáb' },
  { key: 'sunday', label: 'Dom' },
]

export const DEFAULT_HOURS: OperatingHours = {
  monday: { open: '09:00', close: '18:00', enabled: true },
  tuesday: { open: '09:00', close: '18:00', enabled: true },
  wednesday: { open: '09:00', close: '18:00', enabled: true },
  thursday: { open: '09:00', close: '18:00', enabled: true },
  friday: { open: '09:00', close: '18:00', enabled: true },
  saturday: { open: '09:00', close: '18:00', enabled: true },
  sunday: { open: '09:00', close: '18:00', enabled: false },
}

const SERVICE_SUGGESTIONS = [
  { name: 'Corte Regular', price: 5000, duration_minutes: 30 },
  { name: 'Corte + Barba', price: 8000, duration_minutes: 45 },
  { name: 'Afeitado Clásico', price: 6000, duration_minutes: 40 },
  { name: 'Corte Niño', price: 4000, duration_minutes: 25 },
]

type Section = 'hours' | 'service' | 'barber'

// ─── Component ─────────────────────────────────────────

export function Setup({ onNext, onBack, initialData, businessName }: SetupProps) {
  const [openSection, setOpenSection] = useState<Section>('hours')
  const [hours, setHours] = useState<OperatingHours>(initialData?.hours || DEFAULT_HOURS)
  const [service, setService] = useState<ServiceData>(
    initialData?.service || { name: 'Corte Regular', price: 5000, duration_minutes: 30 }
  )
  const [barber, setBarber] = useState<BarberData>(
    initialData?.barber || { name: businessName, phone: '', email: '' }
  )
  const [ownerCuts, setOwnerCuts] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pickerState, setPickerState] = useState<{
    isOpen: boolean
    day: string | null
    field: 'open' | 'close' | null
  }>({ isOpen: false, day: null, field: null })

  // ─── Hours handlers ────────────────────────────────

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

  // ─── Summaries ─────────────────────────────────────

  const hoursSummary = () => {
    const enabled = DAYS.filter((d) => hours[d.key].enabled)
    if (enabled.length === 0) return 'Sin horario'
    const first = enabled[0]
    const allSameTime = enabled.every(
      (d) =>
        hours[d.key].open === hours[first.key].open && hours[d.key].close === hours[first.key].close
    )
    if (allSameTime) {
      const dayLabels = enabled.map((d) => d.label).join(', ')
      return `${dayLabels} ${hours[first.key].open}–${hours[first.key].close}`
    }
    return `${enabled.length} días configurados`
  }

  const serviceSummary = () => {
    if (!service.name) return 'Sin servicio'
    return `${service.name} — ₡${service.price.toLocaleString()} (${service.duration_minutes} min)`
  }

  const barberSummary = () => {
    if (ownerCuts) return businessName
    return barber.name || 'Sin barbero'
  }

  // ─── Submit ────────────────────────────────────────

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}
    if (!service.name.trim()) newErrors.service_name = 'Nombre del servicio requerido'
    if (service.price <= 0) newErrors.service_price = 'Precio debe ser mayor a 0'
    if (!ownerCuts && !barber.name.trim()) newErrors.barber_name = 'Nombre del barbero requerido'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      // Open the section with the error
      if (newErrors.service_name || newErrors.service_price) setOpenSection('service')
      else if (newErrors.barber_name) setOpenSection('barber')
      return
    }

    const finalBarber = ownerCuts
      ? { name: businessName, phone: barber.phone, email: barber.email }
      : barber

    onNext({ hours, service, barber: finalBarber })
  }

  // ─── Accordion section helper ──────────────────────

  const toggle = (section: Section) => {
    setOpenSection((prev) => (prev === section ? prev : section))
  }

  const sections: {
    key: Section
    icon: typeof Clock
    title: string
    summary: () => string
    iconBg: string
    iconColor: string
  }[] = [
    {
      key: 'hours',
      icon: Clock,
      title: 'Horario',
      summary: hoursSummary,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      key: 'service',
      icon: Scissors,
      title: 'Servicio',
      summary: serviceSummary,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      key: 'barber',
      icon: User,
      title: 'Barbero',
      summary: barberSummary,
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Personalizar</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Ajustá lo que necesites. Todo viene pre-configurado.
        </p>
      </div>

      {/* Accordion */}
      <div className="space-y-3 mb-8">
        {sections.map((section) => {
          const isOpen = openSection === section.key
          const Icon = section.icon

          return (
            <div
              key={section.key}
              className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden"
            >
              {/* Section header */}
              <button
                type="button"
                onClick={() => toggle(section.key)}
                className="flex items-center justify-between w-full p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${section.iconBg}`}
                  >
                    <Icon className={`h-[18px] w-[18px] ${section.iconColor}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white text-[15px]">
                      {section.title}
                    </p>
                    {!isOpen && <p className="text-sm text-muted mt-0.5">{section.summary()}</p>}
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={animations.spring.gentle}
                >
                  <ChevronDown className="h-5 w-5 text-zinc-400" />
                </motion.div>
              </button>

              {/* Section content */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={animations.spring.gentle}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-1">
                      {section.key === 'hours' && (
                        <HoursSection
                          hours={hours}
                          onToggleDay={handleToggleDay}
                          onOpenPicker={openTimePicker}
                        />
                      )}
                      {section.key === 'service' && (
                        <ServiceSection
                          service={service}
                          onChange={setService}
                          errors={errors}
                          onClearError={(key) =>
                            setErrors((prev) => {
                              const next = { ...prev }
                              delete next[key]
                              return next
                            })
                          }
                        />
                      )}
                      {section.key === 'barber' && (
                        <BarberSection
                          barber={barber}
                          ownerCuts={ownerCuts}
                          onOwnerCutsChange={setOwnerCuts}
                          onChange={setBarber}
                          businessName={businessName}
                          errors={errors}
                          onClearError={(key) =>
                            setErrors((prev) => {
                              const next = { ...prev }
                              delete next[key]
                              return next
                            })
                          }
                        />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
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

// ─── Sub-sections ────────────────────────────────────────

function HoursSection({
  hours,
  onToggleDay,
  onOpenPicker,
}: {
  hours: OperatingHours
  onToggleDay: (day: string) => void
  onOpenPicker: (day: string, field: 'open' | 'close') => void
}) {
  return (
    <div className="space-y-2">
      {DAYS.map((day) => (
        <div
          key={day.key}
          className={`flex items-center justify-between gap-3 rounded-xl p-3 ${
            !hours[day.key].enabled ? 'opacity-50' : ''
          }`}
        >
          <div className="flex items-center gap-3 min-w-[80px]">
            <IOSToggle checked={hours[day.key].enabled} onChange={() => onToggleDay(day.key)} />
            <span className="font-medium text-sm text-zinc-900 dark:text-white w-8">
              {day.label}
            </span>
          </div>
          {hours[day.key].enabled ? (
            <div className="flex items-center gap-2">
              <TimePickerTrigger
                value={hours[day.key].open}
                onClick={() => onOpenPicker(day.key, 'open')}
              />
              <span className="text-zinc-400 text-sm">—</span>
              <TimePickerTrigger
                value={hours[day.key].close}
                onClick={() => onOpenPicker(day.key, 'close')}
              />
            </div>
          ) : (
            <span className="text-sm text-zinc-400">Cerrado</span>
          )}
        </div>
      ))}
    </div>
  )
}

function ServiceSection({
  service,
  onChange,
  errors,
  onClearError,
}: {
  service: ServiceData
  onChange: (s: ServiceData) => void
  errors: Record<string, string>
  onClearError: (key: string) => void
}) {
  return (
    <div className="space-y-4">
      {/* Suggestions */}
      <div className="flex flex-wrap gap-2">
        {SERVICE_SUGGESTIONS.map((s) => (
          <button
            key={s.name}
            type="button"
            onClick={() => {
              onChange(s)
              onClearError('service_name')
              onClearError('service_price')
            }}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              service.name === s.name
                ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 ring-1 ring-purple-300 dark:ring-purple-700'
                : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Fields */}
      <div className="space-y-3">
        <div>
          <Input
            type="text"
            value={service.name}
            onChange={(e) => {
              onChange({ ...service, name: e.target.value })
              onClearError('service_name')
            }}
            placeholder="Nombre del servicio"
            className={errors.service_name ? 'border-red-500' : ''}
          />
          {errors.service_name && (
            <p className="text-xs text-red-500 mt-1">{errors.service_name}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                ₡
              </span>
              <Input
                type="number"
                value={service.price}
                onChange={(e) => {
                  onChange({ ...service, price: Number(e.target.value) })
                  onClearError('service_price')
                }}
                className={`pl-7 ${errors.service_price ? 'border-red-500' : ''}`}
                min="0"
                step="500"
              />
            </div>
            {errors.service_price && (
              <p className="text-xs text-red-500 mt-1">{errors.service_price}</p>
            )}
          </div>
          <div className="relative">
            <Input
              type="number"
              value={service.duration_minutes}
              onChange={(e) => onChange({ ...service, duration_minutes: Number(e.target.value) })}
              min="5"
              step="5"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">
              min
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function BarberSection({
  barber,
  ownerCuts,
  onOwnerCutsChange,
  onChange,
  businessName,
  errors,
  onClearError,
}: {
  barber: BarberData
  ownerCuts: boolean
  onOwnerCutsChange: (v: boolean) => void
  onChange: (b: BarberData) => void
  businessName: string
  errors: Record<string, string>
  onClearError: (key: string) => void
}) {
  return (
    <div className="space-y-4">
      {/* Owner toggle */}
      <div className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-zinc-700/30 p-3">
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-white">¿Vos cortás pelo?</p>
          <p className="text-xs text-muted mt-0.5">Te agregamos como primer barbero</p>
        </div>
        <IOSToggle
          checked={ownerCuts}
          onChange={() => {
            const newValue = !ownerCuts
            onOwnerCutsChange(newValue)
            if (newValue) {
              onChange({ ...barber, name: businessName })
              onClearError('barber_name')
            } else {
              onChange({ ...barber, name: '' })
            }
          }}
        />
      </div>

      {/* Barber name (only if owner doesn't cut) */}
      {!ownerCuts && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Input
            type="text"
            value={barber.name}
            onChange={(e) => {
              onChange({ ...barber, name: e.target.value })
              onClearError('barber_name')
            }}
            placeholder="Nombre del barbero"
            className={errors.barber_name ? 'border-red-500' : ''}
          />
          {errors.barber_name && <p className="text-xs text-red-500 mt-1">{errors.barber_name}</p>}
        </motion.div>
      )}

      {/* Optional fields */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          type="tel"
          value={barber.phone}
          onChange={(e) => onChange({ ...barber, phone: e.target.value })}
          placeholder="Teléfono (opcional)"
        />
        <Input
          type="email"
          value={barber.email}
          onChange={(e) => onChange({ ...barber, email: e.target.value })}
          placeholder="Email (opcional)"
        />
      </div>

      <p className="text-xs text-muted">
        Podés agregar más barberos después desde la sección Equipo.
      </p>
    </div>
  )
}
