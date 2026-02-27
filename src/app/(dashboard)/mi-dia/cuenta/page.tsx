'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { FadeInUp } from '@/components/ui/motion'
import { ChangePasswordForm } from '@/components/auth/change-password-form'
import { useBusiness } from '@/contexts/business-context'
import { cn } from '@/lib/utils'

export default function BarberAccountPage() {
  const { userEmail } = useBusiness()

  return (
    <div className="min-h-screen pb-24 lg:pb-6">
      <FadeInUp>
        <div className="mb-6">
          <Link
            href="/mi-dia"
            className={cn(
              'mb-3 inline-flex h-8 items-center gap-1.5 rounded-lg border px-2 text-sm font-medium transition-colors',
              'border-zinc-200/70 bg-white/70 text-zinc-700 hover:bg-white',
              'dark:border-zinc-700/80 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:bg-zinc-800'
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            Mi Día
          </Link>
          <h1 className="app-page-title">Cuenta y Seguridad</h1>
          <p className="app-page-subtitle mt-1 lg:hidden">Cambia tu contraseña</p>
        </div>
      </FadeInUp>

      <div className="max-w-lg mx-auto">
        <FadeInUp delay={0.05}>
          <Card>
            <CardHeader>
              <CardTitle className="text-[17px]">Cambiar contraseña</CardTitle>
              <CardDescription>
                Ingresa tu contraseña actual y elige una nueva. Se cerrará tu sesión al completar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userEmail ? (
                <ChangePasswordForm userAuthEmail={userEmail} />
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted mb-3">
                    No se pudo obtener tu correo de cuenta. Usa recuperación por correo.
                  </p>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-zinc-900 underline dark:text-white"
                  >
                    Recuperar contraseña
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeInUp>
      </div>
    </div>
  )
}
