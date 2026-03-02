'use client'

import { usePathname } from 'next/navigation'

/**
 * Lightweight page transition for dashboard navigation.
 * Uses CSS-only animation (GPU composited) instead of Framer Motion
 * to avoid forced reflows from measureViewportBox/measureScroll.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  )
}
