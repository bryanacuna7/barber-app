'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Save,
  Building2,
  Clock,
  Globe,
  ExternalLink,
  Copy,
  Check,
  LogOut,
  Palette,
  Upload,
  X,
  ImageIcon,
  Scissors,
  Settings,
  Gift,
  ArrowRight,
  Search,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { IOSTimePicker, TimePickerTrigger } from '@/components/ui/ios-time-picker'
import { IOSToggle } from '@/components/ui/ios-toggle'
import { FadeInUp, StaggeredList, StaggeredItem } from '@/components/ui/motion'
import { ColorPicker } from '@/components/ui/color-picker'
import { NotificationPreferencesSection } from '@/components/settings/notification-preferences-section'
import { SettingsSearchModal } from '@/components/settings/settings-search-modal'
import { AdvancedSettingsSection } from '@/components/settings/advanced-settings-section'
import { cn } from '@/lib/utils'
import { generateThemeStyle, DEFAULT_BRAND_COLOR } from '@/lib/theme'
import { getContrastingTextColor, getReadableBrandColor } from '@/lib/utils/color'
import type { OperatingHours, DayHours } from '@/types'
// React Query & Context
import { useBusiness } from '@/contexts/business-context'
import { useBusinessSettings, useUpdateBusinessSettings } from '@/hooks/queries/useSettings'
import { ComponentErrorBoundary } from '@/components/error-boundaries/ComponentErrorBoundary'
import { QueryError } from '@/components/ui/query-error'

// Day labels for operating hours
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

