'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Animated splash screen overlay.
 *
 * The root layout renders a static HTML splash (#splash-static) that shows
 * instantly on the server-rendered page. This client component:
 * 1. Hides the static splash on mount (React has hydrated)
 * 2. Shows a Framer Motion version with the exit animation
 * 3. Dismisses after a short delay with a smooth fade-out
 * 4. Only shows once per session (sessionStorage flag)
 */
export function SplashScreen() {
  // Always start true to match server render; check sessionStorage in useEffect
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Always hide the static splash once React hydrates
    const staticEl = document.getElementById('splash-static')
    if (staticEl) staticEl.style.display = 'none'

    // If already shown this session, hide immediately
    if (sessionStorage.getItem('bsp_splash_shown')) {
      // Use requestAnimationFrame to avoid synchronous setState in effect
      requestAnimationFrame(() => setVisible(false))
      return
    }

    sessionStorage.setItem('bsp_splash_shown', '1')

    // Short delay so the animated version is visible before exit
    const timer = setTimeout(() => setVisible(false), 1400)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
        >
          {/* Barber pole icon */}
          <div className="relative mb-8">
            <div className="relative h-[120px] w-[56px] overflow-hidden rounded-full">
              {/* Animated stripes — continuous downward scroll */}
              <motion.div
                className="absolute inset-0"
                initial={{ y: 0 }}
                animate={{ y: -40 }}
                transition={{
                  duration: 1.8,
                  ease: 'linear',
                  repeat: Infinity,
                }}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-[-95%] w-[320%]"
                    style={{
                      top: i * 26 - 30,
                      height: 10,
                      borderRadius: 5,
                      background: 'white',
                      transform: 'rotate(-30deg)',
                    }}
                  />
                ))}
              </motion.div>
            </div>

            {/* Subtle glow */}
            <div className="absolute inset-0 -z-10 scale-[2] rounded-full bg-white/5 blur-2xl" />
          </div>

          {/* Wordmark */}
          <p className="text-[22px] font-bold tracking-tight text-white">BarberApp</p>

          {/* Tagline */}
          <p className="mt-1.5 text-[13px] font-normal text-zinc-500">
            Agenda fácil, clientes felices
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
