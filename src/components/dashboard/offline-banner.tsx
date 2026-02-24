'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { useToast } from '@/components/ui/toast'

/**
 * Dashboard-level offline indicator.
 * Shows amber banner when offline, with toast notifications on transitions.
 * Mount in dashboard layout — auto-hides when online.
 */
export function OfflineBanner() {
  const { isOnline, wasOffline } = useOnlineStatus()
  const toast = useToast()
  const toastRef = useRef(toast)
  const hasNotifiedOffline = useRef(false)
  const hasNotifiedOnline = useRef(false)

  // Keep toast ref in sync (must be in useEffect, not render)
  useEffect(() => {
    toastRef.current = toast
  }, [toast])

  useEffect(() => {
    if (!isOnline && !hasNotifiedOffline.current) {
      toastRef.current.warning('Sin conexión a internet')
      hasNotifiedOffline.current = true
      hasNotifiedOnline.current = false
    }
    if (isOnline && wasOffline && !hasNotifiedOnline.current && hasNotifiedOffline.current) {
      toastRef.current.info('Conexión restaurada')
      hasNotifiedOnline.current = true
      hasNotifiedOffline.current = false
    }
  }, [isOnline, wasOffline])

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/50 px-4 py-2.5 text-sm text-amber-800 dark:text-amber-200">
            <WifiOff className="h-4 w-4 shrink-0" />
            <span>Sin conexión — Los datos mostrados pueden no estar actualizados</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default OfflineBanner
