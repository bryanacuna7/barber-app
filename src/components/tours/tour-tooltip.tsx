'use client'

/**
 * Tour Tooltip Component
 * Renders an interactive tooltip for product tours with Portal and animations
 */

import React, { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, ArrowLeft } from 'lucide-react'
import { useTour } from '@/lib/tours/tour-provider'

interface TooltipPosition {
  top: number
  left: number
  arrowPosition: 'top' | 'bottom' | 'left' | 'right'
}

export function TourTooltip() {
  const {
    isRunning,
    getCurrentStep,
    getCurrentTour,
    currentStepIndex,
    nextStep,
    previousStep,
    skipTour,
    completeTour,
  } = useTour()

  const [position, setPosition] = useState<TooltipPosition | null>(null)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const currentStep = getCurrentStep()
  const currentTour = getCurrentTour()

  // Calculate tooltip position based on target element
  useEffect(() => {
    if (!isRunning || !currentStep) {
      setPosition(null)
      setTargetElement(null)
      return
    }

    // Find target element
    const target = document.querySelector(currentStep.target) as HTMLElement
    if (!target) {
      console.warn(`Tour target not found: ${currentStep.target}`)
      return
    }

    setTargetElement(target)

    // Calculate position
    const calculatePosition = () => {
      const targetRect = target.getBoundingClientRect()
      // Responsive width: 90% on mobile, 360px on desktop
      const isMobile = window.innerWidth < 640 // sm breakpoint
      const tooltipWidth = isMobile ? window.innerWidth * 0.9 : 360
      const tooltipHeight = 200 // Estimated height
      const spacing = isMobile ? 8 : 16 // Smaller gap on mobile

      let top = 0
      let left = 0
      let arrowPosition: 'top' | 'bottom' | 'left' | 'right' = 'top'

      const placement = currentStep.placement || 'bottom'

      switch (placement) {
        case 'bottom':
          top = targetRect.bottom + spacing
          left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
          arrowPosition = 'top'
          break

        case 'top':
          top = targetRect.top - tooltipHeight - spacing
          left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
          arrowPosition = 'bottom'
          break

        case 'left':
          top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2
          left = targetRect.left - tooltipWidth - spacing
          arrowPosition = 'right'
          break

        case 'right':
          top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2
          left = targetRect.right + spacing
          arrowPosition = 'left'
          break
      }

      // Ensure tooltip stays within viewport
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      if (left < 8) left = 8
      if (left + tooltipWidth > viewportWidth - 8) {
        left = viewportWidth - tooltipWidth - 8
      }

      if (top < 8) top = 8
      if (top + tooltipHeight > viewportHeight - 8) {
        top = viewportHeight - tooltipHeight - 8
      }

      setPosition({ top, left, arrowPosition })
    }

    calculatePosition()

    // Recalculate on resize or scroll
    window.addEventListener('resize', calculatePosition)
    window.addEventListener('scroll', calculatePosition)

    return () => {
      window.removeEventListener('resize', calculatePosition)
      window.removeEventListener('scroll', calculatePosition)
    }
  }, [isRunning, currentStep])

  // Add spotlight effect to target element
  useEffect(() => {
    if (!targetElement || !currentStep?.spotlight) return

    // Add highlight class
    targetElement.style.position = 'relative'
    targetElement.style.zIndex = '9999'
    targetElement.classList.add('tour-spotlight')

    return () => {
      targetElement.style.position = ''
      targetElement.style.zIndex = ''
      targetElement.classList.remove('tour-spotlight')
    }
  }, [targetElement, currentStep])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isRunning) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        skipTour()
      } else if (e.key === 'ArrowRight') {
        if (currentStep?.isLastStep) {
          completeTour()
        } else {
          nextStep()
        }
      } else if (e.key === 'ArrowLeft' && currentStepIndex > 0) {
        previousStep()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isRunning, currentStep, currentStepIndex, nextStep, previousStep, skipTour, completeTour])

  if (!isRunning || !currentStep || !currentTour || !position) {
    return null
  }

  const totalSteps = currentTour.steps.length
  const progress = ((currentStepIndex + 1) / totalSteps) * 100

  const tooltipContent = (
    <>
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
        onClick={skipTour}
      />

      {/* Tooltip */}
      <motion.div
        ref={tooltipRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          zIndex: 10000,
        }}
        className="w-[90vw] sm:w-[360px] max-w-[360px] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        {/* Progress bar */}
        <div className="h-1 bg-zinc-200 dark:bg-zinc-800">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                {currentStep.title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                Paso {currentStepIndex + 1} de {totalSteps}
              </p>
            </div>
            <button
              onClick={skipTour}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors ml-2 p-1"
              aria-label="Cerrar tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 mb-4 sm:mb-6 leading-relaxed">
            {currentStep.content}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between gap-1 sm:gap-0">
            <button
              onClick={previousStep}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors touch-manipulation"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Anterior</span>
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={skipTour}
                className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors touch-manipulation"
              >
                Saltar
              </button>

              {currentStep.isLastStep ? (
                <button
                  onClick={completeTour}
                  className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-all shadow-lg shadow-blue-500/25 touch-manipulation"
                >
                  Finalizar
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-all shadow-lg shadow-blue-500/25 touch-manipulation"
                >
                  Siguiente
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Arrow indicator (optional visual enhancement) */}
        {position.arrowPosition === 'top' && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-white dark:bg-zinc-900 border-l border-t border-zinc-200 dark:border-zinc-800" />
        )}
        {position.arrowPosition === 'bottom' && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-white dark:bg-zinc-900 border-r border-b border-zinc-200 dark:border-zinc-800" />
        )}
        {position.arrowPosition === 'left' && (
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rotate-45 bg-white dark:bg-zinc-900 border-l border-b border-zinc-200 dark:border-zinc-800" />
        )}
        {position.arrowPosition === 'right' && (
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rotate-45 bg-white dark:bg-zinc-900 border-r border-t border-zinc-200 dark:border-zinc-800" />
        )}
      </motion.div>

      {/* Global styles for spotlight effect */}
      <style jsx global>{`
        .tour-spotlight {
          box-shadow:
            0 0 0 4px rgba(59, 130, 246, 0.5),
            0 0 0 9999px rgba(0, 0, 0, 0.6) !important;
          border-radius: 8px;
        }
      `}</style>
    </>
  )

  return createPortal(
    <AnimatePresence mode="wait">{tooltipContent}</AnimatePresence>,
    document.body
  )
}
