'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShareBookingLink } from '@/components/share/share-booking-link'
import { bookingPath } from '@/lib/utils/booking-url'
import { trackEvent } from '@/lib/analytics/track'

interface ShareLinkProps {
  onComplete: () => void
  businessName: string
  slug: string
}

export function ShareLink({ onComplete, businessName, slug }: ShareLinkProps) {
  useEffect(() => {
    trackEvent('onboarding_completed')

    // Confetti effect
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js'
    script.async = true
    document.body.appendChild(script)

    script.onload = () => {
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now()
        if (timeLeft <= 0) return clearInterval(interval)

        const particleCount = 50 * (timeLeft / duration)
        if (typeof window !== 'undefined' && (window as any).confetti) {
          ;(window as any).confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          })
          ;(window as any).confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          })
        }
      }, 250)

      setTimeout(() => clearInterval(interval), duration)
    }

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center max-w-2xl mx-auto"
    >
      {/* Success icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full blur-2xl opacity-30" />
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600">
          <CheckCircle2 className="h-14 w-14 text-white" strokeWidth={2.5} />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-4xl font-bold text-zinc-900 dark:text-white mb-3"
      >
        ¡Todo Listo!
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-lg text-zinc-600 dark:text-zinc-400 mb-2"
      >
        <span className="font-semibold text-zinc-900 dark:text-white">{businessName}</span> está
        configurado y listo para recibir clientes.
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-base text-zinc-500 mb-10"
      >
        Compartí este link con tu primer cliente para probar.
      </motion.p>

      {/* Share booking link */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full mb-10"
      >
        <ShareBookingLink
          bookingPath={bookingPath(slug)}
          slug={slug}
          businessName={businessName}
          variant="full"
          onCopy={() => trackEvent('share_link_copy', { source: 'onboarding' })}
          onWhatsAppClick={() => trackEvent('share_whatsapp_click', { source: 'onboarding' })}
          onShareClick={() => trackEvent('share_native_click', { source: 'onboarding' })}
        />
      </motion.div>

      {/* Go to dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Button
          size="lg"
          variant="outline"
          onClick={onComplete}
          className="group h-12 px-8 text-base"
        >
          Ir al Dashboard
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </motion.div>
    </motion.div>
  )
}
