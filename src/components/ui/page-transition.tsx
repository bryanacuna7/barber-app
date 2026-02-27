'use client'

import { type ReactNode } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { animations, reducedMotion } from '@/lib/design-system'

interface PageTransitionProps {
  children: ReactNode
  variant?: 'fade' | 'slide' | 'scale' | 'slideUp'
}

const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
}

export function PageTransition({ children, variant = 'fade' }: PageTransitionProps) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()
  const selectedVariant = variants[variant]

  // For reduced motion: only use opacity, no translate or scale
  const reducedVariant = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  }

  const finalVariant = prefersReducedMotion ? reducedVariant : selectedVariant
  const transition = prefersReducedMotion ? { duration: 0.1 } : animations.spring.snappy

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={finalVariant.initial}
        animate={finalVariant.animate}
        exit={finalVariant.exit}
        transition={transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Reveal animation on scroll
interface RevealOnScrollProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function RevealOnScroll({ children, className, delay = 0 }: RevealOnScrollProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ ...animations.spring.snappy, delay }}
    >
      {children}
    </motion.div>
  )
}
