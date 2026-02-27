'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ChangePasswordForm } from '@/components/auth/change-password-form'
import { useClientContext } from '@/contexts/client-context'
import { ClientNotificationBell } from '@/components/client/client-notification-bell'

export default function ClientChangePasswordPage() {
  const { userAuthEmail, businessId } = useClientContext()

  return (
    <div className="px-4 pt-safe-offset-4 pt-12">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Link
            href="/mi-cuenta/perfil"
            className="flex items-center justify-center -ml-2 h-10 w-10 rounded-xl text-zinc-500 dark:text-zinc-400 ios-press"
            aria-label="Volver al perfil"
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Cambiar Contraseña</h1>
        </div>
        <ClientNotificationBell businessId={businessId} />
      </div>

      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 mb-6">
        <p className="text-sm text-muted mb-5">
          Ingresa tu contraseña actual y elige una nueva. Se cerrará tu sesión al completar.
        </p>
        {userAuthEmail ? (
          <ChangePasswordForm userAuthEmail={userAuthEmail} />
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
      </section>
    </div>
  )
}
