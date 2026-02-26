'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { ProgressBar } from '@/components/onboarding/progress-bar'
import { Welcome } from '@/components/onboarding/steps/welcome'
import {
  Setup,
  DEFAULT_HOURS,
  type OperatingHours,
  type ServiceData,
  type BarberData,
} from '@/components/onboarding/steps/setup'
import { ShareLink } from '@/components/onboarding/steps/share-link'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

interface OnboardingData {
  hours?: OperatingHours
  service?: ServiceData
  barber?: BarberData
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [businessName, setBusinessName] = useState('Mi Barbería')
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [businessSlug, setBusinessSlug] = useState('')
  const [data, setData] = useState<OnboardingData>({})

  // Check if onboarding is already completed
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const supabase = createClient()

        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data: business } = await supabase
          .from('businesses')
          .select('id, name, slug')
          .eq('owner_id', user.id)
          .single()

        if (!business) {
          router.push('/dashboard')
          return
        }

        setBusinessId(business.id)
        setBusinessName(business.name || 'Mi Barbería')
        setBusinessSlug(business.slug || '')

        // Check onboarding status
        const { data: onboarding } = await supabase
          .from('business_onboarding')
          .select('completed, current_step')
          .eq('business_id', business.id)
          .single()

        if (onboarding && (onboarding as { completed: boolean }).completed) {
          router.push('/dashboard')
          return
        }

        // Resume from saved step
        const currentStepValue = onboarding
          ? (onboarding as { current_step?: number }).current_step
          : undefined
        if (currentStepValue) {
          setCurrentStep(currentStepValue)
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Error checking onboarding:', error)
        setIsLoading(false)
      }
    }

    checkOnboarding()
  }, [router])

  const updateOnboardingStep = async (step: number, extra?: Record<string, unknown>) => {
    try {
      await fetch('/api/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_step: step, ...extra }),
      })
    } catch (error) {
      console.error('Error updating onboarding step:', error)
    }
  }

  // ─── Turbo Defaults: one-click apply ─────────────────

  const handleApplyDefaults = async () => {
    if (!businessId) return
    setIsSaving(true)

    try {
      const supabase = createClient()

      // Save defaults in parallel
      await Promise.all([
        supabase
          .from('businesses')
          .update({ operating_hours: DEFAULT_HOURS as any })
          .eq('id', businessId),
        supabase.from('services').insert({
          business_id: businessId,
          name: 'Corte Regular',
          price: 5000,
          duration_minutes: 30,
        }),
        supabase.from('barbers').insert({
          business_id: businessId,
          name: businessName,
          phone: '',
          email: 'noreply@example.com',
        } as any),
      ])

      // Mark step 3 + defaults_applied
      await updateOnboardingStep(3, { defaults_applied: true })

      setIsSaving(false)
      setCurrentStep(3) // Skip to share link
    } catch (error) {
      console.error('Error applying defaults:', error)
      setIsSaving(false)
    }
  }

  // ─── Customize path: save data from setup accordion ───

  const handleSetupComplete = async (setupData: {
    hours: OperatingHours
    service: ServiceData
    barber: BarberData
  }) => {
    if (!businessId) return
    setIsSaving(true)

    try {
      const supabase = createClient()

      await Promise.all([
        supabase
          .from('businesses')
          .update({ operating_hours: setupData.hours as any })
          .eq('id', businessId),
        supabase.from('services').insert({
          business_id: businessId,
          name: setupData.service.name,
          price: setupData.service.price,
          duration_minutes: setupData.service.duration_minutes,
        }),
        supabase.from('barbers').insert({
          business_id: businessId,
          name: setupData.barber.name,
          phone: setupData.barber.phone || '',
          email: setupData.barber.email || 'noreply@example.com',
        } as any),
      ])

      setData(setupData)
      await updateOnboardingStep(3)

      setIsSaving(false)
      setCurrentStep(3)
    } catch (error) {
      console.error('Error saving setup:', error)
      setIsSaving(false)
    }
  }

  // ─── Complete: mark done and go to dashboard ──────────

  const handleComplete = async () => {
    try {
      await fetch('/api/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      })

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      console.error('Error completing onboarding:', error)
    }
  }

  // ─── Loading states ───────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted">Cargando...</p>
        </div>
      </div>
    )
  }

  if (isSaving) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-muted">Guardando tu configuración...</p>
        </div>
      </div>
    )
  }

  // ─── Render ───────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress bar — only on step 2 (customize path) */}
        {currentStep === 2 && (
          <div className="mb-12">
            <ProgressBar currentStep={1} totalSteps={2} />
          </div>
        )}

        {/* Steps */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <Welcome
              key="welcome"
              onApplyDefaults={handleApplyDefaults}
              onCustomize={() => {
                setCurrentStep(2)
                updateOnboardingStep(2)
              }}
              onSkip={() => router.push('/dashboard')}
              businessName={businessName}
            />
          )}

          {currentStep === 2 && (
            <Setup
              key="setup"
              onNext={handleSetupComplete}
              onBack={() => {
                setCurrentStep(1)
                updateOnboardingStep(1)
              }}
              initialData={data}
              businessName={businessName}
            />
          )}

          {currentStep === 3 && (
            <ShareLink
              key="share-link"
              onComplete={handleComplete}
              businessName={businessName}
              slug={businessSlug}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
