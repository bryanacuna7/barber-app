'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Client } from '@/types'

interface ClientNotificationsBannerProps {
  notifications: Client[]
  showNotifications: boolean
  onDismiss: () => void
  onWhatsApp: (phone: string) => void
}

export function ClientNotificationsBanner({
  notifications,
  showNotifications,
  onDismiss,
  onWhatsApp,
}: ClientNotificationsBannerProps) {
  return (
    <AnimatePresence>
      {showNotifications && notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="rounded-2xl border border-zinc-200/75 dark:border-zinc-700/70 bg-white/80 dark:bg-zinc-900/85 p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05),0_1px_3px_rgba(16,24,40,0.04)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <h3 className="font-semibold text-foreground">Acciones Sugeridas</h3>
                <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
                  {notifications.length}
                </span>
              </div>
              <Button
                variant="ghost"
                onClick={onDismiss}
                className="text-muted hover:text-zinc-900 dark:hover:text-white h-auto p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {notifications.slice(0, 3).map((client) => {
                const lastVisit = client.last_visit_at ? new Date(client.last_visit_at) : null
                const daysSinceVisit = lastVisit
                  ? Math.floor((new Date().getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
                  : 0

                return (
                  <div
                    key={client.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-200/70 dark:border-zinc-700/70 bg-white/85 dark:bg-zinc-800/70 p-3 shadow-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 text-xs font-semibold text-orange-700 dark:text-orange-300 shrink-0">
                        {client.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {client.name}
                        </p>
                        <p className="text-xs text-muted">{daysSinceVisit}d sin visita</p>
                      </div>
                    </div>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => onWhatsApp(client.phone)}
                      className="shrink-0 h-11 w-11 min-h-0 rounded-full p-0"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
