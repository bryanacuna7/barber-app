'use client'

import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WelcomeProps {
  onNext: () => void
  businessName: string
}

export function Welcome({ onNext, businessName }: WelcomeProps) {
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
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.1,
        }}
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
        ¡Bienvenido a BarberShop Pro! 🎉
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-lg text-zinc-600 dark:text-zinc-400 mb-2"
      >
        Vamos a configurar{' '}
        <span className="font-semibold text-zinc-900 dark:text-white">{businessName}</span> en solo
        5 minutos.
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-base text-zinc-500 dark:text-zinc-500 mb-12"
      >
        Te guiaremos paso a paso para que puedas empezar a gestionar tu barbería de inmediato.
      </motion.p>

      {/* Features preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full"
      >
        {[
          {
            emoji: '⏰',
            title: 'Configura tu horario',
            desc: 'Define cuándo está abierta tu barbería',
          },
          { emoji: '✂️', title: 'Agrega tus servicios', desc: 'Cortes, afeitados y más' },
          { emoji: '👤', title: 'Registra tus barberos', desc: 'Tu equipo en un solo lugar' },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            className="rounded-2xl bg-white dark:bg-zinc-800 p-6 shadow-sm border border-zinc-200 dark:border-zinc-700"
          >
            <div className="text-3xl mb-3">{feature.emoji}</div>
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">{feature.title}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Button
          size="lg"
          onClick={onNext}
          className="group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-base"
        >
          Empezar Configuración
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </motion.div>
    </motion.div>
  )
}
