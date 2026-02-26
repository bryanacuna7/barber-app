'use client'

import { useState, useEffect, useRef } from 'react'

function toRgbChannels(color: string, fallback: string): string {
  const hex = color.trim().match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (hex) {
    return `${parseInt(hex[1], 16)}, ${parseInt(hex[2], 16)}, ${parseInt(hex[3], 16)}`
  }

  const rgb = color
    .trim()
    .match(/^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})(?:[\s,\/]+[\d.]+)?\s*\)$/i)
  if (rgb) {
    return `${rgb[1]}, ${rgb[2]}, ${rgb[3]}`
  }

  return fallback
}

export interface ChartColors {
  accent: string
  grid: string
  axis: string
  winner: string
  winnerRgb: string
  bars: string[]
  tooltipBg: string
  tooltipBorder: string
  tooltipText: string
}

const DEFAULT_COLORS: ChartColors = {
  accent: '#6d7cff',
  grid: '#e5e7eb',
  axis: '#9ca3af',
  winner: '#f59e0b',
  winnerRgb: '245, 158, 11',
  bars: [
    'rgba(109, 124, 255, 0.72)',
    'rgba(109, 124, 255, 0.56)',
    'rgba(109, 124, 255, 0.42)',
    'rgba(109, 124, 255, 0.32)',
  ],
  tooltipBg: 'rgba(18, 22, 30, 0.86)',
  tooltipBorder: 'rgba(163, 175, 196, 0.16)',
  tooltipText: '#f5f7fb',
}

/**
 * Shared hook for chart theme colors.
 * Reads CSS custom properties and responds to dark mode changes.
 * Stabilized: only triggers re-render when values actually change.
 */
export function useChartColors(): ChartColors {
  const [colors, setColors] = useState<ChartColors>(DEFAULT_COLORS)
  const prevJsonRef = useRef('')

  useEffect(() => {
    const update = () => {
      const root = document.documentElement
      const s = getComputedStyle(root)
      const isDarkTheme =
        root.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches
      const readableAccent = (
        isDarkTheme
          ? s.getPropertyValue('--brand-primary-on-dark')
          : s.getPropertyValue('--brand-primary-on-light')
      ).trim()
      const brandRgb = s.getPropertyValue('--brand-primary-rgb').trim() || '109, 124, 255'
      const winner = s.getPropertyValue('--color-warning').trim() || '#f59e0b'

      const next: ChartColors = {
        accent: readableAccent || s.getPropertyValue('--brand-primary').trim() || '#6d7cff',
        grid: s.getPropertyValue('--chart-grid').trim() || '#e5e7eb',
        axis: s.getPropertyValue('--chart-axis').trim() || '#9ca3af',
        winner,
        winnerRgb: toRgbChannels(winner, '245, 158, 11'),
        bars: [
          `rgba(${brandRgb}, 0.72)`,
          `rgba(${brandRgb}, 0.56)`,
          `rgba(${brandRgb}, 0.42)`,
          `rgba(${brandRgb}, 0.32)`,
        ],
        tooltipBg: isDarkTheme ? 'rgba(18, 22, 30, 0.76)' : 'rgba(255, 255, 255, 0.96)',
        tooltipBorder: isDarkTheme ? 'rgba(163, 175, 196, 0.16)' : 'rgba(15, 23, 42, 0.12)',
        tooltipText: isDarkTheme ? '#f5f7fb' : '#0f172a',
      }

      // Only re-render if values actually changed
      const json = JSON.stringify(next)
      if (json !== prevJsonRef.current) {
        prevJsonRef.current = json
        setColors(next)
      }
    }

    update()
    const root = document.documentElement
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const observer = new MutationObserver(update)
    observer.observe(root, { attributes: true, attributeFilter: ['class', 'style'] })
    mq.addEventListener('change', update)
    return () => {
      observer.disconnect()
      mq.removeEventListener('change', update)
    }
  }, [])

  return colors
}
