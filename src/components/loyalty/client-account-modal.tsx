'use client'

/**
 * Client Account Modal
 * CRITICAL COMPONENT: Post-booking signup prompt
 *
 * Triggers when:
 * - Client completes booking successfully
 * - Business has loyalty program active
 * - Client does NOT have account (clients.user_id IS NULL)
 *
 * Purpose:
 * - Incentivize account creation with loyalty benefits
 * - Quick signup flow (email + password)
 * - Link client record to auth.users
 *
 * Flow:
 * 1. Show modal immediately after booking confirmation
 * 2. Pre-fill email if provided in booking form
 * 3. On signup success → link client.user_id → create loyalty_status
 * 4. On dismiss → save preference (don't show for 30 days)
 */

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Gift, Sparkles, Users, TrendingUp, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Props {
  isOpen: boolean
  onClose: () => void
  businessName: string
  businessId: string
  clientId: string
  prefillEmail?: string
}

export function ClientAccountModal({
  isOpen,
  onClose,
  businessName,
  businessId,
  clientId,
  prefillEmail = '',
}: Props) {
  const [email, setEmail] = useState(prefillEmail)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [mode, setMode] = useState<'signup' | 'login'>('signup')

  const handleSignup = async () => {
    // Validation
    if (!email || !password) {
      toast.error('Por favor completa todos los campos')
      return
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    setIsSigningUp(true)

    try {
      const supabase = createClient()

      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            signup_source: 'loyalty_prompt',
            business_id: businessId,
          },
        },
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('Failed to create user')
      }

      // Link client record to user
      const { error: linkError } = await supabase
        .from('clients')
        .update({ user_id: authData.user.id })
        .eq('id', clientId)

      if (linkError) {
        console.error('Failed to link client to user:', linkError)
        // Don't throw - account is created, just log error
      }

      // Create initial loyalty status (with 0 points - next visit will start accumulating)
      const { error: loyaltyError } = await supabase.from('client_loyalty_status').insert({
        client_id: clientId,
        business_id: businessId,
        user_id: authData.user.id,
        points_balance: 0,
        lifetime_points: 0,
        visit_count: 0,
      })

      if (loyaltyError) {
        console.error('Failed to create loyalty status:', loyaltyError)
      }

      toast.success('¡Cuenta creada! 🎉 Tu próxima visita empezará a sumar puntos')

      // Track analytics
      if (typeof window !== 'undefined' && 'plausible' in window) {
        ;(window as any).plausible('Loyalty Account Created', {
          props: { business_id: businessId },
        })
      }

      onClose()
    } catch (error: any) {
      console.error('Signup error:', error)

      if (error.message?.includes('already registered')) {
        toast.error('Este email ya está registrado. Intenta iniciar sesión.')
        setMode('login')
      } else {
        toast.error('Error al crear cuenta. Intenta de nuevo.')
      }
    } finally {
      setIsSigningUp(false)
    }
  }

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Por favor completa todos los campos')
      return
    }

    setIsSigningUp(true)

    try {
      const supabase = createClient()

      // Sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('Login failed')
      }

      // Link client record to existing user
      const { error: linkError } = await supabase
        .from('clients')
        .update({ user_id: authData.user.id })
        .eq('id', clientId)

      if (linkError) {
        console.error('Failed to link client to user:', linkError)
      }

      // Create loyalty status if doesn't exist
      const { error: loyaltyError } = await supabase
        .from('client_loyalty_status')
        .insert({
          client_id: clientId,
          business_id: businessId,
          user_id: authData.user.id,
          points_balance: 0,
          lifetime_points: 0,
          visit_count: 0,
        })
        .onConflict('client_id')
        .ignore()

      if (loyaltyError) {
        console.error('Failed to create loyalty status:', loyaltyError)
      }

      toast.success('¡Sesión iniciada! Ahora puedes acumular puntos 🎉')

      onClose()
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error('Error al iniciar sesión. Verifica tus credenciales.')
    } finally {
      setIsSigningUp(false)
    }
  }

  const handleDismiss = () => {
    // Save preference to not show again for 30 days
    if (typeof window !== 'undefined') {
      const dismissedUntil = Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
      localStorage.setItem(`loyalty_modal_dismissed_${businessId}`, dismissedUntil.toString())
    }

    // Track analytics
    if (typeof window !== 'undefined' && 'plausible' in window) {
      ;(window as any).plausible('Loyalty Prompt Dismissed', {
        props: { business_id: businessId },
      })
    }

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDismiss}>
      <DialogContent className="max-w-md">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Cerrar</span>
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
            <Gift className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mt-4 text-xl font-bold">¡Empieza a ganar puntos!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{businessName}</span> tiene programa de
            recompensas
          </p>
        </div>

        {/* Benefits */}
        <div className="my-6 space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2">
              <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Acumula puntos</p>
              <p className="text-xs text-muted-foreground">En cada visita a {businessName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <Gift className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Canjea por servicios</p>
              <p className="text-xs text-muted-foreground">Descuentos y servicios gratis</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Refiere amigos</p>
              <p className="text-xs text-muted-foreground">Gana recompensas por cada referido</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Ofertas exclusivas</p>
              <p className="text-xs text-muted-foreground">Notificaciones de promociones</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {mode === 'signup' ? (
            <>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  disabled={isSigningUp}
                />
              </div>

              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  disabled={isSigningUp}
                />
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu contraseña"
                  disabled={isSigningUp}
                />
              </div>

              <Button onClick={handleSignup} disabled={isSigningUp} className="w-full" size="lg">
                {isSigningUp ? (
                  <>Creando cuenta...</>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Crear Cuenta y Ganar
                  </>
                )}
              </Button>

              <div className="text-center">
                <button
                  onClick={() => setMode('login')}
                  className="text-sm text-primary hover:underline"
                  disabled={isSigningUp}
                >
                  ¿Ya tienes cuenta? Iniciar sesión
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  disabled={isSigningUp}
                />
              </div>

              <div>
                <Label htmlFor="login-password">Contraseña</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  disabled={isSigningUp}
                />
              </div>

              <Button onClick={handleLogin} disabled={isSigningUp} className="w-full" size="lg">
                {isSigningUp ? <>Iniciando sesión...</> : <>Iniciar Sesión</>}
              </Button>

              <div className="text-center">
                <button
                  onClick={() => setMode('signup')}
                  className="text-sm text-primary hover:underline"
                  disabled={isSigningUp}
                >
                  ¿No tienes cuenta? Crear una
                </button>
              </div>
            </>
          )}
        </div>

        {/* Dismiss option */}
        <div className="border-t border-border/50 pt-4 text-center">
          <button
            onClick={handleDismiss}
            className="text-sm text-muted-foreground hover:text-foreground"
            disabled={isSigningUp}
          >
            Ahora no, gracias
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
