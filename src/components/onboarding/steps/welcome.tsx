'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Zap, SlidersHorizontal, Check, Clock3, Scissors, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trackEvent } from '@/lib/analytics/track'

interface WelcomeProps {
  onApplyDefaults: () => void
  onCustomize: () => void
  onSkip?: () => void
  businessName: string
}

export function Welcome({ onApplyDefaults, onCustomize, onSkip, businessName }: WelcomeProps) {
  useEffect(() => {
    trackEvent('welcome_start')
  }, [])

  const handleApplyDefaults = () => {
    trackEvent('defaults_applied')
    onApplyDefaults()
  }

  const handleCustomize = () => {
    trackEvent('customize_start')
    onCustomize()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center text-center max-w-2xl mx-auto"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-2xl opacity-30" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
          <Sparkles className="h-12 w-12 text-white" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl font-bold text-zinc-900 dark:text-white mb-4"
      >
        ¡Bienvenido!
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-lg text-zinc-600 dark:text-zinc-400 mb-2"
      >
        Configurá{' '}
        <span className="font-semibold text-zinc-900 dark:text-white">{businessName}</span> en solo
        2 minutos.
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-base text-zinc-500 dark:text-zinc-500 mb-10"
      >
        Podés empezar con la configuración típica o personalizar todo a tu gusto.
      </motion.p>

      {/* Defaults summary card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 border border-green-200 dark:border-green-800 mb-10"
      >
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
          Configuración típica incluye:
        </p>
        <div className="space-y-3 text-left">
          {[
            {
              icon: Clock3,
              label: 'Horario',
              value: 'Lun–Sáb 9am–6pm, Dom cerrado',
            },
            {
              icon: Scissors,
              label: 'Servicio',
              value: 'Corte Regular — ₡5,000 (30 min)',
            },
            {
              icon: UserRound,
              label: 'Barbero',
              value: `${businessName} como primer barbero`,
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.08 }}
              className="flex items-start gap-3"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 dark:bg-green-600">
                <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                  {item.label}:
                </span>{' '}
                <span className="text-sm text-zinc-600 dark:text-zinc-400">{item.value}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="w-full space-y-3"
      >
        {/* Primary: Turbo defaults */}
        <Button
          size="lg"
          onClick={handleApplyDefaults}
          className="group w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white h-12 text-base"
        >
          <Zap className="mr-2 h-5 w-5" />
          Usar configuración típica
        </Button>

        {/* Secondary: Customize */}
        <Button
          size="lg"
          variant="outline"
          onClick={handleCustomize}
          className="group w-full h-12 text-base"
        >
          <SlidersHorizontal className="mr-2 h-5 w-5" />
          Personalizar paso a paso
        </Button>

        {/* Skip */}
        {onSkip && (
          <button
            onClick={onSkip}
            className="mt-2 block w-full text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            Configurar después
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}
