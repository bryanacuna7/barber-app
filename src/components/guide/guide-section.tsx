'use client'

/**
 * GuideSection — Renders a single guide section card.
 *
 * Usage:
 *   import { GuideSection } from '@/components/guide/guide-section'
 *   <GuideSection section={GUIDE_SECTIONS[0]} />
 */

import { motion, useReducedMotion } from 'framer-motion'
import { Lightbulb } from 'lucide-react'
import { animations, reducedMotion } from '@/lib/design-system'
import { GUIDE_COLORS, type GuideSection as GuideSectionType } from '@/lib/guide/guide-content'
import { cn } from '@/lib/utils/cn'

interface GuideSectionProps {
  section: GuideSectionType
  /** Index used to stagger entrance animations */
  index?: number
}

export function GuideSection({ section, index = 0 }: GuideSectionProps) {
  const prefersReduced = useReducedMotion()
  const colors = GUIDE_COLORS[section.color] ?? GUIDE_COLORS['blue']
  const Icon = section.icon

  const fadeInUp = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
  }

  const transition = prefersReduced
    ? reducedMotion.spring.default
    : {
        ...animations.spring.default,
        delay: index * 0.05,
      }

  return (
    <motion.article
      id={section.id}
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={transition}
      style={{ scrollMarginTop: '80px' }}
      className={cn(
        'rounded-2xl border border-zinc-200 bg-white p-6',
        'dark:border-zinc-800 dark:bg-zinc-900'
      )}
      aria-labelledby={`${section.id}-title`}
    >
      {/* Header */}
      <header className="flex items-start gap-4 pb-5 border-b border-zinc-100 dark:border-zinc-800">
        <div
          className={cn(
            'flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full',
            colors.iconBg
          )}
          aria-hidden="true"
        >
          <Icon className={cn('w-5 h-5', colors.iconText)} strokeWidth={1.75} />
        </div>

        <div className="min-w-0 flex-1">
          <h2
            id={`${section.id}-title`}
            className="text-xl font-semibold text-zinc-900 dark:text-white leading-snug"
          >
            {section.title}
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400 leading-snug">
            {section.subtitle}
          </p>
        </div>
      </header>

      {/* Step list */}
      <ol className="mt-5 space-y-4" aria-label={`Pasos de ${section.title}`}>
        {section.steps.map((step, stepIndex) => (
          <li key={stepIndex} className="flex gap-3">
            {/* Number badge */}
            <span
              className={cn(
                'flex-shrink-0 flex items-center justify-center',
                'w-6 h-6 rounded-full text-xs font-semibold mt-0.5',
                colors.stepBg,
                colors.stepText
              )}
              aria-hidden="true"
            >
              {stepIndex + 1}
            </span>

            {/* Step content */}
            <div className="min-w-0 flex-1">
              <p className="font-medium text-zinc-900 dark:text-white leading-snug">{step.text}</p>
              {step.detail && (
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {step.detail}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>

      {/* Pro tips box */}
      {section.proTips && section.proTips.length > 0 && (
        <motion.aside
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            prefersReduced
              ? reducedMotion.spring.gentle
              : { ...animations.spring.gentle, delay: index * 0.05 + 0.15 }
          }
          className={cn(
            'mt-5 rounded-xl p-4',
            'bg-amber-50 dark:bg-amber-500/10',
            'border border-amber-100 dark:border-amber-500/20'
          )}
          aria-label="Consejos profesionales"
        >
          <div className="flex items-center gap-2 mb-2.5">
            <Lightbulb
              className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <span className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
              Consejos
            </span>
          </div>

          <ul className="space-y-1.5">
            {section.proTips.map((tip, tipIndex) => (
              <li
                key={tipIndex}
                className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed flex gap-2"
              >
                <span
                  className="text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                >
                  •
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </motion.aside>
      )}
    </motion.article>
  )
}
