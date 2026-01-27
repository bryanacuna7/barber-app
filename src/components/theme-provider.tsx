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

    function lightenColor(hex: string, amount: number): string {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      if (!result) return hex
      const r = parseInt(result[1], 16)
      const g = parseInt(result[2], 16)
      const b = parseInt(result[3], 16)
      const newR = Math.min(255, r + Math.round((255 - r) * amount))
      const newG = Math.min(255, g + Math.round((255 - g) * amount))
      const newB = Math.min(255, b + Math.round((255 - b) * amount))
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
    }

    root.style.setProperty('--brand-primary', primaryColor)
    root.style.setProperty('--brand-primary-rgb', hexToRgb(primaryColor))
    root.style.setProperty('--brand-primary-light', lightenColor(primaryColor, 0.85))
    root.style.setProperty(
      '--brand-secondary',
      secondaryColor || lightenColor(primaryColor, 0.4)
    )
  }, [primaryColor, secondaryColor])

  return null
}
