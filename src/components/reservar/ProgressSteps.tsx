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
        <div className="flex items-center justify-center gap-2 rounded-2xl bg-white/80 backdrop-blur-xl p-2 shadow-sm dark:bg-zinc-900/80">
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
                    isCurrent && 'bg-zinc-900 dark:bg-white',
                    isCompleted && 'bg-emerald-100 dark:bg-emerald-900/30',
                    !isCompleted && !isCurrent && 'bg-transparent'
                  )}
                >
                  <div
                    data-testid={`step-indicator-${stepKeys[i]}`}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all',
                      isCurrent && 'bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white',
                      isCompleted && 'bg-emerald-500 text-white',
                      !isCompleted &&
                        !isCurrent &&
                        'bg-zinc-200 text-zinc-400 dark:bg-zinc-700 dark:text-zinc-500'
                    )}
                  >
                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      'text-[13px] font-semibold hidden sm:block',
                      isCurrent && 'text-white dark:text-zinc-900',
                      isCompleted && 'text-emerald-700 dark:text-emerald-400',
                      !isCompleted && !isCurrent && 'text-zinc-400 dark:text-zinc-500'
                    )}
                  >
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div
                    className={cn(
                      'w-4 sm:w-6 h-0.5 mx-1 rounded-full transition-colors',
                      i < stepIndex ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700'
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
