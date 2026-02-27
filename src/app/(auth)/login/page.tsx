'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { useFormValidation } from '@/hooks/use-form-validation'
import { loginSchema } from '@/lib/validations/auth'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const explicitRedirect = searchParams.get('redirect')
  const passwordUpdated = searchParams.get('passwordUpdated')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPwBanner, setShowPwBanner] = useState(Boolean(passwordUpdated))

  // Clean URL once without triggering navigation
  useEffect(() => {
    if (passwordUpdated) {
      window.history.replaceState({}, '', '/login')
    }
  }, [passwordUpdated])

  const { getFieldError, markFieldTouched, validateForm, clearErrors } =
    useFormValidation(loginSchema)

  const handleBlur = (field: string) => {
    markFieldTouched(field)
    validateForm({ email, password })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate form
    const validation = validateForm({ email, password })
    if (!validation.success) {
      setError('Por favor corrige los errores')
      setIsLoading(false)
      markFieldTouched('email')
      markFieldTouched('password')
      return
    }

    const supabase = createClient()

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('Credenciales incorrectas. Intenta de nuevo.')
      setIsLoading(false)
      return
    }

    clearErrors()

    // Validate redirect: internal path, no protocol-relative, no auth loop
    const safeRedirect =
      explicitRedirect &&
      explicitRedirect.startsWith('/') &&
      !explicitRedirect.startsWith('//') &&
      !explicitRedirect.startsWith('/login') &&
      !explicitRedirect.startsWith('/register')
        ? explicitRedirect
        : null

    if (safeRedirect) {
      router.push(safeRedirect)
    } else {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const { detectUserRole } = await import('@/lib/auth/roles')
          const roleInfo = await detectUserRole(supabase, user.id)
          router.push(roleInfo?.role === 'client' ? '/mi-cuenta' : '/dashboard')
        } else {
          router.push('/dashboard')
        }
      } catch {
        router.push('/dashboard')
      }
    }
    router.refresh()
  }

  return (
    <Card data-testid="login-card">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
        <CardDescription>Ingresa a tu cuenta de BarberApp</CardDescription>
      </CardHeader>

      <form onSubmit={handleLogin} data-testid="login-form">
        <CardContent className="space-y-4">
          {showPwBanner && (
            <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
              Contraseña actualizada. Inicia sesión nuevamente.
            </div>
          )}

          {error && (
            <div
              className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
              data-testid="login-error"
            >
              {error}
            </div>
          )}

          <Input
            label="Correo electrónico"
            type="email"
            name="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError('')
              if (showPwBanner) setShowPwBanner(false)
            }}
            onBlur={() => handleBlur('email')}
            error={getFieldError('email')}
            success={email && !getFieldError('email') ? 'Correo válido' : undefined}
            required
            autoComplete="email"
            data-testid="login-email"
          />

          <Input
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (error) setError('')
              if (showPwBanner) setShowPwBanner(false)
            }}
            onBlur={() => handleBlur('password')}
            error={getFieldError('password')}
            required
            autoComplete="current-password"
            data-testid="login-password"
          />
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
            <label className="flex items-center gap-2 font-medium">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                data-testid="login-show-password"
              />
              Mostrar contraseña
            </label>
            <Link
              href="/forgot-password"
              className="ml-auto whitespace-nowrap font-semibold text-zinc-900 dark:text-white"
              data-testid="forgot-password-link"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" isLoading={isLoading} data-testid="login-submit">
            Iniciar Sesión
          </Button>

          <p className="text-center text-sm text-zinc-500">
            ¿No tienes cuenta?{' '}
            <Link
              href="/register"
              className="text-zinc-900 underline dark:text-white"
              data-testid="register-link"
            >
              Regístrate
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

function LoginFormSkeleton() {
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
          <div className="h-4 w-24 skeleton rounded" />
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

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginForm />
    </Suspense>
  )
}
