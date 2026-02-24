'use client'

/**
 * Client Account Modal
 * CRITICAL COMPONENT: Post-booking signup prompt
 *
 * Security: Uses server-side claim token flow via /api/public/claim-account
 * to prevent IDOR attacks. The raw clientId is NEVER sent from the browser.
 * Instead, a one-time claim_token (generated server-side during booking)
 * proves ownership of the client record.
 *
 * Flow:
 * 1. Show modal after booking if business has loyalty program
 * 2. Pre-fill email if provided in booking form
 * 3. On signup → POST /api/public/claim-account with claim_token
 * 4. Server links client.user_id + creates loyalty status
 * 5. On dismiss → save preference (don't show for 30 days)
 */

import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Gift, Sparkles, Users, TrendingUp, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'

interface Props {
  isOpen: boolean
  onClose: () => void
  businessName: string
  businessId: string
  claimToken: string
  prefillEmail?: string
}

export function ClientAccountModal({
  isOpen,
  onClose,
  businessName,
  businessId,
  claimToken,
  prefillEmail = '',
}: Props) {
  const toast = useToast()
  const [email, setEmail] = useState(prefillEmail)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [mode, setMode] = useState<'signup' | 'login'>('signup')

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

    setIsSigningUp(true)

    try {
      const res = await fetch('/api/public/claim-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim_token: claimToken,
          email,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.code === 'EMAIL_EXISTS') {
          toast.error('Este email ya está registrado. Intenta iniciar sesión.')
          setMode('login')
        } else {
          toast.error(data.error || 'Error al crear cuenta')
        }
        return
      }

      toast.success('¡Cuenta creada! Tu próxima visita empezará a sumar puntos')

      if (typeof window !== 'undefined' && 'plausible' in window) {
        ;(window as any).plausible('Loyalty Account Created', {
          props: { business_id: businessId },
        })
      }

      onClose()
    } catch {
      toast.error('Error al crear cuenta. Intenta de nuevo.')
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

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('Login failed')
      }

      toast.success('¡Sesión iniciada! Ahora puedes acumular puntos')

      if (typeof window !== 'undefined' && 'plausible' in window) {
        ;(window as any).plausible('Loyalty Account Login', {
          props: { business_id: businessId },
        })
      }

      onClose()
    } catch {
      toast.error('Error al iniciar sesión. Verifica tus credenciales.')
    } finally {
      setIsSigningUp(false)
    }
  }

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      const dismissedUntil = Date.now() + 30 * 24 * 60 * 60 * 1000
      localStorage.setItem(`loyalty_modal_dismissed_${businessId}`, dismissedUntil.toString())
    }

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
          <DialogTitle className="mt-4 text-xl font-bold">¡Empieza a ganar puntos!</DialogTitle>
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
                  placeholder="Mínimo 8 caracteres"
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
