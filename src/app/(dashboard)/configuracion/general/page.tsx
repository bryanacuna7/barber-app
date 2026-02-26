'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Building2, Globe } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { FadeInUp } from '@/components/ui/motion'
import { useBusiness } from '@/contexts/business-context'
import { useBusinessSettings, useUpdateBusinessSettings } from '@/hooks/queries/useSettings'
import { ComponentErrorBoundary } from '@/components/error-boundaries/ComponentErrorBoundary'
import { QueryError } from '@/components/ui/query-error'
import { SettingsSubrouteHeader } from '@/components/settings/settings-subroute-header'
import { ShareBookingLink } from '@/components/share/share-booking-link'
import { bookingPath } from '@/lib/utils/booking-url'

export default function GeneralSettingsPage() {
  const router = useRouter()
  const { businessId } = useBusiness()
  const toast = useToast()

  const { data: business, isLoading: loading, error, refetch } = useBusinessSettings(businessId)
  const updateSettings = useUpdateBusinessSettings()

  const [formEdits, setFormEdits] = useState<Record<string, string>>({})

  // Derive form data: React Query as source of truth, overlaid with local edits
  const formData = useMemo(
    () => ({
      name: formEdits.name ?? business?.name ?? '',
      phone: formEdits.phone ?? business?.phone ?? '',
      whatsapp: formEdits.whatsapp ?? business?.whatsapp ?? '',
      address: formEdits.address ?? business?.address ?? '',
    }),
    [business, formEdits]
  )

  async function handleSave() {
    if (!businessId) return
    try {
      await updateSettings.mutateAsync({
        id: businessId,
        updates: {
          name: formData.name,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          address: formData.address,
        },
      })
      toast.success('Información guardada correctamente')
      router.refresh()
    } catch {
      toast.error('Error al guardar')
    }
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <QueryError error={error} onRetry={() => refetch()} title="Error al cargar configuración" />
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
      fallbackTitle="Error en Información General"
      fallbackDescription="Ocurrió un error al cargar la página de información general"
    >
      <div className="min-h-screen pb-24 lg:pb-6">
        {/* Header */}
        <FadeInUp>
          <SettingsSubrouteHeader
            title="Información General"
            subtitle="Nombre, teléfono, dirección y enlace de reservas"
          />
        </FadeInUp>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Public Booking Link */}
          <FadeInUp delay={0.05}>
            <Card id="booking-link" className="overflow-hidden transition-all">
              <div className="absolute inset-x-0 top-0 h-1 bg-zinc-900 dark:bg-white" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[17px]">
                  <Globe className="h-5 w-5" />
                  Tu Página de Reservas
                </CardTitle>
                <CardDescription>Comparte este enlace con tus clientes</CardDescription>
              </CardHeader>
              <CardContent>
                {business?.slug ? (
                  <ShareBookingLink
                    bookingPath={bookingPath(business.slug)}
                    slug={business.slug}
                    businessName={business.name || ''}
                    variant="full"
                  />
                ) : (
                  <div className="text-[15px] text-muted">Cargando...</div>
                )}
              </CardContent>
            </Card>
          </FadeInUp>

          {/* Business Info */}
          <FadeInUp delay={0.1}>
            <Card id="business-name" className="transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[17px]">
                  <Building2 className="h-5 w-5" />
                  Información del Negocio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <Input
                  label="Nombre del negocio"
                  type="text"
                  placeholder="Barbería El Patrón"
                  value={formData.name}
                  onChange={(e) => setFormEdits((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Teléfono"
                    type="tel"
                    placeholder="2222-3333"
                    value={formData.phone}
                    onChange={(e) => setFormEdits((prev) => ({ ...prev, phone: e.target.value }))}
                  />

                  <Input
                    label="WhatsApp"
                    type="tel"
                    placeholder="87175866"
                    value={formData.whatsapp}
                    onChange={(e) =>
                      setFormEdits((prev) => ({ ...prev, whatsapp: e.target.value }))
                    }
                  />
                </div>

                <Input
                  label="Dirección"
                  type="text"
                  placeholder="San José, Costa Rica"
                  value={formData.address}
                  onChange={(e) => setFormEdits((prev) => ({ ...prev, address: e.target.value }))}
                />
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
