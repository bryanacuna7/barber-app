/**
 * Theme system for brand customization.
 * Converts hex colors to CSS custom properties.
 */

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return null
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

function lightenColor(hex: string, amount: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  const r = Math.min(255, rgb.r + Math.round((255 - rgb.r) * amount))
  const g = Math.min(255, rgb.g + Math.round((255 - rgb.g) * amount))
  const b = Math.min(255, rgb.b + Math.round((255 - rgb.b) * amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export interface ThemeVars {
  '--brand-primary': string
  '--brand-primary-rgb': string
  '--brand-primary-light': string
  '--brand-secondary': string
}

export function generateThemeVars(primaryColor: string, secondaryColor?: string | null): ThemeVars {
  const rgb = hexToRgb(primaryColor) || { r: 39, g: 39, b: 42 }

  return {
    '--brand-primary': primaryColor,
    '--brand-primary-rgb': `${rgb.r}, ${rgb.g}, ${rgb.b}`,
    '--brand-primary-light': lightenColor(primaryColor, 0.85),
    '--brand-secondary': secondaryColor || lightenColor(primaryColor, 0.4),
  }
}

export function generateThemeStyle(
  primaryColor: string,
  secondaryColor?: string | null
): React.CSSProperties {
  const vars = generateThemeVars(primaryColor, secondaryColor)
  return vars as unknown as React.CSSProperties
}

export function applyThemeToElement(
  element: HTMLElement,
  primaryColor: string,
  secondaryColor?: string | null
) {
  const vars = generateThemeVars(primaryColor, secondaryColor)
  for (const [key, value] of Object.entries(vars)) {
    element.style.setProperty(key, value)
  }
}

export const DEFAULT_BRAND_COLOR = '#27272A'
