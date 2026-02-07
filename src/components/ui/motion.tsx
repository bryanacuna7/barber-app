'use client'

import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { forwardRef, type ReactNode, type ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { animations } from '@/lib/design-system'

// Re-export design system springs as convenience aliases
export const springTransition = animations.spring.snappy
export const gentleSpring = animations.spring.gentle

// Fade In Up animation (for page content)
export function FadeInUp({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.33, 1, 0.68, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
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
  index,
}: {
  children: ReactNode
  className?: string
  index?: number
}) {
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
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale }}
        transition={{ duration: 0.1 }}
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
  return (
    <motion.div
      whileHover={{
        y: -2,
        transition: { duration: 0.2 },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Scale on hover (for cards)
export function ScaleOnHover({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div whileTap={{ scale: 0.98 }} className={className}>
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Slide in from right (for navigation)
export function SlideInRight({ children, className }: { children: ReactNode; className?: string }) {
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

// Number counter animation
export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={animations.spring.snappy}
      className={className}
    >
      {value}
    </motion.span>
  )
}

// Success checkmark animation
export function SuccessCheckmark({ className }: { className?: string }) {
  const checkVariants: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 0.4, ease: 'easeOut' },
        opacity: { duration: 0.1 },
      },
    },
  }

  const circleVariants: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: animations.spring.default,
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

// Skeleton loader with shimmer
export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:animate-[shimmer_2s_infinite]',
        'before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
        className
      )}
      {...props}
    />
  )
}

// Export AnimatePresence for convenience
export { AnimatePresence, motion }
