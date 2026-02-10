'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Palette, Scissors, Upload, X, ImageIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { FadeInUp } from '@/components/ui/motion'
import { ColorPicker } from '@/components/ui/color-picker'
import { cn } from '@/lib/utils'
import { generateThemeStyle, DEFAULT_BRAND_COLOR } from '@/lib/theme'
import { getContrastingTextColor } from '@/lib/utils/color'
import { useBusiness } from '@/contexts/business-context'
import { useBusinessSettings, useUpdateBusinessSettings } from '@/hooks/queries/useSettings'
import { ComponentErrorBoundary } from '@/components/error-boundaries/ComponentErrorBoundary'
import { QueryError } from '@/components/ui/query-error'
import { SettingsSubrouteHeader } from '@/components/settings/settings-subroute-header'

export default function BrandingPage() {
  const router = useRouter()
  const { businessId } = useBusiness()
  const toast = useToast()

  const { data: business, isLoading: loading, error, refetch } = useBusinessSettings(businessId)
  const updateSettings = useUpdateBusinessSettings()

  const [brandColor, setBrandColor] = useState(DEFAULT_BRAND_COLOR)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [businessName, setBusinessName] = useState('')

  // Sync from business data
  useEffect(() => {
    if (business) {
      setBrandColor(business.branding?.primaryColor || DEFAULT_BRAND_COLOR)
      setLogoUrl(business.branding?.logoUrl || null)
      setBusinessName(business.name || '')
    }
  }, [business])

  // Contrast colors for preview
  const contrastColor = useMemo(() => getContrastingTextColor(brandColor), [brandColor])

  // Save handler
  async function handleSave() {
    if (!businessId) {
      toast.error('No se encontró el ID del negocio')
      return
    }

    try {
      await updateSettings.mutateAsync({
        id: businessId,
        updates: {
          brand_primary_color: brandColor,
        },
      })

      toast.success('Marca actualizada correctamente')
      router.refresh()
    } catch (err) {
      console.error('Error saving branding:', err)
      toast.error('Error al guardar los cambios de marca')
    }
  }

  // Logo upload handler
  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLogoUploading(true)
    try {
      const formData = new FormData()
      formData.append('logo', file)

      const res = await fetch('/api/business/logo', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setLogoUrl(data.logo_url)
        toast.success('Logo subido correctamente')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Error al subir logo')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLogoUploading(false)
    }
  }

  // Logo delete handler
  async function handleLogoDelete() {
    try {
      const res = await fetch('/api/business/logo', { method: 'DELETE' })
      if (res.ok) {
        setLogoUrl(null)
        toast.info('Logo eliminado')
      }
    } catch {
      toast.error('Error al eliminar logo')
    }
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <QueryError error={error} onRetry={() => refetch()} title="Error al cargar branding" />
      </div>
    )
  }

  // Loading state
  if (loading || !business) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-8 w-8 rounded-full border-[3px] border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white"
        />
      </div>
    )
  }

  return (
    <ComponentErrorBoundary
      fallbackTitle="Error en Branding"
      fallbackDescription="Ocurrió un error al cargar la página de marca y estilo"
    >
      <div className="min-h-screen pb-24 lg:pb-6">
        {/* Header */}
        <FadeInUp>
          <SettingsSubrouteHeader
            title="Marca y Estilo"
            subtitle="Colores, logo y personalización visual"
          />
        </FadeInUp>

        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Brand Customization Card */}
          <FadeInUp delay={0.1}>
            <Card className="overflow-hidden">
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{
                  background: `linear-gradient(90deg, ${brandColor}, ${brandColor})`,
                }}
              />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[17px]">
                  <Palette className="h-5 w-5" />
                  Personaliza tu Marca
                </CardTitle>
                <CardDescription>Colores y logo que verán tus clientes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Color Picker */}
                <ColorPicker label="Color principal" value={brandColor} onChange={setBrandColor} />

                {/* Live Preview - Dual Mode */}
                <div>
                  <label className="mb-3 block text-[13px] font-semibold uppercase tracking-wide text-muted">
                    Vista previa
                  </label>
                  <div className="space-y-3">
                    {/* Light Mode Preview */}
                    <div>
                      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                        Modo claro
                      </div>
                      <div
                        className="rounded-2xl border-2 border-zinc-300 bg-white p-4"
                        style={generateThemeStyle(brandColor, null)}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          {logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={logoUrl}
                              alt="Logo"
                              className="h-10 w-10 rounded-xl object-cover"
                            />
                          ) : (
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-xl"
                              style={{ backgroundColor: brandColor }}
                            >
                              <Scissors className="h-5 w-5" style={{ color: contrastColor }} />
                            </div>
                          )}
                          <span className="font-semibold text-zinc-900">
                            {businessName || 'Tu Barbería'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span
                            className="inline-flex items-center rounded-full px-3 py-1.5 text-[13px] font-semibold shadow-lg"
                            style={{
                              backgroundColor: brandColor,
                              color: contrastColor,
                            }}
                          >
                            Reservar ahora
                          </span>
                          <span
                            className="inline-flex items-center rounded-full border-2 px-3 py-1.5 text-[13px] font-semibold text-zinc-900"
                            style={{ borderColor: brandColor }}
                          >
                            Ver servicios
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dark Mode Preview */}
                    <div>
                      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                        Modo oscuro
                      </div>
                      <div
                        className="rounded-2xl border-2 border-zinc-700 bg-zinc-950 p-4"
                        style={generateThemeStyle(brandColor, null)}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          {logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={logoUrl}
                              alt="Logo"
                              className="h-10 w-10 rounded-xl object-cover"
                            />
                          ) : (
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-xl"
                              style={{ backgroundColor: brandColor }}
                            >
                              <Scissors className="h-5 w-5" style={{ color: contrastColor }} />
                            </div>
                          )}
                          <span className="font-semibold text-white">
                            {businessName || 'Tu Barbería'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span
                            className="inline-flex items-center rounded-full px-3 py-1.5 text-[13px] font-semibold shadow-lg"
                            style={{
                              backgroundColor: brandColor,
                              color: contrastColor,
                            }}
                          >
                            Reservar ahora
                          </span>
                          <span
                            className="inline-flex items-center rounded-full border-2 px-3 py-1.5 text-[13px] font-semibold text-white"
                            style={{ borderColor: brandColor }}
                          >
                            Ver servicios
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="mb-3 block text-[13px] font-semibold uppercase tracking-wide text-muted">
                    Logo del negocio
                  </label>
                  {logoUrl ? (
                    <div className="flex items-center gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logoUrl}
                        alt="Logo"
                        className="h-20 w-20 rounded-2xl object-cover border-2 border-zinc-200 dark:border-zinc-700"
                      />
                      <div className="flex flex-col gap-2">
                        <label className="cursor-pointer rounded-xl bg-zinc-100 px-4 py-2.5 text-[13px] font-semibold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors text-center">
                          <Upload className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                          Cambiar
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={handleLogoDelete}
                          className="text-[13px]"
                        >
                          <X className="h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <label
                      className={cn(
                        'flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-6 py-8 transition-colors hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-zinc-600 dark:hover:bg-zinc-800',
                        logoUploading && 'opacity-60 pointer-events-none'
                      )}
                    >
                      {logoUploading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="h-8 w-8 rounded-full border-[3px] border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-zinc-400" />
                      )}
                      <div className="text-center">
                        <p className="text-[15px] font-medium text-zinc-700 dark:text-zinc-300">
                          {logoUploading ? 'Subiendo...' : 'Sube tu logo'}
                        </p>
                        <p className="mt-1 text-[13px] text-zinc-400">
                          PNG, JPG, WebP o SVG - Máximo 2MB
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={logoUploading}
                      />
                    </label>
                  )}
                </div>
              </CardContent>
            </Card>
          </FadeInUp>
        </div>

        {/* Sticky Save Button */}
        <div className="fixed bottom-20 lg:bottom-6 left-0 right-0 lg:left-64 px-4 lg:px-8 z-30">
          <div className="max-w-3xl mx-auto">
            <Button
              onClick={handleSave}
              isLoading={updateSettings.isPending}
              className="w-full h-12 text-[15px] font-semibold shadow-lg"
            >
              <Save className="h-5 w-5 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </div>
      </div>
    </ComponentErrorBoundary>
  )
}
