'use client'

/**
 * Program Type Selector
 * Clean radio group for selecting loyalty program type
 * Apple Settings-style: No decorative gradients, content-focused
 */

import type { LucideIcon } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export interface ProgramType {
  value: 'points' | 'visits' | 'referral' | 'hybrid'
  label: string
  description: string
  icon: LucideIcon
}

interface Props {
  value: string
  onChange: (value: string) => void
  options: ProgramType[]
}

export function ProgramTypeSelector({ value, onChange, options }: Props) {
  return (
    <div>
      <label className="mb-3 block text-sm font-medium text-foreground lg:text-base">
        Tipo de Programa
      </label>
      <RadioGroup value={value} onValueChange={onChange}>
        {options.map((option) => {
          const Icon = option.icon
          return (
            <RadioGroupItem key={option.value} value={option.value}>
              {/* Icon */}
              <div className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-100/90 dark:border-zinc-700/60 dark:bg-zinc-800/80">
                <Icon className="h-5 w-5 text-foreground" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{option.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{option.description}</p>
              </div>
            </RadioGroupItem>
          )
        })}
      </RadioGroup>
    </div>
  )
}
