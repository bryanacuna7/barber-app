'use client'

/**
 * RadioGroup Component
 * Simple radio group for program type selection
 */

import * as React from 'react'
import { Circle } from 'lucide-react'

interface RadioGroupProps {
  value: string
  onValueChange: (value: string) => void
  className?: string
  children: React.ReactNode
}

interface RadioGroupItemProps {
  value: string
  id?: string
  className?: string
  children: React.ReactNode
}

const RadioGroupContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
} | null>(null)

export function RadioGroup({ value, onValueChange, className = '', children }: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div role="radiogroup" className={`space-y-2 ${className}`}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

export function RadioGroupItem({ value, id, className = '', children }: RadioGroupItemProps) {
  const context = React.useContext(RadioGroupContext)
  if (!context) throw new Error('RadioGroupItem must be used within RadioGroup')

  const isSelected = context.value === value
  const itemId = id || `radio-${value}`

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      id={itemId}
      onClick={() => context.onValueChange(value)}
      className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all min-h-[56px] ${
        isSelected
          ? 'bg-primary/5 dark:bg-primary/10'
          : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800'
      } ${className}`}
    >
      {/* Radio indicator */}
      <div
        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          isSelected ? 'border-primary bg-primary' : 'border-zinc-300 dark:border-zinc-600'
        }`}
      >
        {isSelected && <Circle className="h-2.5 w-2.5 fill-white text-white" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">{children}</div>
    </button>
  )
}
