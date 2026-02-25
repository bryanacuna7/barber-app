'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
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
  const router = useRouter()
  const { businessId } = useBusiness()
  const toast = useToast()
  const supabase = createClient()

  const [permissions, setPermissions] = useState<StaffPermissions>(DEFAULT_STAFF_PERMISSIONS)
  const [loading, setLoading] = useState(true)
  const [permissionsSaving, setPermissionsSaving] = useState(false)
  const [ownerBarberId, setOwnerBarberId] = useState<string | null>(null)
  const [ownerBarberActive, setOwnerBarberActive] = useState(false)
  const [ownerBarberName, setOwnerBarberName] = useState('Propietario')
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null)
  const [ownerUserId, setOwnerUserId] = useState<string | null>(null)
  const [ownerBarberSaving, setOwnerBarberSaving] = useState(false)

  // Load current permissions
  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

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

      if (user?.email) {
        setOwnerEmail(user.email)
      }
      if (user?.id) {
        setOwnerUserId(user.id)
      }

      const preferredName =
        ((user?.user_metadata as Record<string, unknown> | undefined)?.full_name as string) ||
        ((user?.user_metadata as Record<string, unknown> | undefined)?.name as string) ||
        (user?.email ? user.email.split('@')[0] : 'Propietario')
      setOwnerBarberName(preferredName)

      const normalizeEmail = (value?: string | null) => (value || '').trim().toLowerCase()
      const normalizedOwnerEmail = normalizeEmail(user?.email)

      const { data: barberRows } = await supabase
        .from('barbers')
        .select('id, user_id, email, name, is_active')
        .eq('business_id', businessId)

      const matchingBarber =
        barberRows?.find((row) => row.user_id && row.user_id === user?.id) ??
        barberRows?.find((row) => normalizeEmail(row.email) === normalizedOwnerEmail) ??
        null

      if (matchingBarber) {
        setOwnerBarberId(matchingBarber.id)
        setOwnerBarberActive(matchingBarber.is_active !== false)
        setOwnerBarberName(matchingBarber.name || preferredName)
      }

      setLoading(false)
    }
    load()
  }, [businessId, supabase])

  const handleToggle = async (key: keyof StaffPermissions) => {
    if (permissionsSaving) return

    const previousPermissions = permissions
    const nextPermissions = { ...previousPermissions, [key]: !previousPermissions[key] }

    setPermissions(nextPermissions)
    setPermissionsSaving(true)

    try {
      // staff_permissions from migration 027 — not in generated types yet
      const { error } = await supabase
        .from('businesses')
        .update({ staff_permissions: nextPermissions } as Record<string, unknown>)
        .eq('id', businessId)

      if (error) {
        setPermissions(previousPermissions)
        toast.error('Error al guardar permisos')
      }
    } catch {
      setPermissions(previousPermissions)
      toast.error('Error al guardar permisos')
    } finally {
      setPermissionsSaving(false)
    }
  }

  const handleOwnerBarberToggle = async () => {
    if (!ownerUserId || !ownerEmail) {
      toast.error('No se pudo identificar tu cuenta')
      return
    }

    const nextActive = !ownerBarberActive
    setOwnerBarberSaving(true)

    try {
      if (ownerBarberId) {
        const { error } = await supabase
          .from('barbers')
          .update({
            is_active: nextActive,
            user_id: ownerUserId,
            email: ownerEmail,
            name: ownerBarberName,
          } as Record<string, unknown>)
          .eq('id', ownerBarberId)
          .eq('business_id', businessId)

        if (error) throw error
      } else if (nextActive) {
        const { data: inserted, error } = await (supabase
          .from('barbers')
          .insert({
            business_id: businessId,
            user_id: ownerUserId,
            email: ownerEmail,
            name: ownerBarberName,
            is_active: true,
            role: 'owner',
          } as Record<string, unknown>)
          .select('id')
          .single() as unknown as Promise<{ data: { id: string } | null; error: unknown }>)

        if (error || !inserted) throw error
        setOwnerBarberId(inserted.id)
      }

      setOwnerBarberActive(nextActive)
      toast.success(
        nextActive ? 'Mi Día activado para tu cuenta.' : 'Mi Día desactivado para tu cuenta.'
      )

      // Apply role/nav changes immediately without requiring manual reload.
      router.refresh()
    } catch (error) {
      console.error('Error updating owner barber status:', error)
      toast.error('No se pudo actualizar tu perfil de barbero')
    } finally {
      setOwnerBarberSaving(false)
    }
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
                      disabled={permissionsSaving}
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
                      disabled={permissionsSaving}
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
                Estos permisos aplican a todos los miembros del equipo de tu negocio. Mi Día siempre
                está disponible para ellos. Los switches se guardan automáticamente.
              </p>
            </div>
          </FadeInUp>

          <FadeInUp delay={0.2}>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[16px] font-semibold text-zinc-900 dark:text-white">
                    Activar Mi Día para mi cuenta
                  </p>
                  <p className="text-[13px] text-muted mt-0.5">
                    Si eres owner y también atiendes clientes, activa este switch para usar Mi Día.
                  </p>
                </div>
                <IOSToggle
                  checked={ownerBarberActive}
                  onChange={handleOwnerBarberToggle}
                  disabled={ownerBarberSaving}
                />
              </div>
              <p className="text-[12px] text-muted mt-3">
                Estado: {ownerBarberActive ? 'Activo' : 'Inactivo'}
              </p>
            </div>
          </FadeInUp>
        </div>
      </div>
    </ComponentErrorBoundary>
  )
}
