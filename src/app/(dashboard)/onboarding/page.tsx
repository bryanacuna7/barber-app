'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { ProgressBar } from '@/components/onboarding/progress-bar'
import { Welcome } from '@/components/onboarding/steps/welcome'
import { Hours, type OperatingHours } from '@/components/onboarding/steps/hours'
import { Service, type ServiceData } from '@/components/onboarding/steps/service'
import { Barber, type BarberData } from '@/components/onboarding/steps/barber'
import { Branding, type BrandingData } from '@/components/onboarding/steps/branding'
import { Success } from '@/components/onboarding/steps/success'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

interface OnboardingData {
  hours?: OperatingHours
  service?: ServiceData
  barber?: BarberData
  branding?: BrandingData
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [businessName, setBusinessName] = useState('Mi Barbería')
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [data, setData] = useState<OnboardingData>({})

  const totalSteps = 6

  // Check if onboarding is already completed
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const supabase = createClient()

        // Get business info
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data: business } = await supabase
          .from('businesses')
          .select('id, name')
          .eq('owner_id', user.id)
          .single()

        if (!business) {
          router.push('/dashboard')
          return
        }

        setBusinessId(business.id)
        setBusinessName(business.name || 'Mi Barbería')

        // Check onboarding status
        const { data: onboarding } = await supabase
          .from('business_onboarding')
          .select('completed, current_step')
          .eq('business_id', business.id)
          .single()

        if (onboarding && (onboarding as { completed: boolean }).completed) {
          // Already completed, redirect to dashboard
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

  const updateOnboardingStep = async (step: number) => {
    if (!businessId) return

    try {
      await fetch('/api/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_step: step }),
      })
    } catch (error) {
      console.error('Error updating onboarding step:', error)
    }
  }

  const handleNext = (stepData?: any) => {
    // Save step data
    const stepKey = ['', '', 'hours', 'service', 'barber', 'branding'][currentStep]
    if (stepKey && stepData) {
      setData((prev) => ({ ...prev, [stepKey]: stepData }))
    }

    const nextStep = currentStep + 1
    setCurrentStep(nextStep)
    updateOnboardingStep(nextStep)
  }

  const handleBack = () => {
    const prevStep = currentStep - 1
    setCurrentStep(prevStep)
    updateOnboardingStep(prevStep)
  }

  const handleSkipBranding = () => {
    handleNext()
  }

  const handleComplete = async () => {
    if (!businessId) return

    setIsSaving(true)

    try {
      const supabase = createClient()

      // Save operating hours
      if (data.hours) {
        await supabase
          .from('businesses')
          .update({ operating_hours: data.hours as any })
          .eq('id', businessId)
      }

      // Save service
      if (data.service) {
        await supabase.from('services').insert({
          business_id: businessId,
          name: data.service.name,
          price: data.service.price,
          duration_minutes: data.service.duration_minutes,
        })
      }

      // Save barber
      if (data.barber) {
        await supabase.from('barbers').insert({
          business_id: businessId,
          name: data.barber.name,
          phone: data.barber.phone || '',
          email: data.barber.email || 'noreply@example.com',
        } as any)
      }

      // Save branding
      if (data.branding) {
        const updates: any = {
          brand_primary_color: data.branding.primaryColor,
        }

        // Upload logo if provided
        if (data.branding.logo) {
          const fileName = `${businessId}-${Date.now()}.${data.branding.logo.name.split('.').pop()}`
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('logos')
            .upload(fileName, data.branding.logo, {
              cacheControl: '3600',
              upsert: false,
            })

          if (!uploadError && uploadData) {
            const {
              data: { publicUrl },
            } = supabase.storage.from('logos').getPublicUrl(uploadData.path)

            updates.logo_url = publicUrl
          }
        }

        await supabase.from('businesses').update(updates).eq('id', businessId)
      }

      // Mark onboarding as completed
      await fetch('/api/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      })

      // Redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      console.error('Error completing onboarding:', error)
      setIsSaving(false)
    }
  }

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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress bar */}
        {currentStep > 1 && currentStep < totalSteps && (
          <div className="mb-12">
            <ProgressBar currentStep={currentStep - 1} totalSteps={totalSteps - 2} />
          </div>
        )}

        {/* Steps */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <Welcome key="welcome" onNext={handleNext} businessName={businessName} />
          )}

          {currentStep === 2 && (
            <Hours key="hours" onNext={handleNext} onBack={handleBack} initialHours={data.hours} />
          )}

          {currentStep === 3 && (
            <Service
              key="service"
              onNext={handleNext}
              onBack={handleBack}
              initialService={data.service}
            />
          )}

          {currentStep === 4 && (
            <Barber
              key="barber"
              onNext={handleNext}
              onBack={handleBack}
              initialBarber={data.barber}
            />
          )}

          {currentStep === 5 && (
            <Branding
              key="branding"
              onNext={handleNext}
              onBack={handleBack}
              onSkip={handleSkipBranding}
              initialBranding={data.branding}
            />
          )}

          {currentStep === 6 && (
            <Success key="success" onComplete={handleComplete} businessName={businessName} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
