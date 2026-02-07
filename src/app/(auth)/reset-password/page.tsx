'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const exchangeSession = async () => {
      if (!code) {
        setIsSessionValid(false)
        setError('El enlace no es válido o expiró. Solicita uno nuevo.')
        return
      }
      const supabase = createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        setIsSessionValid(false)
        setError('El enlace no es válido o expiró. Solicita uno nuevo.')
        return
      }
      setIsSessionValid(true)
    }

    exchangeSession()
  }, [code])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (isSessionValid !== true) {
      setError('Necesitas un enlace válido para cambiar la contraseña.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setError('No pudimos actualizar la contraseña. Intenta de nuevo.')
        return
      }
      setMessage('Contraseña actualizada. Ya puedes iniciar sesión.')
      setTimeout(() => router.push('/login'), 1200)
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card data-testid="reset-password-card">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Nueva contraseña</CardTitle>
        <CardDescription>Crea una contraseña segura para tu cuenta.</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} data-testid="reset-password-form">
        <CardContent className="space-y-4">
          {error && (
            <div
              className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
              data-testid="reset-password-error"
            >
              {error}
            </div>
          )}
          {message && (
            <div
              className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
              data-testid="reset-password-success"
            >
              {message}
            </div>
          )}

          {isSessionValid === false && (
            <div
              className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
              data-testid="reset-password-invalid-token"
            >
              Solicita un nuevo enlace de recuperación para continuar.
            </div>
          )}

          <Input
            label="Nueva contraseña"
            type={showPasswords ? 'text' : 'password'}
            name="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            disabled={isSessionValid !== true}
            data-testid="reset-password-new-password"
          />

          <Input
            label="Confirmar contraseña"
            type={showPasswords ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Repite tu contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            disabled={isSessionValid !== true}
            data-testid="reset-password-confirm-password"
          />

          <label className="flex items-center gap-2 text-[13px] font-medium text-muted">
            <input
              type="checkbox"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              disabled={isSessionValid !== true}
              data-testid="reset-password-show-passwords"
            />
            Mostrar contraseñas
          </label>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isSessionValid !== true}
            data-testid="reset-password-submit"
          >
            Guardar contraseña
          </Button>

          <p className="text-center text-sm text-zinc-500">
            <Link
              href="/forgot-password"
              className="text-zinc-900 underline dark:text-white"
              data-testid="request-new-link"
            >
              Solicitar nuevo enlace
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

function ResetPasswordSkeleton() {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="h-8 w-40 mx-auto skeleton rounded" />
        <div className="h-4 w-56 mx-auto mt-2 skeleton rounded" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-32 skeleton rounded" />
          <div className="h-10 w-full skeleton rounded-lg" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-40 skeleton rounded" />
          <div className="h-10 w-full skeleton rounded-lg" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="h-10 w-full skeleton rounded-lg" />
        <div className="h-4 w-48 mx-auto skeleton rounded" />
      </CardFooter>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordSkeleton />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
