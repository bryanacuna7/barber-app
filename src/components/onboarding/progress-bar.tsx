'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="w-full">
      {/* Progress percentage */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Paso {currentStep} de {totalSteps}
        </span>
        <span className="text-sm font-semibold text-zinc-900 dark:text-white">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 20,
          }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between mt-4">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1
          const isCompleted = stepNum < currentStep
          const isCurrent = stepNum === currentStep

          return (
            <div key={stepNum} className="flex flex-col items-center gap-2">
              <motion.div
                className={`
                  relative flex h-8 w-8 items-center justify-center rounded-full
                  ${isCompleted ? 'bg-blue-500 dark:bg-blue-600' : ''}
                  ${isCurrent ? 'bg-blue-500 dark:bg-blue-600' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-zinc-200 dark:bg-zinc-800' : ''}
                `}
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 25,
                }}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 20,
                    }}
                  >
                    <Check className="h-4 w-4 text-white" strokeWidth={3} />
                  </motion.div>
                ) : (
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent ? 'text-white' : 'text-zinc-400 dark:text-zinc-600'
                    }`}
                  >
                    {stepNum}
                  </span>
                )}
              </motion.div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
