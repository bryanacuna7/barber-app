'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}
import { Input } from '@/components/ui/input'
import { PasswordStrength } from '@/components/ui/password-strength'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { useFormValidation } from '@/hooks/use-form-validation'
import { registerSchema } from '@/lib/validations/auth'
import { ReferrerBanner } from '@/components/referrals/referrer-banner'
import {
  saveReferralCode,
  getReferralCode,
  clearReferralCode,
  trackReferralConversion,
} from '@/lib/referrals'

const REGISTER_CARD_STABLE_HEIGHT = 'min-h-[760px]'
const REGISTER_REQUEST_TIMEOUT_MS = 15000
const AUTO_SIGNIN_TIMEOUT_MS = 12000

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage))
    }, timeoutMs)
  })

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId)
  })
}

function RegisterForm({
  referrerInfo,
}: {
  referrerInfo: { businessName: string; businessSlug?: string } | null
}) {
  const router = useRouter()

  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const { getFieldError, markFieldTouched, validateForm, clearErrors } =
    useFormValidation(registerSchema)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear server error when user types
    if (error) setError('')
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    markFieldTouched(e.target.name)
    validateForm(formData)
  }

  const [successMessage, setSuccessMessage] = useState('')

  const handleGoogleSignUp = () => {
    setIsGoogleLoading(true)
    window.location.href = '/api/auth/google/initiate'
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccessMessage('')

    // Validate form before submitting
    const validation = validateForm(formData)
    if (!validation.success) {
      setError('Por favor corrige los errores en el formulario')
      setIsLoading(false)
      Object.keys(formData).forEach((field) => markFieldTouched(field))
      return
    }

    let didNavigate = false
    let accountCreated = false

    try {
      const res = await withTimeout(
        fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            businessName: formData.businessName,
          }),
        }),
        REGISTER_REQUEST_TIMEOUT_MS,
        'El registro tardó demasiado. Intenta de nuevo.'
      )

      let data: {
        success?: boolean
        canSignIn?: boolean
        error?: string
        businessId?: string | null
      } = {}
      try {
        data = await res.json()
      } catch {
        data = {}
      }

      if (!res.ok) {
        setError(data.error || 'Error al crear la cuenta. Intenta de nuevo.')
        return
      }

      accountCreated = Boolean(data.success)

      // Track referral conversion if exists
      if (data.success) {
        const referralCode = getReferralCode()
        if (referralCode) {
          const referredBusinessId =
            typeof data.businessId === 'string' && data.businessId.trim().length > 0
              ? data.businessId
              : ''

          if (referredBusinessId) {
            void trackReferralConversion(referralCode, referredBusinessId).finally(() => {
              clearReferralCode()
            })
          } else {
            clearReferralCode()
          }
        }
      }

      // Auto sign-in after successful registration
      if (data.canSignIn) {
        const supabase = createClient()
        const { error: signInError } = await withTimeout(
          supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          }),
          AUTO_SIGNIN_TIMEOUT_MS,
          'No se pudo iniciar sesión automáticamente a tiempo.'
        )

        if (signInError) {
          setSuccessMessage('Cuenta creada. Inicia sesión con tu correo y contraseña.')
          return
        }

        clearErrors()
        didNavigate = true
        router.push('/dashboard')
        router.refresh()
        return
      }

      clearErrors()
      didNavigate = true
      router.push('/dashboard')
      router.refresh()
    } catch {
      if (accountCreated) {
        setSuccessMessage('Cuenta creada. Inicia sesión con tu correo y contraseña.')
        setError('')
      } else {
        setError('Error de conexión o tiempo de espera. Intenta de nuevo.')
      }
    } finally {
      if (!didNavigate) {
        setIsLoading(false)
      }
    }
  }

  return (
    <Card className={REGISTER_CARD_STABLE_HEIGHT} data-testid="register-card">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
        <CardDescription>Registra tu barbería en BarberApp</CardDescription>
      </CardHeader>

      <form onSubmit={handleRegister} data-testid="register-form">
        <CardContent className="space-y-4">
          <div className="min-h-[128px]">
            {/* Referrer Banner */}
            {referrerInfo && (
              <ReferrerBanner
                businessName={referrerInfo.businessName}
                businessSlug={referrerInfo.businessSlug}
              />
            )}
          </div>

          <div className="min-h-[44px]">
            {error && (
              <div
                className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
                data-testid="register-error"
              >
                {error}
              </div>
            )}
            {successMessage && (
              <div
                className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400"
                data-testid="register-success"
              >
                {successMessage}
              </div>
            )}
          </div>

          <Input
            label="Nombre de tu barbería"
            type="text"
            name="businessName"
            placeholder="Barbería El Patrón"
            value={formData.businessName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={getFieldError('businessName')}
            success={
              formData.businessName && !getFieldError('businessName') ? 'Nombre válido' : undefined
            }
            required
            data-testid="register-business-name"
          />

          <Input
            label="Correo electrónico"
            type="email"
            name="email"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={getFieldError('email')}
            success={formData.email && !getFieldError('email') ? 'Correo válido' : undefined}
            required
            autoComplete="email"
            data-testid="register-email"
          />

          <div className="space-y-2">
            <Input
              label="Contraseña"
              type={showPasswords ? 'text' : 'password'}
              name="password"
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={getFieldError('password')}
              required
              autoComplete="new-password"
              data-testid="register-password"
            />
            <div className="min-h-[30px]">
              {formData.password && <PasswordStrength password={formData.password} />}
            </div>
          </div>

          <Input
            label="Confirmar contraseña"
            type={showPasswords ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Repite tu contraseña"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={getFieldError('confirmPassword')}
            success={
              formData.confirmPassword &&
              formData.password === formData.confirmPassword &&
              !getFieldError('confirmPassword')
                ? 'Las contraseñas coinciden'
                : undefined
            }
            required
            autoComplete="new-password"
            data-testid="register-confirm-password"
          />

          <label className="flex items-center gap-2 text-[13px] font-medium text-muted">
            <input
              type="checkbox"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              data-testid="register-show-passwords"
            />
            Mostrar contraseñas
          </label>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            data-testid="register-submit"
          >
            Crear Cuenta
          </Button>

          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-200 dark:border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500">
                o
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignUp}
            isLoading={isGoogleLoading}
            data-testid="google-signup"
          >
            <GoogleIcon className="h-5 w-5 mr-2" />
            Continuar con Google
          </Button>

          <p className="text-center text-sm text-zinc-500">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/login"
              className="text-zinc-900 underline dark:text-white"
              data-testid="login-link"
            >
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

export default function RegisterPage() {
  return <RegisterPageContent />
}

function RegisterPageContent() {
  const [referrerInfo, setReferrerInfo] = useState<{
    businessName: string
    businessSlug?: string
  } | null>(null)

  useEffect(() => {
    const refCode = new URLSearchParams(window.location.search).get('ref')
    if (!refCode) return

    saveReferralCode(refCode)

    const fetchReferrerInfo = async () => {
      try {
        const response = await fetch(`/api/referrals/info?code=${refCode}`)
        if (!response.ok) return

        const data = await response.json()
        if (!data.isValid) return

        setReferrerInfo({
          businessName: data.businessName,
          businessSlug: data.businessSlug,
        })
      } catch (error) {
        console.error('Error fetching referrer info:', error)
      }
    }

    fetchReferrerInfo()
  }, [])

  return (
    <>
      <RegisterForm referrerInfo={referrerInfo} />
    </>
  )
}
