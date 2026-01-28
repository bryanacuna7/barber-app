'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils/cn'

interface PasswordStrengthProps {
  password: string
  className?: string
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' }

    let score = 0

    // Length
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1

    // Contains lowercase
    if (/[a-z]/.test(password)) score += 1

    // Contains uppercase
    if (/[A-Z]/.test(password)) score += 1

    // Contains number
    if (/\d/.test(password)) score += 1

    // Contains special char
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    // Determine label and color
    if (score <= 2) {
      return { score: 1, label: 'Débil', color: 'bg-red-500' }
    } else if (score <= 4) {
      return { score: 2, label: 'Media', color: 'bg-yellow-500' }
    } else {
      return { score: 3, label: 'Fuerte', color: 'bg-green-500' }
    }
  }, [password])

  if (!password) return null

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex gap-1">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              level <= strength.score ? strength.color : 'bg-gray-200 dark:bg-gray-700'
            )}
          />
        ))}
      </div>
      <p
        className={cn(
          'text-xs font-medium',
          strength.score === 1 && 'text-red-600 dark:text-red-400',
          strength.score === 2 && 'text-yellow-600 dark:text-yellow-400',
          strength.score === 3 && 'text-green-600 dark:text-green-400'
        )}
      >
        Contraseña {strength.label}
      </p>
    </div>
  )
}
