'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to detect if the current viewport is mobile size
 * @param breakpoint - Tailwind breakpoint (default: 768px = md)
 * @returns boolean indicating if viewport is mobile
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Initial check
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // Set initial value
    checkMobile()

    // Listen for window resize
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [breakpoint])

  return isMobile
}
