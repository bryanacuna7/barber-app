'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate form before submitting
    const validation = validateForm(formData)
    if (!validation.success) {
      setError('Por favor corrige los errores en el formulario')
      setIsLoading(false)
      // Mark all fields as touched to show errors
      Object.keys(formData).forEach((field) => markFieldTouched(field))
      return
    }

    const supabase = createClient()

    // 1. Create user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    })

    if (authError) {
      setError(
        authError.message === 'User already registered'
          ? 'Este correo ya está registrado'
          : 'Error al crear la cuenta. Intenta de nuevo.'
      )
      setIsLoading(false)
      return
    }

    if (!authData.user) {
      setError('Error al crear la cuenta')
      setIsLoading(false)
      return
    }

    // 2. Create business
    const slug = generateSlug(formData.businessName)

    const { data: businessData, error: businessError } = await supabase
      .from('businesses')
      .insert({
        owner_id: authData.user.id,
        name: formData.businessName,
        slug: slug,
      })
      .select()
      .single()

    if (businessError || !businessData) {
      setError('Error al crear el negocio. El nombre puede estar en uso.')
      setIsLoading(false)
      return
    }

    // 3. Track referral conversion if exists
    const referralCode = getReferralCode()
    if (referralCode) {
      const businessId = (businessData as { id: string }).id
      const tracked = await trackReferralConversion(referralCode, businessId)
      if (tracked) {
        clearReferralCode() // Clear cookie after successful tracking
      }
    }

    clearErrors()
    router.push('/dashboard')
    router.refresh()
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
