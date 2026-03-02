'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, UserRound } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { FadeInUp } from '@/components/ui/motion'
import { ChangePasswordForm } from '@/components/auth/change-password-form'
import { useBusiness } from '@/contexts/business-context'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export default function BarberAccountPage() {
  const { userEmail, barberId } = useBusiness()
  const toast = useToast()
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState('')
  const [initialPhotoUrl, setInitialPhotoUrl] = useState('')
  const [photoSaving, setPhotoSaving] = useState(false)

  useEffect(() => {
    async function loadBarberProfile() {
      if (!barberId) {
        setProfileError('No encontramos tu perfil de miembro del equipo.')
        setProfileLoading(false)
        return
      }

      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('barbers')
          .select('photo_url')
          .eq('id', barberId)
          .maybeSingle()

        if (error || !data) {
          setProfileError('No se pudo cargar tu foto de perfil.')
          return
        }

        const currentPhoto = (data.photo_url || '').trim()
        setPhotoUrl(currentPhoto)
        setInitialPhotoUrl(currentPhoto)
      } catch {
        setProfileError('No se pudo cargar tu foto de perfil.')
      } finally {
        setProfileLoading(false)
      }
    }

    void loadBarberProfile()
  }, [barberId])

  const normalizedPhotoUrl = photoUrl.trim()
  const canSavePhoto =
    !profileLoading &&
    !photoSaving &&
    !profileError &&
    normalizedPhotoUrl !== initialPhotoUrl &&
    !!barberId

  const handleSavePhoto = async () => {
    if (!barberId) return

    if (normalizedPhotoUrl) {
      try {
        new URL(normalizedPhotoUrl)
      } catch {
        toast.error('Ingresa una URL válida para la foto.')
        return
      }
    }

    setPhotoSaving(true)
    try {
      const response = await fetch(`/api/barbers/${barberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo_url: normalizedPhotoUrl || null }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error || 'No se pudo guardar la foto')
      }

      setInitialPhotoUrl(normalizedPhotoUrl)
      setPhotoUrl(normalizedPhotoUrl)
      toast.success(
        normalizedPhotoUrl ? 'Foto de perfil actualizada.' : 'Foto de perfil eliminada.'
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar la foto'
      toast.error(message)
    } finally {
      setPhotoSaving(false)
    }
  }

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
          <p className="app-page-subtitle mt-1 lg:hidden">Foto de perfil y contraseña</p>
        </div>
      </FadeInUp>

      <div className="max-w-lg mx-auto">
        <FadeInUp delay={0.05}>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-[17px]">Foto de perfil</CardTitle>
              <CardDescription>
                Esta foto se muestra en tu perfil público al reservar citas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  {normalizedPhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={normalizedPhotoUrl}
                      alt="Foto de perfil"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound className="h-7 w-7 text-zinc-500 dark:text-zinc-400" />
                  )}
                </div>
                <div className="text-sm text-muted">
                  {profileLoading
                    ? 'Cargando foto...'
                    : profileError
                      ? profileError
                      : 'Pega la URL de tu foto y guarda cambios.'}
                </div>
              </div>

              <Input
                type="url"
                label="URL de foto"
                placeholder="https://..."
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                disabled={profileLoading || photoSaving || !barberId}
              />

              <div className="flex justify-end">
                <Button
                  onClick={handleSavePhoto}
                  disabled={!canSavePhoto}
                  isLoading={photoSaving}
                  className="h-11"
                >
                  Guardar foto
                </Button>
              </div>
            </CardContent>
          </Card>
        </FadeInUp>

        <FadeInUp delay={0.1}>
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
