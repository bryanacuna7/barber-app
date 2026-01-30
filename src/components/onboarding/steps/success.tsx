'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SuccessProps {
  onComplete: () => void
  businessName: string
}

export function Success({ onComplete, businessName }: SuccessProps) {
  useEffect(() => {
    // Load confetti script
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js'
    script.async = true
    document.body.appendChild(script)

    script.onload = () => {
      // Confetti effect
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)

        // Create confetti
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
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.2,
        }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full blur-2xl opacity-30" />
        <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600">
          <CheckCircle2 className="h-16 w-16 text-white" strokeWidth={2.5} />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-4xl font-bold text-zinc-900 dark:text-white mb-4"
      >
        ¡Todo Listo! 🎉
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
        className="text-base text-zinc-500 dark:text-zinc-500 mb-12"
      >
        Ahora puedes empezar a gestionar citas, servicios y mucho más.
      </motion.p>

      {/* Features unlocked */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full mb-12"
      >
        <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-8 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
              Lo que puedes hacer ahora:
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {[
              { emoji: '📅', text: 'Crear y gestionar citas' },
              { emoji: '👥', text: 'Agregar más clientes' },
              { emoji: '✂️', text: 'Configurar más servicios' },
              { emoji: '👤', text: 'Invitar más barberos' },
              { emoji: '📊', text: 'Ver estadísticas y analíticas' },
              { emoji: '🎨', text: 'Personalizar tu marca' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.05 }}
                className="flex items-start gap-3"
              >
                <span className="text-2xl">{feature.emoji}</span>
                <span className="text-zinc-700 dark:text-zinc-300 pt-1">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Trial info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800 mb-8"
      >
        <p className="text-sm text-blue-800 dark:text-blue-300">
          🎁 <strong>Tienes 7 días de prueba gratis</strong> con todas las funciones Pro
          desbloqueadas.
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <Button
          size="lg"
          onClick={onComplete}
          className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 text-base"
        >
          Ir al Dashboard
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </motion.div>
    </motion.div>
  )
}
