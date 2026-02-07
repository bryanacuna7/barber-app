'use client'

import { motion } from 'framer-motion'

interface MeshGradientBackgroundProps {
  /**
   * Visual intensity of the gradient
   * - subtle: 15% opacity (default, used in most demos)
   * - medium: 30% opacity (more prominent)
   * - cinematic: 50% opacity (bold, high-impact)
   */
  variant?: 'subtle' | 'medium' | 'cinematic'

  /**
   * Enable/disable animations
   * @default true
   */
  animate?: boolean

  /**
   * Custom gradient colors (overrides default violet-blue/purple-pink)
   */
  colors?: {
    orb1: { from: string; to: string }
    orb2: { from: string; to: string }
  }
}

/**
 * MeshGradientBackground Component
 *
 * Animated gradient orbs used across all 7 UI/UX demos.
 * Creates a premium, modern visual identity with floating gradient blobs.
 *
 * @example
 * ```tsx
 * // Default: Subtle variant with violet-blue and purple-pink orbs
 * <MeshGradientBackground />
 *
 * // Medium intensity
 * <MeshGradientBackground variant="medium" />
 *
 * // Cinematic intensity without animation
 * <MeshGradientBackground variant="cinematic" animate={false} />
 * ```
 *
 * Pattern extracted from 7 winning demos with 9.3/10 quality.
 */
export function MeshGradientBackground({
  variant = 'subtle',
  animate = true,
  colors,
}: MeshGradientBackgroundProps) {
  // Opacity mapping
  const opacityMap = {
    subtle: 'opacity-15',
    medium: 'opacity-30',
    cinematic: 'opacity-50',
  }

  // Default colors (violet-blue and purple-pink from demos)
  const defaultColors = {
    orb1: { from: '#a78bfa', to: '#60a5fa' }, // violet-400 to blue-400
    orb2: { from: '#c084fc', to: '#f472b6' }, // purple-400 to pink-400
  }

  const finalColors = colors || defaultColors

  // Animation configuration
  const orb1Animation = animate
    ? {
        animate: {
          scale: [1, 1.2, 1],
          x: [0, 100, 0],
          y: [0, -50, 0],
        },
        transition: {
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        },
      }
    : {}

  const orb2Animation = animate
    ? {
        animate: {
          scale: [1, 1.3, 1],
          x: [0, -100, 0],
          y: [0, 100, 0],
        },
        transition: {
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        },
      }
    : {}

  return (
    <div
      className={`fixed inset-0 overflow-hidden pointer-events-none ${opacityMap[variant]}`}
      aria-hidden="true"
    >
      {/* Orb 1: Top-left, violet-blue gradient */}
      <motion.div
        {...orb1Animation}
        className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full blur-3xl"
        style={{
          background: `linear-gradient(to bottom right, ${finalColors.orb1.from}, ${finalColors.orb1.to})`,
        }}
      />

      {/* Orb 2: Bottom-right, purple-pink gradient */}
      <motion.div
        {...orb2Animation}
        className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full blur-3xl"
        style={{
          background: `linear-gradient(to bottom right, ${finalColors.orb2.from}, ${finalColors.orb2.to})`,
        }}
      />
    </div>
  )
}
