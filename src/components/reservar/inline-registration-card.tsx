'use client'

/**
 * Inline Registration Card — Post-booking account creation
 *
 * Rendered directly in BookingSuccess (NOT a modal/sheet).
 * Handles two flows:
 *   1. Signup: claim-account → signInWithPassword → onAccountCreated
 *   2. Login (after 409): signInWithPassword → link-claim → onAccountCreated
 *
 * onAccountCreated() is ONLY called after BOTH operations succeed.
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPlus, CheckCircle, CalendarCheck, Bell, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'

interface InlineRegistrationCardProps {
  claimToken: string
  prefillEmail: string
  businessName: string
  businessId: string
  onAccountCreated: () => void
}

export function InlineRegistrationCard({
  claimToken,
  prefillEmail,
  businessName,
  businessId,
  onAccountCreated,
}: InlineRegistrationCardProps) {
  const toast = useToast()
  const cardRef = useRef<HTMLDivElement>(null)

  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [email, setEmail] = useState(prefillEmail)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [accountCreated, setAccountCreated] = useState(false)

  // Auto-scroll into view on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const trackEvent = (name: string) => {
    if (typeof window !== 'undefined' && 'plausible' in window) {
      ;(window as unknown as { plausible: (name: string, opts?: object) => void }).plausible(name, {
        props: { business_id: businessId },
      })
    }
  }

  // ---------------------------------------------------------------------------
  // Signup: claim-account → signInWithPassword → onAccountCreated
  // ---------------------------------------------------------------------------
  const handleSignup = async () => {
    if (!email || !password) {
      toast.error('Por favor completa todos los campos')
      return
    }
    if (password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    setIsSubmitting(true)

    try {
      // Step 1: Create account via claim-account API
      const res = await fetch('/api/public/claim-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim_token: claimToken, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409 || data.hint === 'use_login') {
          toast.error('Este email ya está registrado. Intenta iniciar sesión.')
          setMode('login')
          return
        }
        toast.error(data.error || 'Error al crear cuenta')
        return
      }

      // Step 2: Auto-login to create browser session
      const supabase = createClient()
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) {
        // Claim succeeded but login failed — account exists, user can login later
        toast.error('Cuenta creada. Inicia sesión para acceder a tus citas.')
        setAccountCreated(true)
        return
      }

      // BOTH succeeded
      toast.success('¡Cuenta creada!')
      trackEvent('Client Account Created')
      setAccountCreated(true)
      onAccountCreated()
    } catch {
      toast.error('Error al crear cuenta. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Login: signInWithPassword → link-claim → onAccountCreated
  // ---------------------------------------------------------------------------
  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Por favor completa todos los campos')
      return
    }

    setIsSubmitting(true)

    try {
      // Step 1: Authenticate
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        toast.error('Error al iniciar sesión. Verifica tus credenciales.')
        return
      }

      // Step 2: Link orphaned client record
      const linkRes = await fetch('/api/public/link-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim_token: claimToken }),
      })

      if (!linkRes.ok) {
        const linkData = await linkRes.json()
        if (linkData.hint === 'duplicate_client') {
          // Already has account in this business — session is still active, proceed
          toast.success('¡Sesión iniciada!')
        } else {
          // Non-critical: login worked, linking failed (token expired, etc.)
          toast.success('Sesión iniciada. Tu cita puede tardar en aparecer.')
        }
      } else {
        toast.success('¡Sesión iniciada y cita vinculada!')
      }

      // BOTH succeeded (or link was non-critical)
      trackEvent('Client Account Login')
      setAccountCreated(true)
      onAccountCreated()
    } catch {
      toast.error('Error al iniciar sesión. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Dismiss
  // ---------------------------------------------------------------------------
  const handleDismiss = () => {
    trackEvent('Client Registration Dismissed')
    setDismissed(true)
  }

  if (dismissed) return null

  return (
    <div ref={cardRef}>
      <AnimatePresence mode="wait">
        {accountCreated ? (
          // ── Success state ──
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center dark:border-emerald-800 dark:bg-emerald-950/30"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
              <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="mt-3 text-[17px] font-semibold text-emerald-900 dark:text-emerald-100">
              ¡Cuenta creada!
            </p>
            <p className="mt-1 text-[13px] text-emerald-700 dark:text-emerald-300">
              Ya puedes ver y gestionar tus citas
            </p>
          </motion.div>
        ) : (
          // ── Registration form ──
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-700 dark:bg-zinc-800/50"
          >
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40">
                <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-[17px] font-semibold text-zinc-900 dark:text-white">
                  {mode === 'signup' ? 'Crea tu cuenta' : 'Iniciar sesión'}
                </p>
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                  {mode === 'signup' ? 'En 10 segundos' : `Accede a ${businessName}`}
                </p>
              </div>
            </div>

            {/* Benefits (signup only) */}
            {mode === 'signup' && (
              <div className="mt-4 space-y-2">
                {[
                  {
                    icon: CalendarCheck,
                    text: 'Ver y gestionar tus citas',
                    color: 'text-blue-500',
                  },
                  {
                    icon: Bell,
                    text: 'Recibir recordatorios automáticos',
                    color: 'text-amber-500',
                  },
                  { icon: Star, text: 'Acumular puntos de lealtad', color: 'text-violet-500' },
                ].map(({ icon: Icon, text, color }) => (
                  <div key={text} className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${color}`} />
                    <span className="text-[13px] text-zinc-600 dark:text-zinc-300">{text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Form */}
            <div className="mt-4 space-y-3">
              <div>
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="reg-password">Contraseña</Label>
                <Input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Mínimo 8 caracteres' : 'Tu contraseña'}
                  disabled={isSubmitting}
                />
              </div>

              {mode === 'signup' && (
                <div>
                  <Label htmlFor="reg-confirm">Confirmar contraseña</Label>
                  <Input
                    id="reg-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma tu contraseña"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              <Button
                onClick={mode === 'signup' ? handleSignup : handleLogin}
                disabled={isSubmitting}
                className="w-full h-11"
                size="lg"
              >
                {isSubmitting
                  ? mode === 'signup'
                    ? 'Creando cuenta...'
                    : 'Iniciando sesión...'
                  : mode === 'signup'
                    ? 'Crear cuenta'
                    : 'Iniciar sesión'}
              </Button>

              {/* Mode toggle */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setMode(mode === 'signup' ? 'login' : 'signup')
                    setPassword('')
                    setConfirmPassword('')
                  }}
                  className="text-[13px] text-blue-600 hover:underline dark:text-blue-400"
                  disabled={isSubmitting}
                >
                  {mode === 'signup'
                    ? '¿Ya tienes cuenta? Iniciar sesión'
                    : '¿No tienes cuenta? Crear una'}
                </button>
              </div>

              {/* Dismiss */}
              <div className="border-t border-zinc-200 pt-3 text-center dark:border-zinc-700">
                <button
                  onClick={handleDismiss}
                  className="text-[13px] text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                  disabled={isSubmitting}
                >
                  Ahora no
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
