'use client'

import { useEffect } from 'react'

interface ThemeProviderProps {
  primaryColor: string
  secondaryColor?: string | null
}

export function ThemeProvider({ primaryColor, secondaryColor }: ThemeProviderProps) {
  useEffect(() => {
    // Apply CSS variables to :root
    const root = document.documentElement

    function hexToRgb(hex: string): string {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      if (!result) return '0, 0, 0'
      return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    }

    function hexToRgbValues(hex: string): { r: number; g: number; b: number } {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      if (!result) return { r: 0, g: 0, b: 0 }
      return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    }

    function lightenColor(hex: string, amount: number): string {
      const { r, g, b } = hexToRgbValues(hex)
      const newR = Math.min(255, r + Math.round((255 - r) * amount))
      const newG = Math.min(255, g + Math.round((255 - g) * amount))
      const newB = Math.min(255, b + Math.round((255 - b) * amount))
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
    }

    function darkenColor(hex: string, amount: number): string {
      const { r, g, b } = hexToRgbValues(hex)
      const newR = Math.max(0, r - Math.round(r * amount))
      const newG = Math.max(0, g - Math.round(g * amount))
      const newB = Math.max(0, b - Math.round(b * amount))
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
    }

    // Calculate relative luminance (WCAG 2.0)
    function getLuminance(r: number, g: number, b: number): number {
      const [rs, gs, bs] = [r, g, b].map((c) => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }

    // Calculate contrast ratio between two colors
    function getContrastRatio(l1: number, l2: number): number {
      const lighter = Math.max(l1, l2)
      const darker = Math.min(l1, l2)
      return (lighter + 0.05) / (darker + 0.05)
    }

    // Determine if color is light or dark
    function isLightColor(hex: string): boolean {
      const { r, g, b } = hexToRgbValues(hex)
      const luminance = getLuminance(r, g, b)
      return luminance > 0.5
    }

    // Get contrasting text color (white or black)
    function getContrastingTextColor(backgroundColor: string): string {
      const { r, g, b } = hexToRgbValues(backgroundColor)
      const bgLuminance = getLuminance(r, g, b)

      // Luminance of white (1) and black (0)
      const whiteLuminance = 1
      const blackLuminance = 0

      const contrastWithWhite = getContrastRatio(bgLuminance, whiteLuminance)
      const contrastWithBlack = getContrastRatio(bgLuminance, blackLuminance)

      // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
      // We use white if contrast is good, otherwise black
      return contrastWithWhite >= 4.5 ? '#ffffff' : '#000000'
    }

    // Get a readable version of the brand color for text-on-light or text-on-dark
    function getReadableBrandColor(brandColor: string, onDarkBackground: boolean): string {
      const { r, g, b } = hexToRgbValues(brandColor)
      const brandLuminance = getLuminance(r, g, b)
      const targetLuminance = onDarkBackground ? 0 : 1 // Dark bg needs light text, light bg needs dark text
      const targetContrast = getContrastRatio(brandLuminance, targetLuminance)

      // If contrast is already good (>= 4.5), use the brand color as-is
      if (targetContrast >= 4.5) {
        return brandColor
      }

      // Otherwise, lighten or darken until we hit good contrast
      let adjusted = brandColor
      const step = onDarkBackground ? 0.1 : 0.15
      const adjust = onDarkBackground ? lightenColor : darkenColor

      for (let i = 0; i < 8; i++) {
        adjusted = adjust(adjusted, step)
        const { r: ar, g: ag, b: ab } = hexToRgbValues(adjusted)
        const adjLuminance = getLuminance(ar, ag, ab)
        const adjContrast = getContrastRatio(adjLuminance, targetLuminance)
        if (adjContrast >= 4.5) break
      }

      return adjusted
    }

    const isLight = isLightColor(primaryColor)

    root.style.setProperty('--brand-primary', primaryColor)
    root.style.setProperty('--brand-primary-rgb', hexToRgb(primaryColor))
    root.style.setProperty('--brand-primary-light', lightenColor(primaryColor, 0.85))
    root.style.setProperty('--brand-primary-dark', darkenColor(primaryColor, 0.3))
    root.style.setProperty(
      '--brand-secondary',
      secondaryColor || lightenColor(primaryColor, 0.4)
    )

    // Contrasting text colors
    root.style.setProperty('--brand-primary-contrast', getContrastingTextColor(primaryColor))

    // Readable versions for text usage
    root.style.setProperty('--brand-primary-on-light', getReadableBrandColor(primaryColor, false))
    root.style.setProperty('--brand-primary-on-dark', getReadableBrandColor(primaryColor, true))

    // Store if brand is light/dark for conditional styling
    root.style.setProperty('--brand-is-light', isLight ? '1' : '0')
  }, [primaryColor, secondaryColor])

  return null
}
