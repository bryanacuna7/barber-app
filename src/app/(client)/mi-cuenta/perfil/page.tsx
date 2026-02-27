'use client'

/**
 * Client Profile Page — /mi-cuenta/perfil
 *
 * Sections: Edit name/email, phone (readonly), loyalty info,
 * business switcher (multi-business), logout.
 */

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  Mail,
  Phone,
  Trophy,
  LogOut,
  Check,
  Building2,
  Bell,
  ChevronLeft,
  Shield,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useClientContext } from '@/contexts/client-context'
import { useClientLoyalty, useUpdateClientProfile } from '@/hooks/queries/useClientDashboard'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { ClientNotificationBell } from '@/components/client/client-notification-bell'
import { IOSToggle } from '@/components/ui/ios-toggle'

const TIER_CONFIG: Record<string, { label: string; color: string }> = {
  bronze: { label: 'Bronce', color: 'text-amber-700 dark:text-amber-500' },
  silver: { label: 'Plata', color: 'text-zinc-500 dark:text-zinc-400' },
  gold: { label: 'Oro', color: 'text-yellow-500 dark:text-yellow-400' },
  platinum: { label: 'Platino', color: 'text-purple-500 dark:text-purple-400' },
}

export default function ClientProfilePage() {
  const router = useRouter()
  const {
    clientId,
    clientName,
    clientEmail,
    clientPhone,
    businessId,
    businesses,
    isMultiBusiness,
    switchBusiness,
  } = useClientContext()

  const { data: loyalty } = useClientLoyalty(clientId, businessId)
  const updateProfile = useUpdateClientProfile()

  const [name, setName] = useState(clientName)
  const [email, setEmail] = useState(clientEmail ?? '')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [smartPromosEnabled, setSmartPromosEnabled] = useState(true)
  const [prefLoading, setPrefLoading] = useState(true)

  const hasChanges = name !== clientName || email !== (clientEmail ?? '')

  useEffect(() => {
    async function loadClientPrefs() {
      if (!businessId) return
      try {
        const res = await fetch(`/api/client/notification-preferences?business_id=${businessId}`, {
          cache: 'no-store',
        })
        if (!res.ok) return
        const data = await res.json()
        setSmartPromosEnabled(data.smart_promos_enabled !== false)
      } finally {
        setPrefLoading(false)
      }
    }

    loadClientPrefs()
  }, [businessId])

  const handleSave = useCallback(async () => {
    if (!hasChanges) return
    setError(null)

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('El nombre no puede estar vacío')
      return
    }

    const trimmedEmail = email.trim()
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Formato de correo inválido')
      return
    }

    try {
      await updateProfile.mutateAsync({
        clientId,
        name: trimmedName,
        email: trimmedEmail || null,
      })
      setSaved(true)
      // Refresh server layout to update context props (clientName/clientEmail)
      router.refresh()
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError('Error al guardar. Intenta de nuevo.')
    }
  }, [clientId, name, email, hasChanges, updateProfile, router])

  const handleLogout = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    // Hard redirect to avoid middleware race condition
    window.location.href = '/login'
  }, [])

  const handleSmartPromoToggle = useCallback(async () => {
    if (prefLoading) return
    const nextValue = !smartPromosEnabled
    setPrefLoading(true)

    try {
      const res = await fetch('/api/client/notification-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          smart_promos_enabled: nextValue,
          smart_promos_paused_until: null,
        }),
      })

      if (!res.ok) throw new Error('Failed to update smart promo preference')
      const data = await res.json()
      setSmartPromosEnabled(data.smart_promos_enabled !== false)
    } catch {
      // keep previous state on error
    } finally {
      setPrefLoading(false)
    }
  }, [businessId, prefLoading, smartPromosEnabled])

  return (
    <div className="px-4 pt-safe-offset-4 pt-12">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push('/mi-cuenta')}
            className="flex items-center justify-center -ml-2 h-10 w-10 rounded-xl text-zinc-500 dark:text-zinc-400 ios-press"
            aria-label="Volver al inicio"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Mi Perfil</h1>
        </div>
        <ClientNotificationBell businessId={businessId} />
      </div>

      {/* Profile Form */}
      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 mb-6">
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              <User className="h-4 w-4" />
              Nombre
            </label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              <Mail className="h-4 w-4" />
              Correo electrónico
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              <Phone className="h-4 w-4" />
              Teléfono
            </label>
            <Input value={clientPhone ?? ''} disabled className="opacity-60" />
            <p className="text-xs text-subtle mt-1">El teléfono es administrado por el negocio</p>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

        {hasChanges && (
          <div className="mt-5 flex justify-end">
            <Button onClick={handleSave} isLoading={updateProfile.isPending} className="h-11">
              {saved ? (
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4" />
                  Guardado
                </span>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </div>
        )}
      </section>

      {/* Loyalty Info */}
      {loyalty && (
        <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 mb-6">
          <h2 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Programa de Lealtad
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted mb-1">Nivel</p>
              <p className={cn('font-semibold', TIER_CONFIG[loyalty.current_tier]?.color)}>
                {TIER_CONFIG[loyalty.current_tier]?.label ?? loyalty.current_tier}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Puntos</p>
              <p className="font-semibold text-zinc-900 dark:text-white">
                {loyalty.points_balance.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Visitas</p>
              <p className="font-semibold text-zinc-900 dark:text-white">{loyalty.visit_count}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Puntos Totales</p>
              <p className="font-semibold text-zinc-900 dark:text-white">
                {loyalty.lifetime_points.toLocaleString()}
              </p>
            </div>
          </div>

          {loyalty.referral_code && (
            <div className="mt-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
              <p className="text-xs text-muted mb-1">Tu código de referido</p>
              <p className="font-mono font-semibold text-zinc-900 dark:text-white tracking-wider">
                {loyalty.referral_code}
              </p>
            </div>
          )}
        </section>
      )}

      {/* Smart promo preference */}
      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 mb-6">
        <h2 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificaciones
        </h2>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-white">
              Recibir promociones inteligentes
            </p>
            <p className="text-xs text-muted mt-1">
              Ofertas automáticas según tu horario habitual en esta barbería
            </p>
          </div>
          <IOSToggle
            checked={smartPromosEnabled}
            onChange={handleSmartPromoToggle}
            disabled={prefLoading}
          />
        </div>
      </section>

      {/* Seguridad */}
      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 mb-6">
        <h2 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Seguridad
        </h2>
        <Button
          variant="outline"
          className="w-full h-11 justify-between"
          onClick={() => router.push('/mi-cuenta/perfil/cambiar-contrasena')}
        >
          <span>Cambiar contraseña</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </section>

      {/* Business Switcher */}
      {isMultiBusiness && (
        <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 mb-6">
          <h2 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Mis Negocios
          </h2>

          <div className="space-y-2">
            {businesses.map((biz) => (
              <button
                key={biz.id}
                onClick={() => switchBusiness(biz.id)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors',
                  biz.id === businessId
                    ? 'bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-300 dark:ring-zinc-700'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                )}
              >
                <div
                  className="h-8 w-8 rounded-lg shrink-0"
                  style={{ backgroundColor: biz.brandColor ?? '#27272a' }}
                />
                <span className="font-medium text-zinc-900 dark:text-white">{biz.name}</span>
                {biz.id === businessId && (
                  <Check className="h-4 w-4 ml-auto text-green-600 dark:text-green-400" />
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Logout */}
      <section className="mb-12">
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full h-11 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </section>
    </div>
  )
}
