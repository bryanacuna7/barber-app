'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, Sparkles, Zap, Heart, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

/**
 * DEMO NAVIGATION HUB
 * Central page to navigate between the 3 configuration redesign options
 */

export default function DemosNavigationPage() {
  const router = useRouter()

  const demos = [
    {
      id: 'demo-a',
      title: 'Opción A: Bento Grid Luxury',
      tagline: 'El showstopper visual',
      description: 'Máximo impacto visual con hero card, gradientes mesh y animaciones 3D espectaculares',
      url: '/configuracion/demo-a',
      gradient: 'from-blue-500 via-purple-500 to-pink-500',
      icon: Sparkles,
      awwwardsScore: '9/10',
      features: [
        'Hero card 2x con jerarquía dramática',
        'Gradientes mesh multi-layer',
        '3D hover effects con perspective',
        'Tipografía 64px bold tracking-tight',
        'Spring physics animations',
      ],
      bestFor: 'Impresionar, landing pages, brand-first apps',
      effort: '3-5 días',
    },
    {
      id: 'demo-b',
      title: 'Opción B: Dashboard Split',
      tagline: 'El power user workspace',
      description: 'Sidebar permanente + preview en vivo para workflow optimizado sin overlays',
      url: '/configuracion/demo-b',
      gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
      icon: Zap,
      awwwardsScore: '6/10',
      features: [
        'Sidebar de navegación permanente',
        'Preview live de cambios instantáneos',
        'Sin sheets ni overlays',
        'Workflow optimizado para power users',
        'Split-screen desktop-first',
      ],
      bestFor: 'SaaS, dashboards, usuarios frecuentes',
      effort: '5-7 días',
    },
    {
      id: 'demo-c',
      title: 'Opción C: Progressive Disclosure',
      tagline: 'El balance perfecto',
      description: 'Cards que expanden in-place con layout animations, sin pérdida de contexto',
      url: '/configuracion/demo-c',
      gradient: 'from-purple-500 via-pink-500 to-rose-500',
      icon: Heart,
      awwwardsScore: '7.5/10',
      features: [
        'Expande in-place (cero context switching)',
        'Layout animations fluidas',
        'Excelente en mobile',
        'Balance visual/funcional perfecto',
        'Rápido de implementar',
      ],
      bestFor: 'Balance, mobile-first, implementación rápida',
      effort: '2-3 días',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 dark:border-blue-500/30 mb-6"
          >
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Configuración Redesign
            </span>
          </motion.div>

          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
            3 Opciones de Diseño
          </h1>
          <p className="text-xl lg:text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto mb-8">
            Explora cada versión y elige la que más te guste.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-semibold">
              Cada una diseñada para nivel awwwards.
            </span>
          </p>

          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/configuracion')}
            >
              ← Ver versión actual
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('/SETTINGS_REDESIGN_COMPARISON.md', '_blank')}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Ver comparación completa
            </Button>
          </div>
        </motion.div>

        {/* Demo cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {demos.map((demo, index) => {
            const Icon = demo.icon

            return (
              <motion.div
                key={demo.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                  delay: index * 0.1,
                }}
              >
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="relative h-full"
                >
                  {/* Glow effect */}
                  <div
                    className={`absolute -inset-1 bg-gradient-to-r ${demo.gradient} rounded-3xl blur-xl opacity-30`}
                  />

                  {/* Card content */}
                  <div className="relative h-full p-8 rounded-3xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 shadow-xl flex flex-col">
                    {/* Icon */}
                    <div className="mb-6">
                      <div
                        className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${demo.gradient} shadow-lg`}
                      >
                        <Icon className="h-8 w-8 text-white" strokeWidth={2} />
                      </div>
                    </div>

                    {/* Title and tagline */}
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                        {demo.title}
                      </h3>
                      <p className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-zinc-600 to-zinc-400 dark:from-zinc-400 dark:to-zinc-500">
                        {demo.tagline}
                      </p>
                    </div>

                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                      {demo.description}
                    </p>

                    {/* Awwwards score */}
                    <div className="mb-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                          Awwwards Score:
                        </span>
                        <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                          {demo.awwwardsScore}
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-6 flex-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
                        Características
                      </h4>
                      <ul className="space-y-2">
                        {demo.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300"
                          >
                            <div
                              className={`flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${demo.gradient} mt-1.5`}
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Meta info */}
                    <div className="space-y-2 mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-700">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500">Mejor para:</span>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {demo.bestFor}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500">Esfuerzo:</span>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {demo.effort}
                        </span>
                      </div>
                    </div>

                    {/* CTA */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push(demo.url)}
                      className={`w-full py-4 rounded-xl font-semibold text-white shadow-lg bg-gradient-to-r ${demo.gradient} hover:shadow-xl transition-shadow flex items-center justify-center gap-2`}
                    >
                      <span>Ver Demo</span>
                      <ArrowRight className="h-5 w-5" />
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>

        {/* Recommendation banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-8 rounded-3xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-2 border-purple-200 dark:border-purple-800"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                Mi Recomendación
              </h3>
              <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                <strong>Fase 1 (1 semana):</strong> Implementar <strong>Opción C</strong> (Progressive
                Disclosure) - balance perfecto, rápido de implementar, excelente en mobile.
              </p>
              <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                <strong>Fase 2 (2 semanas):</strong> Agregar elementos de <strong>Opción A</strong> - hero
                card, gradientes mesh, 3D effects, tipografía dramática.
              </p>
              <p className="text-zinc-700 dark:text-zinc-300">
                <strong>Fase 3 (1 mes):</strong> Incorporar preview live de <strong>Opción B</strong> - panel
                toggleable con vista previa en tiempo real.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            ¿Listo para decidir? Prueba cada demo y dime cuál te gusta más 🚀
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => router.push('/configuracion/demo-c')}
              className="gap-2"
            >
              <Heart className="h-5 w-5" />
              Ver Opción Recomendada (C)
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
