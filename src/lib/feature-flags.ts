/**
 * Feature Flag System
 *
 * Simple environment-based feature flags for UI/UX redesign rollout.
 * Enables gradual deployment with instant rollback capability.
 *
 * Usage:
 * - Set flags in .env.local: NEXT_PUBLIC_FF_NEW_MI_DIA=true
 * - Use FeatureGate component to conditionally render new/old UI
 * - Rollback: Set flag to false and reload (< 5 min)
 */

export const featureFlags = {
  // Module 1: Mi Día (Dashboard Intelligence)
  use_new_mi_dia: process.env.NEXT_PUBLIC_FF_NEW_MI_DIA === 'true',

  // Module 2: Servicios (Simplified Hybrid + Sidebar)
  use_new_servicios: process.env.NEXT_PUBLIC_FF_NEW_SERVICIOS === 'true',

  // Module 3: Clientes (Dashboard + Canvas + Depth Fusion)
  use_new_clientes: process.env.NEXT_PUBLIC_FF_NEW_CLIENTES === 'true',

  // Module 4: Reportes (Intelligence Report)
  use_new_reportes: process.env.NEXT_PUBLIC_FF_NEW_REPORTES === 'true',

  // Module 5: Configuración (Bento Grid Luxury)
  use_new_configuracion: process.env.NEXT_PUBLIC_FF_NEW_CONFIGURACION === 'true',

  // Module 6: Equipo (Visual CRM Canvas)
  use_new_barberos: process.env.NEXT_PUBLIC_FF_NEW_BARBEROS === 'true',

  // Module 7: Citas (Calendar Cinema + macOS)
  use_new_citas: process.env.NEXT_PUBLIC_FF_NEW_CITAS === 'true',

  // Global design system
  use_unified_design_system: process.env.NEXT_PUBLIC_FF_UNIFIED_DESIGN === 'true',
} as const

export type FeatureFlag = keyof typeof featureFlags

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag]
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): FeatureFlag[] {
  return Object.entries(featureFlags)
    .filter(([_, enabled]) => enabled)
    .map(([flag]) => flag as FeatureFlag)
}

/**
 * Get all disabled features
 */
export function getDisabledFeatures(): FeatureFlag[] {
  return Object.entries(featureFlags)
    .filter(([_, enabled]) => !enabled)
    .map(([flag]) => flag as FeatureFlag)
}

/**
 * Development helper: Log feature flag status
 */
export function logFeatureFlags() {
  if (process.env.NODE_ENV === 'development') {
    console.group('🚩 Feature Flags')
    Object.entries(featureFlags).forEach(([flag, enabled]) => {
      console.log(`${enabled ? '✅' : '❌'} ${flag}`)
    })
    console.groupEnd()
  }
}
