'use client'

import { Bell, BellOff } from 'lucide-react'
import { IOSToggle } from '@/components/ui/ios-toggle'
import { usePushSubscription } from '@/hooks/use-push-subscription'
import { useToast } from '@/components/ui/toast'

/**
 * Push notification toggle for Configuración page.
 * Handles: unsupported browser, permission denied, subscribe/unsubscribe flow.
 */
export function PushNotificationToggle() {
  const { isSupported, permission, isSubscribed, subscribe, unsubscribe, loading } =
    usePushSubscription()
  const toast = useToast()

  const handleToggle = async () => {
    if (loading) return

    if (isSubscribed) {
      const ok = await unsubscribe()
      if (ok) toast.success('Notificaciones push desactivadas')
    } else {
      const ok = await subscribe()
      if (ok) {
        toast.success('Notificaciones push activadas')
      } else if (permission === 'denied') {
        toast.error('Permisos bloqueados — actívalos en ajustes del navegador')
      } else {
        toast.error('No se pudo activar las notificaciones')
      }
    }
  }

  // Not supported
  if (!isSupported) {
    return (
      <div className="flex items-center justify-between py-3.5 px-1">
        <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <BellOff className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
          </div>
          <div>
            <p className="text-[16px] font-medium text-zinc-400 dark:text-zinc-500">
              Notificaciones Push
            </p>
            <p className="text-[13px] text-zinc-400 dark:text-zinc-600">
              No disponible en este navegador
            </p>
          </div>
        </div>
        <IOSToggle checked={false} onChange={() => {}} disabled />
      </div>
    )
  }

  // Permission denied
  if (permission === 'denied') {
    return (
      <div className="flex items-center justify-between py-3.5 px-1">
        <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 dark:bg-red-950/30">
            <BellOff className="h-5 w-5 text-red-500 dark:text-red-400" />
          </div>
          <div>
            <p className="text-[16px] font-medium text-zinc-900 dark:text-white">
              Notificaciones Push
            </p>
            <p className="text-[13px] text-red-500 dark:text-red-400">
              Bloqueado — activa en ajustes del navegador
            </p>
          </div>
        </div>
        <IOSToggle checked={false} onChange={() => {}} disabled />
      </div>
    )
  }

  // Normal state (default or granted)
  return (
    <div className="flex items-center justify-between py-3.5 px-1">
      <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/30">
          <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-[16px] font-medium text-zinc-900 dark:text-white">
            Notificaciones Push
          </p>
          <p className="text-[13px] text-muted">
            {isSubscribed ? 'Recibes alertas instantáneas' : 'Recibe alertas de citas al instante'}
          </p>
        </div>
      </div>
      <IOSToggle checked={isSubscribed} onChange={handleToggle} disabled={loading} />
    </div>
  )
}
