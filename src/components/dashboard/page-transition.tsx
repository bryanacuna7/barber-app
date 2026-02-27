'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { animations } from '@/lib/design-system'

/**
 * Lightweight page transition for dashboard navigation.
 * Wraps page content with a subtle fade + slide-up animation on route change.
 * Uses key={pathname} to trigger re-mount on each navigation.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: animations.duration.fast,
        ease: animations.easing.easeOut as [number, number, number, number],
      }}
    >
      {children}
    </motion.div>
  )
}
