'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordStrength } from '@/components/ui/password-strength'
import { useFormValidation } from '@/hooks/use-form-validation'
import { changePasswordSchema } from '@/lib/validations/auth'

interface ChangePasswordFormProps {
  /** Auth email for re-authentication (from Supabase Auth user.email, NOT client table email) */
  userAuthEmail: string
}

/** Classify Supabase auth errors with best-effort matching + robust fallback */
function classifyAuthError(
  error: { message?: string; status?: number },
  phase: 'signIn' | 'updateUser'
): string {
  const msg = (error.message ?? '').toLowerCase()
  const status = error.status ?? 0

  if (status === 429 || msg.includes('too_many') || msg.includes('rate')) {
    return 'Demasiados intentos. Espera unos minutos.'
  }

  if (phase === 'signIn') {
    if (msg.includes('invalid') || msg.includes('credentials') || msg.includes('password')) {
      return 'Contraseña actual incorrecta.'
    }
    return 'Error al verificar credenciales. Intenta de nuevo.'
  }

  // phase === 'updateUser'
  if (msg.includes('same') || msg.includes('identical')) {
    return 'La contraseña nueva debe ser diferente a la actual.'
  }
  return 'No pudimos actualizar la contraseña. Intenta de nuevo.'
}

export function ChangePasswordForm({ userAuthEmail }: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const { getFieldError, markFieldTouched, validateForm, clearErrors } =
    useFormValidation(changePasswordSchema)

  const handleBlur = (field: string) => {
    markFieldTouched(field)
    validateForm({ currentPassword, newPassword, confirmPassword })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError('')

    // Client-side validation
    const validation = validateForm({ currentPassword, newPassword, confirmPassword })
    if (!validation.success) {
      markFieldTouched('currentPassword')
      markFieldTouched('newPassword')
      markFieldTouched('confirmPassword')
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()

      // Re-authenticate with current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userAuthEmail,
        password: currentPassword,
      })

      if (signInError) {
        setApiError(classifyAuthError(signInError, 'signIn'))
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        setApiError(classifyAuthError(updateError, 'updateUser'))
        return
      }

      // Sign out and hard redirect to login
      await supabase.auth.signOut()
      clearErrors()
      window.location.href = '/login?passwordUpdated=1'
    } catch {
      setApiError('Error de conexión. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" data-testid="change-password-form">
      {apiError && (
        <div
          className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
          data-testid="change-password-error"
        >
          {apiError}
        </div>
      )}

      <Input
        label="Contraseña actual"
        type={showPasswords ? 'text' : 'password'}
        placeholder="••••••••"
        value={currentPassword}
        onChange={(e) => {
          setCurrentPassword(e.target.value)
          if (apiError) setApiError('')
        }}
        onBlur={() => handleBlur('currentPassword')}
        error={getFieldError('currentPassword')}
        required
        autoComplete="current-password"
        data-testid="change-password-current"
      />

      <div>
        <Input
          label="Nueva contraseña"
          type={showPasswords ? 'text' : 'password'}
          placeholder="Mínimo 8 caracteres"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value)
            if (apiError) setApiError('')
          }}
          onBlur={() => handleBlur('newPassword')}
          error={getFieldError('newPassword')}
          required
          autoComplete="new-password"
          data-testid="change-password-new"
        />
        <PasswordStrength password={newPassword} className="mt-2" />
      </div>

      <Input
        label="Confirmar nueva contraseña"
        type={showPasswords ? 'text' : 'password'}
        placeholder="Repite tu nueva contraseña"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value)
          if (apiError) setApiError('')
        }}
        onBlur={() => handleBlur('confirmPassword')}
        error={getFieldError('confirmPassword')}
        required
        autoComplete="new-password"
        data-testid="change-password-confirm"
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-[13px] font-medium text-muted">
          <input
            type="checkbox"
            checked={showPasswords}
            onChange={(e) => setShowPasswords(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
          Mostrar contraseñas
        </label>
        <Link
          href="/forgot-password"
          className="text-[13px] font-semibold text-zinc-900 dark:text-white"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <Button
        type="submit"
        className="w-full h-11"
        isLoading={isLoading}
        data-testid="change-password-submit"
      >
        Cambiar contraseña
      </Button>
    </form>
  )
}
