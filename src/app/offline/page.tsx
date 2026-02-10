'use client'

import { useState, useEffect } from 'react'
import { WifiOff, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { getStaleCache } from '@/lib/cache'

export default function OfflinePage() {
  const [reconnecting, setReconnecting] = useState(false)
  // Lazy initializer: offline page is only rendered when offline, hydration mismatch is acceptable
  const [lastOnline] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    const cached = getStaleCache<string>('last_online_at')
    return cached?.data ?? null
  })

  useEffect(() => {
    // Auto-reload when connection returns
    const handleOnline = () => {
      setReconnecting(true)
      // Small delay so user sees "Reconectando..." before reload
      setTimeout(() => window.location.reload(), 800)
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [])

  const formatLastOnline = (iso: string) => {
    try {
      const date = new Date(iso)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMin = Math.floor(diffMs / 60000)

      if (diffMin < 1) return 'hace un momento'
      if (diffMin < 60) return `hace ${diffMin} min`
      const diffHours = Math.floor(diffMin / 60)
      if (diffHours < 24) return `hace ${diffHours}h`
      return date.toLocaleDateString('es-CR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return null
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="text-center max-w-sm">
        {/* Floating icon */}
        <motion.div
          className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 shadow-lg"
          animate={reconnecting ? { scale: [1, 0.95, 1] } : { y: [0, -6, 0] }}
          transition={
            reconnecting
              ? { duration: 0.6, repeat: Infinity }
              : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          {reconnecting ? (
            <RefreshCw className="h-9 w-9 text-blue-500 animate-spin" />
          ) : (
            <WifiOff className="h-9 w-9 text-zinc-400 dark:text-zinc-500" />
          )}
        </motion.div>

        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          {reconnecting ? 'Reconectando...' : 'Sin conexión'}
        </h1>

        <p className="mt-2 text-muted">
          {reconnecting
            ? 'Se detectó conexión, recargando la página...'
            : 'No hay conexión a internet. Verifica tu conexión y vuelve a intentar.'}
        </p>

        {lastOnline && !reconnecting && (
          <p className="mt-1 text-xs text-subtle">
            Última conexión: {formatLastOnline(lastOnline)}
          </p>
        )}

        {!reconnecting && (
          <div className="mt-8">
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
              className="min-w-[160px]"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
