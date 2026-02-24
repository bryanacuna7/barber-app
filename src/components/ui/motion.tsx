'use client'

import { motion, AnimatePresence, type Variants, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { forwardRef, useEffect, type ReactNode, type ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { animations, reducedMotion } from '@/lib/design-system'

// Re-export design system springs as convenience aliases
export const springTransition = animations.spring.snappy
export const gentleSpring = animations.spring.gentle

// Fade In Up — renders instantly (no entrance animation to avoid SSR hydration flash)
export function FadeInUp({
  children,
  delay: _delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return <div className={className}>{children}</div>
}

// Staggered list animation
export function StaggeredList({
  children,
  className,
  staggerDelay = 0.05,
}: {
  children: ReactNode
  className?: string
  staggerDelay?: number
}) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggeredItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: animations.spring.default,
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Press animation (iOS tap effect)
interface PressableProps extends ComponentProps<typeof motion.button> {
  children: ReactNode
  scale?: number
}

export const Pressable = forwardRef<HTMLButtonElement, PressableProps>(
  ({ children, scale = 0.97, className, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion()

    return (
      <motion.button
        ref={ref}
        whileTap={prefersReducedMotion ? {} : { scale }}
        transition={
          prefersReducedMotion
            ? { duration: reducedMotion.spring.default.duration }
            : { duration: animations.duration.fast }
        }
        className={cn('cursor-pointer', className)}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)
Pressable.displayName = 'Pressable'

// Hover lift animation
export function HoverLift({ children, className }: { children: ReactNode; className?: string }) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      whileHover={{
        y: -2,
        transition: { duration: animations.duration.fast },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Scale on hover (for cards)
export function ScaleOnHover({ children, className }: { children: ReactNode; className?: string }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div whileTap={prefersReducedMotion ? {} : { scale: 0.98 }} className={className}>
      {children}
    </motion.div>
  )
}

// Page transition wrapper
export function PageTransition({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reducedMotion.spring.default.duration }}
        className={className}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: animations.duration.slow,
        ease: animations.easing.easeOut as [number, number, number, number],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Slide in from right (for navigation)
export function SlideInRight({ children, className }: { children: ReactNode; className?: string }) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={animations.spring.sheet}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Spring number counter — animates value changes, renders instantly on first paint (no SSR flash)
export function AnimatedNumber({
  value,
  className,
  locale = 'es-CR',
  prefix = '',
}: {
  value: number
  className?: string
  locale?: string
  prefix?: string
}) {
  const prefersReducedMotion = useReducedMotion()
  const spring = useSpring(value, prefersReducedMotion ? { duration: 0 } : animations.spring.gentle)
  const display = useTransform(spring, (v) =>
    prefix + Math.round(v).toLocaleString(locale)
  )

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return <motion.span className={className}>{display}</motion.span>
}

// Success checkmark animation
export function SuccessCheckmark({ className }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion()

  const checkVariants: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: prefersReducedMotion
        ? { duration: reducedMotion.spring.default.duration }
        : {
            pathLength: { duration: animations.duration.slow, ease: 'easeOut' },
            opacity: { duration: animations.duration.fast },
          },
    },
  }

  const circleVariants: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: prefersReducedMotion ? reducedMotion.spring.default : animations.spring.default,
    },
  }

  return (
    <motion.svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      initial="hidden"
      animate="visible"
      className={className}
    >
      <motion.circle
        cx="32"
        cy="32"
        r="30"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        variants={circleVariants}
      />
      <motion.path
        d="M20 32L28 40L44 24"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        variants={checkVariants}
      />
    </motion.svg>
  )
}

// Export AnimatePresence for convenience
export { AnimatePresence, motion }
