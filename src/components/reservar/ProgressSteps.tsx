import { CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type Step = 'service' | 'barber' | 'datetime' | 'info' | 'confirm'

interface ProgressStepsProps {
  currentStep: Step
  barberCount: number
}

export function ProgressSteps({ currentStep, barberCount }: ProgressStepsProps) {
  // Dynamic step labels based on barber count
  const stepLabels =
    barberCount > 1
      ? ['Servicio', 'Barbero', 'Fecha y Hora', 'Tus Datos']
      : ['Servicio', 'Fecha y Hora', 'Tus Datos']

  const stepKeys =
    barberCount > 1 ? ['service', 'barber', 'datetime', 'info'] : ['service', 'datetime', 'info']

  const stepIndex = stepKeys.indexOf(currentStep)

  return (
    <div className="sticky top-[108px] sm:top-[116px] z-40 px-4 py-3" data-testid="progress-steps">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-xl p-2 shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
          {stepLabels.map((label, i) => {
            const isCompleted = i < stepIndex
            const isCurrent = i === stepIndex

            return (
              <div key={label} className="flex items-center">
                <div
                  data-testid={`step-${stepKeys[i]}`}
                  data-active={isCurrent ? 'true' : undefined}
                  data-completed={isCompleted ? 'true' : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-300',
                    isCurrent && 'bg-white/10 ring-1 ring-white/15',
                    isCompleted && 'bg-emerald-500/20',
                    !isCompleted && !isCurrent && 'bg-transparent opacity-80'
                  )}
                >
                  <div
                    data-testid={`step-indicator-${stepKeys[i]}`}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all',
                      isCurrent && 'bg-white text-zinc-900',
                      isCompleted && 'bg-emerald-500 text-white',
                      !isCompleted && !isCurrent && 'bg-zinc-700 text-zinc-300'
                    )}
                  >
                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      'text-[13px] font-semibold hidden sm:block',
                      isCurrent && 'text-white',
                      isCompleted && 'text-emerald-300',
                      !isCompleted && !isCurrent && 'text-zinc-400'
                    )}
                  >
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div
                    className={cn(
                      'w-4 sm:w-6 h-0.5 mx-1 rounded-full transition-colors',
                      i < stepIndex ? 'bg-emerald-500' : 'bg-zinc-700'
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
