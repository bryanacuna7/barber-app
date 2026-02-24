'use client'

import { useState, useEffect } from 'react'
import { Camera, Clock, Bell, CheckCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface OnboardingChecklistProps {
  barberName: string
  hasPhoto: boolean
  hasPushSubscription: boolean
  onDismiss: () => void
}

interface Step {
  id: string
  label: string
  description: string
  icon: typeof Camera
  completed: boolean
  action?: string
  actionUrl?: string
}

/**
 * Barber Onboarding Checklist — 3-step guide shown on first login.
 * Dismisses permanently after completion or manual dismiss.
 */
export function OnboardingChecklist({
  barberName,
  hasPhoto,
  hasPushSubscription,
  onDismiss,
}: OnboardingChecklistProps) {
  const steps: Step[] = [
    {
      id: 'photo',
      label: 'Agrega tu foto de perfil',
      description: 'Tus clientes podrán reconocerte al reservar',
      icon: Camera,
      completed: hasPhoto,
    },
    {
      id: 'schedule',
      label: 'Confirma tu horario',
      description: 'Verifica que tus horas de trabajo son correctas',
      icon: Clock,
      completed: true, // Always available once onboarded
    },
    {
      id: 'push',
      label: 'Activa notificaciones',
      description: 'Recibe alertas cuando agenden una cita contigo',
      icon: Bell,
      completed: hasPushSubscription,
    },
  ]

  const completedCount = steps.filter((s) => s.completed).length
  const allComplete = completedCount === steps.length

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-[15px] font-semibold text-blue-900 dark:text-blue-100">
            Bienvenido, {barberName.split(' ')[0]}
          </h3>
          <p className="text-[13px] text-blue-700 dark:text-blue-300 mt-0.5">
            {allComplete
              ? 'Todo listo. Ya puedes comenzar.'
              : `Completa estos pasos para empezar (${completedCount}/${steps.length})`}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-blue-400 hover:text-blue-600 dark:text-blue-500 p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-3 overflow-hidden">
        <motion.div
          className="h-full bg-blue-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(completedCount / steps.length) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <div className="space-y-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
              step.completed ? 'bg-blue-100/50 dark:bg-blue-900/20' : 'bg-white dark:bg-zinc-800/50'
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                step.completed
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-100 text-blue-500 dark:bg-blue-900/50'
              }`}
            >
              {step.completed ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <step.icon className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-[14px] font-medium ${
                  step.completed
                    ? 'text-blue-400 line-through dark:text-blue-600'
                    : 'text-zinc-900 dark:text-white'
                }`}
              >
                {step.label}
              </p>
              {!step.completed && (
                <p className="text-[12px] text-muted mt-0.5">{step.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {allComplete && (
        <Button onClick={onDismiss} className="w-full mt-3 h-10" variant="secondary">
          Entendido
        </Button>
      )}
    </motion.div>
  )
}
