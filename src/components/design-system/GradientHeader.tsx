/**
 * GradientHeader Component
 *
 * Gradient text header component extracted from all 7 winning demo designs.
 * Provides consistent gradient styling (violet → purple → blue) across the application.
 *
 * Pattern found in:
 * - Servicios Demo D (preview-d/page.tsx:192)
 * - Mi Día Demo B (preview-b/page.tsx:161)
 * - Clientes Fusion (preview-fusion/page.tsx:453)
 * - Reportes Fusion (preview-fusion/page.tsx:123)
 * - Configuración Demo A (demo-a/page.tsx:96)
 * - Barberos Demo B (preview-b/page.tsx:169)
 * - Citas Demo B Fusion (used in headers)
 *
 * @example
 * ```tsx
 * // Default (h1, medium size)
 * <GradientHeader>Servicios</GradientHeader>
 *
 * // Large header for hero sections
 * <GradientHeader size="lg">Intelligence Report</GradientHeader>
 *
 * // Giant title (Configuración style)
 * <GradientHeader size="giant" as="h1">Configuración</GradientHeader>
 *
 * // Small inline text
 * <GradientHeader size="sm" as="span">Clientes</GradientHeader>
 *
 * // Custom h2 with override classes
 * <GradientHeader as="h2" className="mb-8">Dashboard</GradientHeader>
 * ```
 */

import { cn } from '@/lib/utils'
import React from 'react'

export interface GradientHeaderProps {
  /**
   * Text content to display with gradient
   */
  children: React.ReactNode

  /**
   * Size variant for the header
   * - xs: text-sm (inline text, tags)
   * - sm: text-xl (mobile headers, sidebar)
   * - md: text-2xl md:text-3xl (default, section headers)
   * - lg: text-3xl lg:text-4xl (page headers)
   * - xl: text-4xl (hero headers)
   * - giant: text-5xl lg:text-6xl xl:text-7xl (landing pages, hero)
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'giant'

  /**
   * HTML element to render as
   * @default 'h1'
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'p' | 'div'

  /**
   * Additional Tailwind classes to override or extend styles
   */
  className?: string
}

/**
 * Size mapping to Tailwind classes
 * Extracted from actual usage across 7 winning demos
 */
const sizeClasses = {
  xs: 'text-sm',
  sm: 'text-xl',
  md: 'text-2xl md:text-3xl',
  lg: 'text-3xl lg:text-4xl',
  xl: 'text-4xl',
  giant: 'text-5xl lg:text-6xl xl:text-7xl',
} as const

/**
 * Brand-aware gradient using CSS custom properties.
 * Derives from --brand-primary (set in globals.css / theme-provider).
 * Replaces hardcoded violet→purple→blue with single-accent discipline.
 */
const gradientClasses = 'brand-gradient-text'

export function GradientHeader({
  children,
  size = 'md',
  as: Component = 'h1',
  className,
}: GradientHeaderProps) {
  return (
    <Component
      className={cn(
        // Base styles
        'font-bold tracking-tight',
        // Gradient effect
        gradientClasses,
        // Size variant
        sizeClasses[size],
        // Custom overrides
        className
      )}
    >
      {children}
    </Component>
  )
}

/**
 * Pre-configured variants for common use cases
 */

/**
 * Page-level header (h1, large size)
 * Used in: Servicios, Mi Día, Reportes
 */
export function PageHeader({
  children,
  className,
}: Pick<GradientHeaderProps, 'children' | 'className'>) {
  return (
    <GradientHeader size="lg" as="h1" className={className}>
      {children}
    </GradientHeader>
  )
}

/**
 * Section header (h2, medium size)
 * Used in: KPI sections, data tables
 */
export function SectionHeader({
  children,
  className,
}: Pick<GradientHeaderProps, 'children' | 'className'>) {
  return (
    <GradientHeader size="md" as="h2" className={className}>
      {children}
    </GradientHeader>
  )
}

/**
 * Sidebar/Mobile header (h1, small size)
 * Used in: Mi Día mobile, Clientes mobile
 */
export function CompactHeader({
  children,
  className,
}: Pick<GradientHeaderProps, 'children' | 'className'>) {
  return (
    <GradientHeader size="sm" as="h1" className={className}>
      {children}
    </GradientHeader>
  )
}

/**
 * Hero title (h1, giant size)
 * Used in: Configuración landing
 */
export function HeroTitle({
  children,
  className,
}: Pick<GradientHeaderProps, 'children' | 'className'>) {
  return (
    <GradientHeader size="giant" as="h1" className={className}>
      {children}
    </GradientHeader>
  )
}

/**
 * Inline gradient text (span, xs size)
 * For labels, tags, or inline emphasis
 */
export function GradientText({
  children,
  className,
}: Pick<GradientHeaderProps, 'children' | 'className'>) {
  return (
    <GradientHeader size="xs" as="span" className={className}>
      {children}
    </GradientHeader>
  )
}
