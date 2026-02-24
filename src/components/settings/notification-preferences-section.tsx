'use client'

/**
 * Notification Preferences Section
 * Allows users to configure email/app notification preferences
 */

import { useState, useEffect } from 'react'
import { Bell, Mail, Smartphone, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IOSToggle } from '@/components/ui/ios-toggle'
import { useToast } from '@/components/ui/toast'
import { FadeInUp } from '@/components/ui/motion'
import { getStaleCache, setCache, CACHE_TTL } from '@/lib/cache'
import type { NotificationPreferences, NotificationChannel } from '@/types/database'

const CACHE_KEY = 'notif_prefs'

export function NotificationPreferencesSection() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  // Load preferences with stale-while-revalidate
  useEffect(() => {
    const cached = getStaleCache<NotificationPreferences>(CACHE_KEY)
    if (cached) {
      setPreferences(cached.data)
      setLoading(false)
      if (!cached.isStale) return
    }
    loadPreferences()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadPreferences() {
    try {
      const response = await fetch('/api/notifications/preferences')
      if (!response.ok) throw new Error('Failed to load preferences')
      const data = await response.json()
      setPreferences(data)
      setCache(CACHE_KEY, data, CACHE_TTL.LONG)
    } catch (error) {
      console.error('Error loading notification preferences:', error)
      toast.error('Error al cargar preferencias de notificaciones')
    } finally {
      setLoading(false)
    }
  }

  async function savePreferences(updates: Partial<NotificationPreferences>) {
    setSaving(true)
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error('Failed to save preferences')

      const updated = await response.json()
      setPreferences(updated)
      setCache(CACHE_KEY, updated, CACHE_TTL.LONG)
      toast.success('Preferencias guardadas')
    } catch (error) {
      console.error('Error saving notification preferences:', error)
      toast.error('Error al guardar preferencias')
    } finally {
      setSaving(false)
    }
  }

  function handleChannelChange(channel: NotificationChannel) {
    // Only allow valid preference channels
    const validChannel =
      channel === 'app' || channel === 'email' || channel === 'both' ? channel : 'app'
    savePreferences({ channel: validChannel })
  }

  function handleEmailAddressChange() {
    const emailInput = document.getElementById('override-email') as HTMLInputElement
    const email = emailInput?.value || null
    savePreferences({ email_address: email })
  }

  function handleToggle(field: keyof NotificationPreferences, value: boolean) {
    savePreferences({ [field]: value })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" />
            <CardTitle>Notificaciones</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted">Cargando...</p>
        </CardContent>
      </Card>
    )
  }

  if (!preferences) {
    return null
  }

  return (
    <FadeInUp delay={0.4}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" />
            <CardTitle>Notificaciones</CardTitle>
          </div>
          <CardDescription>Configura cómo quieres recibir notificaciones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Channel Selection */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              Canal de notificaciones
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <ChannelCard
                icon={<Smartphone className="w-5 h-5" />}
                label="Solo App"
                description="Notificaciones dentro de la app"
                active={preferences.channel === 'app'}
                onClick={() => handleChannelChange('app')}
              />
              <ChannelCard
                icon={<Mail className="w-5 h-5" />}
                label="Solo Correo"
                description="Recibir por correo electrónico"
                active={preferences.channel === 'email'}
                onClick={() => handleChannelChange('email')}
              />
              <ChannelCard
                icon={
                  <>
                    <Smartphone className="w-4 h-4" />
                    <Mail className="w-4 h-4" />
                  </>
                }
                label="Ambos"
                description="App y email"
                active={preferences.channel === 'both'}
                onClick={() => handleChannelChange('both')}
              />
            </div>
          </div>

          {/* Email Override */}
          {(preferences.channel === 'email' || preferences.channel === 'both') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Correo alternativo (opcional)
              </label>
              <div className="flex gap-2">
                <Input
                  id="override-email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  defaultValue={preferences.email_address || ''}
                />
                <Button onClick={handleEmailAddressChange} disabled={saving}>
                  Guardar
                </Button>
              </div>
              <p className="text-xs text-muted mt-1">Dejar vacío para usar el email de tu cuenta</p>
            </motion.div>
          )}

          {/* Notification Types */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              Tipos de notificaciones
            </label>
            <div className="space-y-3">
              <NotificationToggle
                label="Trial por vencer"
                description="Avisos cuando tu período de prueba esté cerca de expirar"
                checked={preferences.email_trial_expiring}
                onChange={(checked) => handleToggle('email_trial_expiring', checked)}
                disabled={preferences.channel === 'app' || saving}
              />
              <NotificationToggle
                label="Suscripción por vencer"
                description="Recordatorios de renovación de suscripción"
                checked={preferences.email_subscription_expiring}
                onChange={(checked) => handleToggle('email_subscription_expiring', checked)}
                disabled={preferences.channel === 'app' || saving}
              />
              <NotificationToggle
                label="Estado de pagos"
                description="Cuando un pago es aprobado o rechazado"
                checked={preferences.email_payment_status}
                onChange={(checked) => handleToggle('email_payment_status', checked)}
                disabled={preferences.channel === 'app' || saving}
              />
              <NotificationToggle
                label="Nuevas citas"
                description="Aviso cada vez que se agenda una nueva cita"
                checked={preferences.email_new_appointment}
                onChange={(checked) => handleToggle('email_new_appointment', checked)}
                disabled={preferences.channel === 'app' || saving}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </FadeInUp>
  )
}

// Channel Card Component
function ChannelCard({
  icon,
  label,
  description,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  description: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative p-4 rounded-lg border-2 transition-all text-left
        ${
          active
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
        }
      `}
    >
      {active && (
        <div className="absolute top-2 right-2">
          <Check className="w-5 h-5 text-blue-500" />
        </div>
      )}
      <div className="flex items-center gap-2 mb-2 text-zinc-900 dark:text-zinc-100">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <p className="text-xs text-muted">{description}</p>
    </button>
  )
}

// Notification Toggle Component
function NotificationToggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <div
      className={`
        flex items-start justify-between p-4 rounded-lg
        ${disabled ? 'opacity-50' : 'bg-zinc-50 dark:bg-zinc-900'}
      `}
    >
      <div className="flex-1">
        <p className="font-medium text-zinc-900 dark:text-zinc-100">{label}</p>
        <p className="text-sm text-muted mt-1">{description}</p>
      </div>
      <IOSToggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  )
}
