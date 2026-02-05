/**
 * FeatureGate Component
 *
 * Conditionally renders new or old UI based on feature flags.
 * Enables A/B testing and gradual rollout.
 *
 * @example
 * ```tsx
 * <FeatureGate
 *   flag="use_new_mi_dia"
 *   fallback={<CurrentMiDiaPage />}
 * >
 *   <NewMiDiaPageDemoB />
 * </FeatureGate>
 * ```
 */

import React from 'react'
import { featureFlags, type FeatureFlag } from '@/lib/feature-flags'

interface FeatureGateProps {
  /** Feature flag to check */
  flag: FeatureFlag
  /** New UI to render when flag is enabled */
  children: React.ReactNode
  /** Old UI to render when flag is disabled */
  fallback: React.ReactNode
  /** Optional: Show debug badge in development */
  showDebugBadge?: boolean
}

export function FeatureGate({
  flag,
  children,
  fallback,
  showDebugBadge = false,
}: FeatureGateProps) {
  const isEnabled = featureFlags[flag]

  // Debug badge in development
  const debugBadge = showDebugBadge && process.env.NODE_ENV === 'development' && (
    <div className="fixed top-4 right-4 z-50 px-3 py-1 rounded-full text-xs font-mono bg-black/80 text-white">
      🚩 {flag}: {isEnabled ? '✅ New' : '❌ Old'}
    </div>
  )

  return (
    <>
      {debugBadge}
      {isEnabled ? children : fallback}
    </>
  )
}

/**
 * Hook to check feature flag status
 *
 * @example
 * ```tsx
 * const isNewUIEnabled = useFeatureFlag('use_new_mi_dia')
 * ```
 */
export function useFeatureFlag(flag: FeatureFlag): boolean {
  return featureFlags[flag]
}

/**
 * Component to show content only when flag is enabled
 *
 * @example
 * ```tsx
 * <ShowWhenEnabled flag="use_unified_design_system">
 *   <DesignSystemDebugPanel />
 * </ShowWhenEnabled>
 * ```
 */
export function ShowWhenEnabled({
  flag,
  children,
}: {
  flag: FeatureFlag
  children: React.ReactNode
}) {
  return featureFlags[flag] ? <>{children}</> : null
}

/**
 * Component to show content only when flag is disabled
 *
 * @example
 * ```tsx
 * <ShowWhenDisabled flag="use_new_mi_dia">
 *   <MigrationNoticeBanner />
 * </ShowWhenDisabled>
 * ```
 */
export function ShowWhenDisabled({
  flag,
  children,
}: {
  flag: FeatureFlag
  children: React.ReactNode
}) {
  return !featureFlags[flag] ? <>{children}</> : null
}
