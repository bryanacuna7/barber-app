'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const PRESET_COLORS = [
  // Dark/Black
  { hex: '#1C1C1E', name: 'Negro' },
  { hex: '#2C2C2E', name: 'Carbón' },
  // Golds
  { hex: '#C4953A', name: 'Dorado' },
  { hex: '#D4A843', name: 'Oro Claro' },
  // Reds
  { hex: '#FF3B30', name: 'Rojo' },
  { hex: '#8B0000', name: 'Borgoña' },
  // Blues
  { hex: '#007AFF', name: 'Azul iOS' },
  { hex: '#0A84FF', name: 'Azul Brillante' },
  // Greens
  { hex: '#34C759', name: 'Verde' },
  { hex: '#30D158', name: 'Verde Menta' },
  // Purple/Violet
  { hex: '#AF52DE', name: 'Morado' },
  { hex: '#5856D6', name: 'Índigo' },
  // Orange
  { hex: '#FF9500', name: 'Naranja' },
  { hex: '#FF6B35', name: 'Coral' },
  // Teal
  { hex: '#5AC8FA', name: 'Celeste' },
  { hex: '#64D2FF', name: 'Aqua' },
]

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [customHex, setCustomHex] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const isPreset = PRESET_COLORS.some((c) => c.hex.toLowerCase() === value.toLowerCase())

  function handleCustomSubmit() {
    const hex = customHex.startsWith('#') ? customHex : `#${customHex}`
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      onChange(hex)
      setShowCustom(false)
    }
  }

  return (
    <div>
      {label && (
        <label className="mb-3 block text-[13px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {label}
        </label>
      )}

      {/* Preset grid */}
      <div className="grid grid-cols-8 gap-2.5">
        {PRESET_COLORS.map((color) => {
          const isSelected = color.hex.toLowerCase() === value.toLowerCase()
          return (
            <button
              key={color.hex}
              type="button"
              onClick={() => onChange(color.hex)}
              title={color.name}
              className={cn(
                'relative flex h-10 w-10 items-center justify-center rounded-full transition-all',
                isSelected
                  ? 'ring-2 ring-offset-2 ring-zinc-900 dark:ring-white dark:ring-offset-zinc-900 scale-110'
                  : 'hover:scale-110',
              )}
              style={{ backgroundColor: color.hex }}
            >
              {isSelected && (
                <Check
                  className="h-4 w-4"
                  style={{
                    color:
                      color.hex === '#1C1C1E' || color.hex === '#2C2C2E' || color.hex === '#8B0000'
                        ? 'white'
                        : 'white',
                  }}
                  strokeWidth={3}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Custom color */}
      <div className="mt-4">
        {!showCustom ? (
          <button
            type="button"
            onClick={() => {
              setCustomHex(value)
              setShowCustom(true)
            }}
            className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            {!isPreset ? (
              <span className="flex items-center gap-2">
                <span
                  className="inline-block h-4 w-4 rounded-full border border-zinc-300 dark:border-zinc-600"
                  style={{ backgroundColor: value }}
                />
                Color personalizado: {value}
              </span>
            ) : (
              'Usar color personalizado...'
            )}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div
              className="h-10 w-10 flex-shrink-0 rounded-full border-2 border-zinc-200 dark:border-zinc-700"
              style={{
                backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(
                  customHex.startsWith('#') ? customHex : `#${customHex}`,
                )
                  ? customHex.startsWith('#')
                    ? customHex
                    : `#${customHex}`
                  : '#ccc',
              }}
            />
            <input
              type="text"
              value={customHex}
              onChange={(e) => setCustomHex(e.target.value)}
              placeholder="#FF5733"
              maxLength={7}
              className="flex-1 rounded-xl border-0 bg-zinc-100/80 px-4 py-2.5 text-[15px] font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:bg-zinc-800/80 dark:text-white dark:focus:ring-white/20"
            />
            <button
              type="button"
              onClick={handleCustomSubmit}
              className="rounded-xl bg-zinc-900 px-4 py-2.5 text-[13px] font-semibold text-white dark:bg-white dark:text-zinc-900"
            >
              Aplicar
            </button>
            <button
              type="button"
              onClick={() => setShowCustom(false)}
              className="text-[13px] text-zinc-400 hover:text-zinc-600"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
