'use client'

import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { IOSToggle } from '@/components/ui/ios-toggle'
import { useToast } from '@/components/ui/toast'
import { FadeInUp } from '@/components/ui/motion'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/contexts/business-context'
import { ComponentErrorBoundary } from '@/components/error-boundaries/ComponentErrorBoundary'
import { SettingsSubrouteHeader } from '@/components/settings/settings-subroute-header'
import {
  DEFAULT_STAFF_PERMISSIONS,
  getStaffPermissions,
  type StaffPermissions,
} from '@/lib/auth/roles'

// =====================================================
// Permission Toggle Definitions
// =====================================================

interface PermissionToggle {
  key: keyof StaffPermissions
  label: string
  description: string
}

const VIEW_PERMISSIONS: PermissionToggle[] = [
  {
    key: 'nav_citas',
    label: 'Citas (sus propias)',
    description: 'Pueden ver y navegar sus citas por fecha',
  },
  {
    key: 'nav_servicios',
    label: 'Servicios (solo ver)',
    description: 'Pueden ver la lista de precios',
  },
  {
    key: 'nav_clientes',
    label: 'Clientes',
    description: 'Pueden ver la lista de clientes del negocio',
  },
  {
    key: 'nav_analiticas',
    label: 'Analíticas',
    description: 'Pueden ver sus propias estadísticas',
  },
  {
    key: 'nav_changelog',
    label: 'Novedades',
    description: 'Pueden ver versiones y cambios de la app',
  },
]

const ACTION_PERMISSIONS: PermissionToggle[] = [
  {
    key: 'can_create_citas',
    label: 'Crear citas (walk-ins)',
    description: 'Pueden agendar citas para sí mismos',
  },
  {
    key: 'can_view_all_citas',
    label: 'Ver todas las citas',
    description: 'Ven citas de todos los miembros del equipo, no solo las suyas',
  },
]

// =====================================================
// Page Component
// =====================================================

export default function EquipoSettingsPage() {
  const { businessId } = useBusiness()
  const toast = useToast()
  const supabase = createClient()

  const [permissions, setPermissions] = useState<StaffPermissions>(DEFAULT_STAFF_PERMISSIONS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load current permissions
  useEffect(() => {
    async function load() {
      // staff_permissions from migration 027 — not in generated types yet
      const { data } = await (supabase
        .from('businesses')
        .select('staff_permissions' as string)
        .eq('id', businessId)
        .single() as unknown as Promise<{
        data: { staff_permissions?: Record<string, boolean> } | null
      }>)

      if (data) {
        setPermissions(getStaffPermissions(data.staff_permissions))
      }
      setLoading(false)
    }
    load()
  }, [businessId, supabase])

  const handleToggle = (key: keyof StaffPermissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    setSaving(true)
    // staff_permissions from migration 027 — not in generated types yet
    const { error } = await supabase
      .from('businesses')
      .update({ staff_permissions: permissions } as Record<string, unknown>)
      .eq('id', businessId)

    setSaving(false)

    if (error) {
      toast.error('Error al guardar permisos')
      return
    }

    toast.success('Permisos actualizados')
  }

  // Loading state
  if (loading) {
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
      fallbackTitle="Error en Equipo y Accesos"
      fallbackDescription="Ocurrió un error al cargar la página de permisos del equipo"
    >
      <div className="min-h-screen pb-24 lg:pb-6">
        {/* Header */}
        <FadeInUp>
          <SettingsSubrouteHeader
            title="Equipo y Accesos"
            subtitle="Qué pueden ver y hacer tus miembros del equipo"
          />
        </FadeInUp>

        <div className="space-y-8 max-w-3xl mx-auto">
          {/* View Permissions */}
          <FadeInUp delay={0.05}>
            <div>
              <h3 className="text-[15px] font-semibold text-muted uppercase tracking-wider mb-4">
                Qué pueden ver tus miembros del equipo
              </h3>
              <div className="space-y-1">
                {VIEW_PERMISSIONS.map((perm) => (
                  <div
                    key={perm.key}
                    className="flex items-center justify-between py-3.5 px-1 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-[16px] font-medium text-zinc-900 dark:text-white">
                        {perm.label}
                      </p>
                      <p className="text-[13px] text-muted mt-0.5">{perm.description}</p>
                    </div>
                    <IOSToggle
                      checked={permissions[perm.key]}
                      onChange={() => handleToggle(perm.key)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </FadeInUp>

          {/* Action Permissions */}
          <FadeInUp delay={0.1}>
            <div>
              <h3 className="text-[15px] font-semibold text-muted uppercase tracking-wider mb-4">
                Qué pueden hacer tus miembros del equipo
              </h3>
              <div className="space-y-1">
                {ACTION_PERMISSIONS.map((perm) => (
                  <div
                    key={perm.key}
                    className="flex items-center justify-between py-3.5 px-1 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-[16px] font-medium text-zinc-900 dark:text-white">
                        {perm.label}
                      </p>
                      <p className="text-[13px] text-muted mt-0.5">{perm.description}</p>
                    </div>
                    <IOSToggle
                      checked={permissions[perm.key]}
                      onChange={() => handleToggle(perm.key)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </FadeInUp>

          {/* Info note */}
          <FadeInUp delay={0.15}>
            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3">
              <p className="text-[13px] text-muted">
                Estos permisos aplican a todos los miembros del equipo de tu negocio. Mi Día siempre está
                disponible para ellos.
              </p>
            </div>
          </FadeInUp>
        </div>

        {/* Sticky Save Button */}
        <div className="fixed bottom-20 lg:bottom-6 left-0 right-0 lg:left-64 px-4 lg:px-8 z-30">
          <div className="max-w-3xl mx-auto">
            <Button
              type="button"
              onClick={handleSave}
              isLoading={saving}
              className="w-full h-12 text-[15px] font-semibold shadow-lg"
            >
              <Save className="h-5 w-5 mr-2" />
              Guardar Permisos
            </Button>
          </div>
        </div>
      </div>
    </ComponentErrorBoundary>
  )
}