export default function ConfiguracionPage() {
  const router = useRouter()
  const { businessId } = useBusiness()
  const toast = useToast()

  // React Query hooks
  const { data: business, isLoading: loading, error, refetch } = useBusinessSettings(businessId)
  const updateSettings = useUpdateBusinessSettings()

  const [copied, setCopied] = useState(false)
  const [brandColor, setBrandColor] = useState(DEFAULT_BRAND_COLOR)
  const [brandSecondary, setBrandSecondary] = useState<string>('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)

  const [timePicker, setTimePicker] = useState<TimePickerState>({
    isOpen: false,
    day: null,
    field: 'open',
  })

  // Search modal state
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [, setActiveTab] = useState('general') // Keep for search navigation compatibility

  // Sheet navigation state
  const [openSheet, setOpenSheet] = useState<
    'general' | 'horario' | 'branding' | 'avanzado' | null
  >(null)

  // Calculate contrast colors for preview
  const contrastColors = useMemo(
    () => ({
      primaryContrast: getContrastingTextColor(brandColor),
      readableOnLight: getReadableBrandColor(brandColor, false),
    }),
    [brandColor]
  )

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    address: '',
    timezone: 'America/Costa_Rica',
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
        name: business.name || '',
        phone: business.phone || '',
        whatsapp: business.whatsapp || '',
        address: business.address || '',
        timezone: business.timezone || 'America/Costa_Rica',
        booking_buffer_minutes: business.bookingConfig?.bufferMinutes || 15,
        advance_booking_days: business.bookingConfig?.advanceBookingDays || 14,
        operating_hours:
          (business.operatingHours as unknown as OperatingHours) || formData.operating_hours,
      })
      setBrandColor(business.branding?.primaryColor || DEFAULT_BRAND_COLOR)
      setBrandSecondary('')
      setLogoUrl(business.branding?.logoUrl || null)
    }
  }, [business])

  // Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchModalOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // React Query mutation handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!businessId) {
      toast.error('No se encontró el ID del negocio')
      return
    }

    try {
      await updateSettings.mutateAsync({
        id: businessId,
        updates: {
          ...formData,
          brand_primary_color: brandColor,
          brand_secondary_color: brandSecondary || null,
        },
      })

      toast.success('Configuración guardada correctamente')
      router.refresh() // Force layout refresh to update ThemeProvider
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Error al guardar la configuración')
    }
  }

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

  function copyBookingLink() {
    if (!business?.slug) return
    const link = `${window.location.origin}/reservar/${business.slug}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast.info('Enlace copiado al portapapeles')
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLogoUploading(true)
    try {
      const formData = new FormData()
      formData.append('logo', file)

      const res = await fetch('/api/business/logo', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setLogoUrl(data.logo_url)
        toast.success('Logo subido correctamente')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Error al subir logo')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLogoUploading(false)
    }
  }

  async function handleLogoDelete() {
    try {
      const res = await fetch('/api/business/logo', { method: 'DELETE' })
      if (res.ok) {
        setLogoUrl(null)
        toast.info('Logo eliminado')
      }
    } catch {
      toast.error('Error al eliminar logo')
    }
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // Navigate from search modal
  function handleSearchNavigate(tabId: string, settingId: string) {
    // Change tab
    setActiveTab(tabId)

    // Wait for tab content to render, then scroll to element
    setTimeout(() => {
      const element = document.getElementById(settingId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Highlight effect
        element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2')
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2')
        }, 2000)
      }
    }, 100)
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <QueryError error={error} onRetry={() => refetch()} title="Error al cargar configuración" />
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

  const bookingUrl = business?.slug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/reservar/${business.slug}`
    : ''

  const currentTimeValue =
    timePicker.day && formData.operating_hours[timePicker.day]
      ? (formData.operating_hours[timePicker.day] as DayHours)[timePicker.field]
      : '09:00'

  return (
    <ComponentErrorBoundary
      fallbackTitle="Error en Configuración"
      fallbackDescription="Ocurrió un error al cargar la página de configuración"
    >
      <div className="min-h-screen pb-24 lg:pb-6">
        {/* Header */}
        <FadeInUp>
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[28px] font-bold tracking-tight text-zinc-900 dark:text-white">
                Configuración
              </h1>
              <p className="text-[15px] text-zinc-500 dark:text-zinc-400 mt-1">
                Administra los datos y preferencias de tu negocio
              </p>
            </div>
            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              aria-label="Buscar configuraciones"
            >
              <Search className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              <span className="hidden sm:inline text-[13px] text-zinc-600 dark:text-zinc-400 font-medium">
                Buscar
              </span>
              <kbd className="hidden lg:inline px-1.5 py-0.5 rounded bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 text-[11px] font-mono text-zinc-500">
                {typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Mac') !== -1
                  ? '⌘'
                  : 'Ctrl'}
                K
              </kbd>
            </motion.button>
          </div>
        </FadeInUp>

        {/* iOS-Style Navigation Cards */}
        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
          {/* Card 1: General */}
          <motion.button
            type="button"
            onClick={() => setOpenSheet('general')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-6 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all shadow-sm hover:shadow-md text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 group-hover:bg-blue-500/20 dark:group-hover:bg-blue-500/30 transition-colors">
                <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[17px] font-semibold text-zinc-900 dark:text-white mb-1">
                  Información General
                </h3>
                <p className="text-[15px] text-zinc-500 dark:text-zinc-400">
                  Nombre, teléfono, dirección y enlace de reservas
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-zinc-400 dark:text-zinc-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" />
            </div>
          </motion.button>

          {/* Card 2: Horario */}
          <motion.button
            type="button"
            onClick={() => setOpenSheet('horario')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-6 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all shadow-sm hover:shadow-md text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 group-hover:bg-purple-500/20 dark:group-hover:bg-purple-500/30 transition-colors">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[17px] font-semibold text-zinc-900 dark:text-white mb-1">
                  Horario de Atención
                </h3>
                <p className="text-[15px] text-zinc-500 dark:text-zinc-400">
                  Días y horas de operación, tiempos de buffer
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-zinc-400 dark:text-zinc-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex-shrink-0 mt-1" />
            </div>
          </motion.button>

          {/* Card 3: Branding */}
          <motion.button
            type="button"
            onClick={() => setOpenSheet('branding')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-6 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 hover:border-pink-300 dark:hover:border-pink-600 transition-all shadow-sm hover:shadow-md text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-pink-500/10 dark:bg-pink-500/20 group-hover:bg-pink-500/20 dark:group-hover:bg-pink-500/30 transition-colors">
                <Palette className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[17px] font-semibold text-zinc-900 dark:text-white mb-1">
                  Marca y Estilo
                </h3>
                <p className="text-[15px] text-zinc-500 dark:text-zinc-400">
                  Colores, logo y personalización visual
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-zinc-400 dark:text-zinc-500 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors flex-shrink-0 mt-1" />
            </div>
          </motion.button>

          {/* Card 4: Avanzado */}
          <motion.button
            type="button"
            onClick={() => setOpenSheet('avanzado')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-6 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 hover:border-amber-300 dark:hover:border-amber-600 transition-all shadow-sm hover:shadow-md text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 group-hover:bg-amber-500/20 dark:group-hover:bg-amber-500/30 transition-colors">
                <Settings className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[17px] font-semibold text-zinc-900 dark:text-white mb-1">
                  Configuración Avanzada
                </h3>
                <p className="text-[15px] text-zinc-500 dark:text-zinc-400">
                  Notificaciones, lealtad y opciones avanzadas
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-zinc-400 dark:text-zinc-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex-shrink-0 mt-1" />
            </div>
          </motion.button>
        </div>

        {/* Sheets with content */}
        <form onSubmit={handleSubmit}>
          {/* General Sheet */}
          <AnimatePresence>
            {openSheet === 'general' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={() => setOpenSheet(null)}
              >
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute inset-x-0 lg:inset-x-auto lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-2xl bottom-0 top-16 bg-white dark:bg-zinc-900 rounded-t-3xl shadow-2xl overflow-hidden"
                >
                  {/* Sheet Header */}
                  <div className="sticky top-0 z-10 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20">
                          <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-[20px] font-bold text-zinc-900 dark:text-white">
                          Información General
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOpenSheet(null)}
                        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <X className="h-5 w-5 text-zinc-500" />
                      </button>
                    </div>
                  </div>

                  {/* Sheet Content */}
                  <div className="overflow-y-auto max-h-[85vh] px-6 py-6">
                    <div className="space-y-6">
                      {/* Public Booking Link */}
                      <FadeInUp delay={0.05}>
                        <Card
                          id="booking-link"
                          className="border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50/50 dark:border-violet-900 dark:from-violet-950/30 dark:to-purple-950/20 overflow-hidden transition-all"
                        >
                          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-[17px] text-violet-900 dark:text-violet-300">
                              <Globe className="h-5 w-5" />
                              Tu Página de Reservas
                            </CardTitle>
                            <CardDescription className="text-violet-700/80 dark:text-violet-400/80">
                              Comparte este enlace con tus clientes
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
                              <div className="flex-1 min-w-0 rounded-xl border border-violet-200 bg-white/80 px-4 py-3.5 text-[15px] font-medium text-violet-900 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300 truncate">
                                {bookingUrl || 'Cargando...'}
                              </div>
                              <div className="flex gap-2">
                                <motion.button
                                  type="button"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={copyBookingLink}
                                  className="flex h-12 min-w-[48px] flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl border-2 border-violet-200 bg-white px-4 text-violet-700 transition-colors hover:bg-violet-50 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300"
                                >
                                  {copied ? (
                                    <Check className="h-5 w-5" />
                                  ) : (
                                    <Copy className="h-5 w-5" />
                                  )}
                                  <span className="text-[15px] font-medium sm:hidden">Copiar</span>
                                </motion.button>
                                <motion.a
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  href={bookingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex h-12 min-w-[48px] flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl border-2 border-violet-200 bg-white px-4 text-violet-700 transition-colors hover:bg-violet-50 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300"
                                >
                                  <ExternalLink className="h-5 w-5" />
                                  <span className="text-[15px] font-medium sm:hidden">Abrir</span>
                                </motion.a>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </FadeInUp>

                      {/* Business Info */}
                      <FadeInUp delay={0.1}>
                        <Card id="business-name" className="transition-all">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-[17px]">
                              <Building2 className="h-5 w-5" />
                              Información del Negocio
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-5">
                            <Input
                              label="Nombre del negocio"
                              type="text"
                              placeholder="Barbería El Patrón"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData((prev) => ({ ...prev, name: e.target.value }))
                              }
                              required
                            />

                            <div className="grid gap-4 sm:grid-cols-2">
                              <Input
                                label="Teléfono"
                                type="tel"
                                placeholder="2222-3333"
                                value={formData.phone}
                                onChange={(e) =>
                                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                                }
                              />

                              <Input
                                label="WhatsApp"
                                type="tel"
                                placeholder="87175866"
                                value={formData.whatsapp}
                                onChange={(e) =>
                                  setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))
                                }
                              />
                            </div>

                            <Input
                              label="Dirección"
                              type="text"
                              placeholder="San José, Costa Rica"
                              value={formData.address}
                              onChange={(e) =>
                                setFormData((prev) => ({ ...prev, address: e.target.value }))
                              }
                            />
                          </CardContent>
                        </Card>
                      </FadeInUp>
                    </div>

                    {/* Sheet Footer with Save Button */}
                    <div className="sticky bottom-0 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg">
                      <Button
                        type="submit"
                        isLoading={updateSettings.isPending}
                        className="w-full h-12 text-[15px] font-semibold"
                        onClick={() => setOpenSheet(null)}
                      >
                        <Save className="h-5 w-5 mr-2" />
                        Guardar Cambios
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Horario Sheet */}
          <AnimatePresence>
            {openSheet === 'horario' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={() => setOpenSheet(null)}
              >
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute inset-x-0 lg:inset-x-auto lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-2xl bottom-0 top-16 bg-white dark:bg-zinc-900 rounded-t-3xl shadow-2xl overflow-hidden"
                >
                  {/* Sheet Header */}
                  <div className="sticky top-0 z-10 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20">
                          <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h2 className="text-[20px] font-bold text-zinc-900 dark:text-white">
                          Horario de Atención
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOpenSheet(null)}
                        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <X className="h-5 w-5 text-zinc-500" />
                      </button>
                    </div>
                  </div>

                  {/* Sheet Content */}
                  <div className="overflow-y-auto max-h-[85vh] px-6 py-6">
                    <div className="space-y-6">
                      {/* Operating Hours */}
                      <FadeInUp delay={0.1}>
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-[17px]">
                              <Clock className="h-5 w-5" />
                              Horario de Atencion
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
                                      <IOSToggle
                                        checked={isOpen}
                                        onChange={() => toggleDay(key)}
                                        size="sm"
                                      />
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
                                        <span className="text-[15px] text-zinc-400 ml-auto">
                                          Cerrado
                                        </span>
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
                                <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
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
                                <p className="mt-2 text-[12px] text-zinc-500 dark:text-zinc-400">
                                  Tiempo adicional entre citas para preparación o limpieza
                                </p>
                              </div>
                              <div id="advance-booking">
                                <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
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
                                <p className="mt-2 text-[12px] text-zinc-500 dark:text-zinc-400">
                                  Con cuánta anticipación los clientes pueden reservar
                                </p>
                              </div>
                            </div>
                          </div>
                        </AdvancedSettingsSection>
                      </FadeInUp>
                    </div>

                    {/* Sheet Footer with Save Button */}
                    <div className="sticky bottom-0 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg">
                      <Button
                        type="submit"
                        isLoading={updateSettings.isPending}
                        className="w-full h-12 text-[15px] font-semibold"
                        onClick={() => setOpenSheet(null)}
                      >
                        <Save className="h-5 w-5 mr-2" />
                        Guardar Cambios
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Branding Sheet */}
          <AnimatePresence>
            {openSheet === 'branding' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={() => setOpenSheet(null)}
              >
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute inset-x-0 lg:inset-x-auto lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-2xl bottom-0 top-16 bg-white dark:bg-zinc-900 rounded-t-3xl shadow-2xl overflow-hidden"
                >
                  {/* Sheet Header */}
                  <div className="sticky top-0 z-10 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-pink-500/10 dark:bg-pink-500/20">
                          <Palette className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                        </div>
                        <h2 className="text-[20px] font-bold text-zinc-900 dark:text-white">
                          Marca y Estilo
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOpenSheet(null)}
                        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <X className="h-5 w-5 text-zinc-500" />
                      </button>
                    </div>
                  </div>

                  {/* Sheet Content */}
                  <div className="overflow-y-auto max-h-[85vh] px-6 py-6">
                    <div className="space-y-6">
                      {/* Brand Customization */}
                      <FadeInUp delay={0.1}>
                        <Card className="overflow-hidden">
                          <div
                            className="absolute inset-x-0 top-0 h-1"
                            style={{
                              background: `linear-gradient(90deg, ${brandColor}, ${brandSecondary || brandColor})`,
                            }}
                          />
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-[17px]">
                              <Palette className="h-5 w-5" />
                              Personaliza tu Marca
                            </CardTitle>
                            <CardDescription>Colores y logo que veran tus clientes</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {/* Color Picker */}
                            <ColorPicker
                              label="Color principal"
                              value={brandColor}
                              onChange={setBrandColor}
                            />

                            {/* Live Preview - Dual Mode */}
                            <div>
                              <label className="mb-3 block text-[13px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                Vista previa
                              </label>
                              <div className="space-y-3">
                                {/* Light Mode Preview */}
                                <div>
                                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                                    Modo claro
                                  </div>
                                  <div
                                    className="rounded-2xl border-2 border-zinc-300 bg-white p-4"
                                    style={generateThemeStyle(brandColor, brandSecondary || null)}
                                  >
                                    <div className="flex items-center gap-3 mb-3">
                                      {logoUrl ? (
                                        <img
                                          src={logoUrl}
                                          alt="Logo"
                                          className="h-10 w-10 rounded-xl object-cover"
                                        />
                                      ) : (
                                        <div
                                          className="flex h-10 w-10 items-center justify-center rounded-xl"
                                          style={{ backgroundColor: brandColor }}
                                        >
                                          <Scissors
                                            className="h-5 w-5"
                                            style={{ color: contrastColors.primaryContrast }}
                                          />
                                        </div>
                                      )}
                                      <span className="font-semibold text-zinc-900">
                                        {formData.name || 'Tu Barberia'}
                                      </span>
                                    </div>
                                    <div className="flex gap-2">
                                      <span
                                        className="inline-flex items-center rounded-full px-3 py-1.5 text-[13px] font-semibold shadow-lg"
                                        style={{
                                          backgroundColor: brandColor,
                                          color: contrastColors.primaryContrast,
                                        }}
                                      >
                                        Reservar ahora
                                      </span>
                                      <span
                                        className="inline-flex items-center rounded-full border-2 px-3 py-1.5 text-[13px] font-semibold text-zinc-900"
                                        style={{ borderColor: brandColor }}
                                      >
                                        Ver servicios
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Dark Mode Preview */}
                                <div>
                                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                                    Modo oscuro
                                  </div>
                                  <div
                                    className="rounded-2xl border-2 border-zinc-700 bg-zinc-950 p-4"
                                    style={generateThemeStyle(brandColor, brandSecondary || null)}
                                  >
                                    <div className="flex items-center gap-3 mb-3">
                                      {logoUrl ? (
                                        <img
                                          src={logoUrl}
                                          alt="Logo"
                                          className="h-10 w-10 rounded-xl object-cover"
                                        />
                                      ) : (
                                        <div
                                          className="flex h-10 w-10 items-center justify-center rounded-xl"
                                          style={{ backgroundColor: brandColor }}
                                        >
                                          <Scissors
                                            className="h-5 w-5"
                                            style={{ color: contrastColors.primaryContrast }}
                                          />
                                        </div>
                                      )}
                                      <span className="font-semibold text-white">
                                        {formData.name || 'Tu Barberia'}
                                      </span>
                                    </div>
                                    <div className="flex gap-2">
                                      <span
                                        className="inline-flex items-center rounded-full px-3 py-1.5 text-[13px] font-semibold shadow-lg"
                                        style={{
                                          backgroundColor: brandColor,
                                          color: contrastColors.primaryContrast,
                                        }}
                                      >
                                        Reservar ahora
                                      </span>
                                      <span
                                        className="inline-flex items-center rounded-full border-2 px-3 py-1.5 text-[13px] font-semibold text-white"
                                        style={{ borderColor: brandColor }}
                                      >
                                        Ver servicios
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Logo Upload */}
                            <div>
                              <label className="mb-3 block text-[13px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                Logo del negocio
                              </label>
                              {logoUrl ? (
                                <div className="flex items-center gap-4">
                                  <img
                                    src={logoUrl}
                                    alt="Logo"
                                    className="h-20 w-20 rounded-2xl object-cover border-2 border-zinc-200 dark:border-zinc-700"
                                  />
                                  <div className="flex flex-col gap-2">
                                    <label className="cursor-pointer rounded-xl bg-zinc-100 px-4 py-2.5 text-[13px] font-semibold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors text-center">
                                      <Upload className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                                      Cambiar
                                      <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                      />
                                    </label>
                                    <button
                                      type="button"
                                      onClick={handleLogoDelete}
                                      className="rounded-xl bg-red-50 px-4 py-2.5 text-[13px] font-semibold text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"
                                    >
                                      <X className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                                      Eliminar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <label
                                  className={cn(
                                    'flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-6 py-8 transition-colors hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-zinc-600 dark:hover:bg-zinc-800',
                                    logoUploading && 'opacity-60 pointer-events-none'
                                  )}
                                >
                                  {logoUploading ? (
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                      className="h-8 w-8 rounded-full border-[3px] border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white"
                                    />
                                  ) : (
                                    <ImageIcon className="h-8 w-8 text-zinc-400" />
                                  )}
                                  <div className="text-center">
                                    <p className="text-[15px] font-medium text-zinc-700 dark:text-zinc-300">
                                      {logoUploading ? 'Subiendo...' : 'Sube tu logo'}
                                    </p>
                                    <p className="mt-1 text-[13px] text-zinc-400">
                                      PNG, JPG, WebP o SVG - Maximo 2MB
                                    </p>
                                  </div>
                                  <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                    disabled={logoUploading}
                                  />
                                </label>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </FadeInUp>
                    </div>

                    {/* Sheet Footer with Save Button */}
                    <div className="sticky bottom-0 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg">
                      <Button
                        type="submit"
                        isLoading={updateSettings.isPending}
                        className="w-full h-12 text-[15px] font-semibold"
                        onClick={() => setOpenSheet(null)}
                      >
                        <Save className="h-5 w-5 mr-2" />
                        Guardar Cambios
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Avanzado Sheet */}
          <AnimatePresence>
            {openSheet === 'avanzado' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={() => setOpenSheet(null)}
              >
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute inset-x-0 lg:inset-x-auto lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-2xl bottom-0 top-16 bg-white dark:bg-zinc-900 rounded-t-3xl shadow-2xl overflow-hidden"
                >
                  {/* Sheet Header */}
                  <div className="sticky top-0 z-10 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20">
                          <Settings className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h2 className="text-[20px] font-bold text-zinc-900 dark:text-white">
                          Configuración Avanzada
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOpenSheet(null)}
                        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <X className="h-5 w-5 text-zinc-500" />
                      </button>
                    </div>
                  </div>

                  {/* Sheet Content */}
                  <div className="overflow-y-auto max-h-[85vh] px-6 py-6">
                    <div className="space-y-6">
                      {/* Notification Preferences */}
                      <NotificationPreferencesSection />

                      {/* Loyalty Program */}
                      <FadeInUp delay={0.1}>
                        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/50 dark:border-amber-900 dark:from-amber-950/30 dark:to-orange-950/20 overflow-hidden">
                          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-[17px] text-amber-900 dark:text-amber-300">
                              <Gift className="h-5 w-5" />
                              Programa de Lealtad
                            </CardTitle>
                            <CardDescription className="text-amber-700/80 dark:text-amber-400/80">
                              Configura recompensas para tus clientes más fieles
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => router.push('/lealtad/configuracion')}
                              className="flex w-full items-center justify-between rounded-xl border-2 border-amber-200 bg-white/80 px-4 py-3.5 text-[15px] font-medium text-amber-900 transition-colors hover:bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300 dark:hover:bg-amber-950/70"
                            >
                              <span>Configurar programa de lealtad</span>
                              <ArrowRight className="h-5 w-5" />
                            </motion.button>
                          </CardContent>
                        </Card>
                      </FadeInUp>

                      {/* Session */}
                      <FadeInUp delay={0.15}>
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-[17px]">
                              <LogOut className="h-5 w-5" />
                              Sesion
                            </CardTitle>
                            <CardDescription>Cierra sesion en este dispositivo</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full"
                              onClick={handleLogout}
                            >
                              Cerrar sesion
                            </Button>
                          </CardContent>
                        </Card>
                      </FadeInUp>
                    </div>

                    {/* Sheet Footer with Save Button */}
                    <div className="sticky bottom-0 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg">
                      <Button
                        type="submit"
                        isLoading={updateSettings.isPending}
                        className="w-full h-12 text-[15px] font-semibold"
                        onClick={() => setOpenSheet(null)}
                      >
                        <Save className="h-5 w-5 mr-2" />
                        Guardar Cambios
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* iOS Time Picker Sheet */}
        <IOSTimePicker
          isOpen={timePicker.isOpen}
          onClose={() => setTimePicker((prev) => ({ ...prev, isOpen: false }))}
          value={currentTimeValue}
          onChange={handleTimeChange}
          title={timePicker.field === 'open' ? 'Hora de apertura' : 'Hora de cierre'}
        />

        {/* Settings Search Modal */}
        <SettingsSearchModal
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          onNavigate={handleSearchNavigate}
        />
      </div>
    </ComponentErrorBoundary>
  )
}
