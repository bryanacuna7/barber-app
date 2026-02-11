'use client'

import { useState, useEffect } from 'react'
import { Clock, Loader2 } from 'lucide-react'
import { IOSToggle } from '@/components/ui/ios-toggle'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'

/**
 * Smart Duration toggle for Configuración Avanzada.
 * Toggles businesses.smart_duration_enabled flag.
 */
export function SmartDurationToggle() {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    async function fetchFlag() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('businesses')
          .select('smart_duration_enabled')
          .eq('owner_id', user.id)
          .single()

        if (data) {
          setEnabled((data as any).smart_duration_enabled === true)
        }
      } catch {
        // Silent fail — toggle stays off
      } finally {
        setLoading(false)
      }
    }
    fetchFlag()
  }, [])

  const handleToggle = async () => {
    if (loading) return
    setLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const newValue = !enabled
      const { error } = await supabase
        .from('businesses')
        .update({ smart_duration_enabled: newValue } as any)
        .eq('owner_id', user.id)

      if (error) throw error

      setEnabled(newValue)
      toast.success(newValue ? 'Duración inteligente activada' : 'Duración inteligente desactivada')
    } catch {
      toast.error('No se pudo actualizar la configuración')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between py-3.5 px-1">
      <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-950/30">
          {loading ? (
            <Loader2 className="h-5 w-5 text-violet-600 dark:text-violet-400 animate-spin" />
          ) : (
            <Clock className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          )}
        </div>
        <div>
          <p className="text-[16px] font-medium text-zinc-900 dark:text-white">
            Duración Inteligente
          </p>
          <p className="text-[13px] text-muted">
            {enabled
              ? 'Usa datos reales para predecir duración'
              : 'Predice duración de citas con historial'}
          </p>
        </div>
      </div>
      <IOSToggle checked={enabled} onChange={handleToggle} disabled={loading} />
    </div>
  )
}
