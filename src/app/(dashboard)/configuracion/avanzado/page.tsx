'use client'

import { useRouter } from 'next/navigation'
import { BellRing, Gift, LogOut, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { FadeInUp } from '@/components/ui/motion'
import { NotificationPreferencesSection } from '@/components/settings/notification-preferences-section'
import { PushNotificationToggle } from '@/components/settings/push-notification-toggle'
import { ComponentErrorBoundary } from '@/components/error-boundaries/ComponentErrorBoundary'
import { SettingsSubrouteHeader } from '@/components/settings/settings-subroute-header'
import { createClient } from '@/lib/supabase/client'

export default function AvanzadoPage() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <ComponentErrorBoundary
      fallbackTitle="Error en Configuración Avanzada"
      fallbackDescription="Ocurrió un error al cargar la página de configuración avanzada"
    >
      <div className="min-h-screen pb-24 lg:pb-6">
        {/* Header */}
        <FadeInUp>
          <SettingsSubrouteHeader
            title="Configuración Avanzada"
            subtitle="Notificaciones, lealtad y opciones avanzadas"
          />
        </FadeInUp>

        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Notification Preferences (self-contained component) */}
          <NotificationPreferencesSection />

          {/* Push Notifications */}
          <FadeInUp delay={0.05}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[17px]">
                  <BellRing className="h-5 w-5" />
                  Notificaciones Push
                </CardTitle>
                <CardDescription>Alertas instantáneas en tu dispositivo</CardDescription>
              </CardHeader>
              <CardContent>
                <PushNotificationToggle />
              </CardContent>
            </Card>
          </FadeInUp>

          {/* Loyalty Program */}
          <FadeInUp delay={0.1}>
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/50 dark:border-amber-900 dark:from-amber-950/30 dark:to-orange-950/20 overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[17px] text-amber-900 dark:text-amber-300">
                  <Gift className="h-5 w-5" />
                  Programa de Lealtad
                </CardTitle>
                <CardDescription className="text-amber-700/80 dark:text-amber-400/80">
                  Configura recompensas para tus clientes más fieles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => router.push('/lealtad/configuracion')}
                  className="w-full justify-between border-amber-200 bg-white/80 text-amber-900 hover:bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300 dark:hover:bg-amber-950/70"
                >
                  <span>Configurar programa de lealtad</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </FadeInUp>

          {/* Session / Logout */}
          <FadeInUp delay={0.15}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[17px]">
                  <LogOut className="h-5 w-5" />
                  Sesión
                </CardTitle>
                <CardDescription>Cierra sesión en este dispositivo</CardDescription>
              </CardHeader>
              <CardContent>
                <Button type="button" variant="outline" className="w-full" onClick={handleLogout}>
                  Cerrar sesión
                </Button>
              </CardContent>
            </Card>
          </FadeInUp>
        </div>
      </div>
    </ComponentErrorBoundary>
  )
}
