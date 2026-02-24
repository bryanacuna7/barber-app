'use client'

import { useEffect, useState } from 'react'
import { BellRing, Loader2 } from 'lucide-react'
import { IOSToggle } from '@/components/ui/ios-toggle'
import { useToast } from '@/components/ui/toast'

export function SmartNotificationsToggle() {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    async function fetchFlag() {
      try {
        const res = await fetch('/api/settings/smart-notifications', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        setEnabled(data.smart_notifications_enabled === true)
      } finally {
        setLoading(false)
      }
    }

    fetchFlag()
  }, [])

  const handleToggle = async () => {
    if (loading) return

    const nextValue = !enabled
    setLoading(true)

    try {
      const res = await fetch('/api/settings/smart-notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smart_notifications_enabled: nextValue }),
      })

      if (!res.ok) throw new Error('failed')

      const data = await res.json()
      setEnabled(data.smart_notifications_enabled === true)
      toast.success(
        data.smart_notifications_enabled
          ? 'Notificaciones inteligentes activadas'
          : 'Notificaciones inteligentes desactivadas'
      )
    } catch {
      toast.error('No se pudo actualizar la configuración')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between py-3.5 px-1">
      <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
          {loading ? (
            <Loader2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 animate-spin" />
          ) : (
            <BellRing className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          )}
        </div>
        <div>
          <p className="text-[16px] font-medium text-zinc-900 dark:text-white">
            Notificaciones Inteligentes
          </p>
          <p className="text-[13px] text-muted">
            Envia ofertas automáticas por hábitos de reserva y promociones activas
          </p>
        </div>
      </div>
      <IOSToggle checked={enabled} onChange={handleToggle} disabled={loading} />
    </div>
  )
}
