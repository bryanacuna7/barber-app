'use client'

import { motion } from 'framer-motion'

export function PremiumBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
      {/* Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950" />

      {/* Subtle ambient mesh — neutral tones, low saturation */}
      <div className="absolute inset-0 opacity-[0.07]">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 60, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full blur-3xl"
          style={{ background: 'rgba(var(--brand-primary-rgb), 0.5)' }}
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -60, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full blur-3xl"
          style={{ background: 'rgba(var(--brand-primary-rgb), 0.3)' }}
        />
      </div>
    </div>
  )
}
