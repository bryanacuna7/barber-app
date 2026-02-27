'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { FadeInUp } from '@/components/ui/motion'
import { ComponentErrorBoundary } from '@/components/error-boundaries/ComponentErrorBoundary'
import { SettingsSubrouteHeader } from '@/components/settings/settings-subroute-header'
import { ChangePasswordForm } from '@/components/auth/change-password-form'
import { useBusiness } from '@/contexts/business-context'

export default function OwnerChangePasswordPage() {
  const { userEmail } = useBusiness()

  return (
    <ComponentErrorBoundary
      fallbackTitle="Error"
      fallbackDescription="Ocurrió un error al cargar la página"
    >
      <div className="min-h-screen pb-24 lg:pb-6">
        <FadeInUp>
          <SettingsSubrouteHeader
            title="Cambiar Contraseña"
            subtitle="Actualiza la contraseña de tu cuenta"
            backHref="/configuracion/avanzado"
            backLabel="Avanzado"
          />
        </FadeInUp>

        <div className="max-w-lg mx-auto">
          <FadeInUp delay={0.05}>
            <Card>
              <CardHeader>
                <CardTitle className="text-[17px]">Nueva contraseña</CardTitle>
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
    </ComponentErrorBoundary>
  )
}
