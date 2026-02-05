'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Clock,
  Palette,
  Settings,
  Search,
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

/**
 * OPCIÓN A: BENTO GRID LUXURY
 *
 * Características:
 * - Hero card 2x tamaño (General)
 * - Grid asimétrico bento-style
 * - Gradientes mesh sofisticados
 * - Spring animations reales
 * - Tipografía dramática
 * - 3D hover effects con perspective
 * - Micro-animaciones respiratorias
 */

export default function ConfiguracionDemoA() {
  const router = useRouter()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Animated gradient orbs background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-15">
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
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-violet-400 to-blue-400 rounded-full blur-3xl"
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
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8 lg:py-12">
        {/* Hero Header with dramatic typography */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="mb-12"
        >
          <div className="flex items-start justify-between gap-6 mb-6">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 mb-4"
              >
                <div className="relative">
                  <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-blue-500 rounded-full blur-xl -z-10"
                  />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Demo A: Bento Grid
                </span>
              </motion.div>

              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                Configuración
              </h1>
              <p className="text-lg lg:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl">
                Administra tu negocio con un diseño{' '}
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600">
                  excepcional
                </span>
              </p>
            </div>

            {/* Enhanced search button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative flex items-center gap-3 h-14 px-6 rounded-2xl bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-700 shadow-lg">
                <Search className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                <span className="hidden sm:inline text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Buscar
                </span>
                <kbd className="hidden lg:inline px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 text-xs font-mono">
                  ⌘K
                </kbd>
              </div>
            </motion.button>
          </div>

          {/* Back to current button */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/configuracion')}
              className="gap-2"
            >
              ← Volver a versión actual
            </Button>
          </motion.div>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* HERO CARD - General (Takes 2x space) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.1 }}
            className="lg:col-span-7 lg:row-span-2"
          >
            <motion.button
              type="button"
              onHoverStart={() => setHoveredCard('general')}
              onHoverEnd={() => setHoveredCard(null)}
              whileHover={{
                scale: 1.02,
                rotateX: 5,
                rotateY: -5,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="relative w-full h-full group"
              style={{ perspective: 1000 }}
            >
              {/* Gradient glow effect */}
              <motion.div
                animate={{
                  opacity: hoveredCard === 'general' ? 0.6 : 0.3,
                }}
                className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl -z-10"
              />

              {/* Card content */}
              <div className="relative h-full min-h-[400px] lg:min-h-[500px] p-8 lg:p-12 rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 backdrop-blur-xl border-2 border-white/20 dark:border-white/10 shadow-2xl overflow-hidden transition-all duration-300 group-hover:border-white/40 dark:group-hover:border-white/20">
                {/* Animated mesh gradient background */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20" />
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 90, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
                  />
                </div>

                <div className="relative h-full flex flex-col justify-between">
                  {/* Icon with breathing animation */}
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      rotate: [0, 5, 0],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="inline-flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 rounded-2xl lg:rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl shadow-blue-500/50 mb-6"
                  >
                    <Building2 className="h-10 w-10 lg:h-12 lg:w-12 text-white" strokeWidth={2} />
                  </motion.div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-3xl lg:text-4xl font-bold text-zinc-900 dark:text-white mb-3">
                        Información General
                      </h3>
                      <p className="text-base lg:text-lg text-zinc-600 dark:text-zinc-400">
                        Nombre, contacto, dirección y tu página pública de reservas
                      </p>
                    </div>

                    {/* Features list */}
                    <div className="space-y-2">
                      {[
                        'Nombre del negocio',
                        'Teléfono y WhatsApp',
                        'Dirección',
                        'Enlace de reservas',
                      ].map((item, i) => (
                        <motion.div
                          key={item}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          {item}
                        </motion.div>
                      ))}
                    </div>

                    {/* CTA */}
                    <motion.div
                      whileHover={{ x: 10 }}
                      className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold mt-6"
                    >
                      <span>Configurar</span>
                      <ArrowRight className="h-5 w-5" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.button>
          </motion.div>

          {/* Horario Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <motion.button
              type="button"
              onHoverStart={() => setHoveredCard('horario')}
              onHoverEnd={() => setHoveredCard(null)}
              whileHover={{ scale: 1.03, rotateZ: 2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="relative w-full h-full group"
            >
              <motion.div
                animate={{ opacity: hoveredCard === 'horario' ? 0.5 : 0.2 }}
                className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl -z-10"
              />

              <div className="relative h-full min-h-[240px] p-6 lg:p-8 rounded-2xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-700 shadow-xl hover:shadow-2xl transition-all duration-300">
                <motion.div
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg mb-4"
                >
                  <Clock className="h-7 w-7 text-white" strokeWidth={2} />
                </motion.div>

                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                  Horario de Atención
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  Días, horas y configuración de reservas
                </p>

                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium text-sm"
                >
                  <span>Configurar</span>
                  <ArrowRight className="h-4 w-4" />
                </motion.div>
              </div>
            </motion.button>
          </motion.div>

          {/* Branding Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <motion.button
              type="button"
              onHoverStart={() => setHoveredCard('branding')}
              onHoverEnd={() => setHoveredCard(null)}
              whileHover={{ scale: 1.03, rotateZ: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="relative w-full h-full group"
            >
              <motion.div
                animate={{ opacity: hoveredCard === 'branding' ? 0.5 : 0.2 }}
                className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl blur-xl -z-10"
              />

              <div className="relative h-full min-h-[240px] p-6 rounded-2xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-700 shadow-xl hover:shadow-2xl transition-all duration-300">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 shadow-lg mb-4"
                >
                  <Palette className="h-6 w-6 text-white" strokeWidth={2} />
                </motion.div>

                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                  Marca y Estilo
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Colores y logo</p>

                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-2 text-pink-600 dark:text-pink-400 font-medium text-sm"
                >
                  <span>Editar</span>
                  <ArrowRight className="h-4 w-4" />
                </motion.div>
              </div>
            </motion.button>
          </motion.div>

          {/* Avanzado Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <motion.button
              type="button"
              onHoverStart={() => setHoveredCard('avanzado')}
              onHoverEnd={() => setHoveredCard(null)}
              whileHover={{ scale: 1.05, rotateZ: 3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="relative w-full h-full group"
            >
              <motion.div
                animate={{ opacity: hoveredCard === 'avanzado' ? 0.5 : 0.2 }}
                className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-xl -z-10"
              />

              <div className="relative h-full min-h-[240px] p-6 rounded-2xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-700 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
                <div>
                  <motion.div
                    animate={{ rotate: [0, 180, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg mb-4"
                  >
                    <Settings className="h-6 w-6 text-white" strokeWidth={2} />
                  </motion.div>

                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Avanzado</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Más opciones</p>
                </div>

                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30"
                >
                  <ArrowRight className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </motion.div>
              </div>
            </motion.button>
          </motion.div>
        </div>

        {/* Features showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-200 dark:border-zinc-700"
        >
          <div className="flex items-center gap-3 mb-6">
            <Zap className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Características de esta versión
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: 'Bento Grid Asimétrico',
                desc: 'Hero card 2x con jerarquía visual clara',
              },
              {
                title: 'Spring Animations',
                desc: 'Física realista en todas las interacciones',
              },
              {
                title: 'Gradientes Mesh',
                desc: 'Fondos con múltiples capas y profundidad',
              },
              {
                title: 'Tipografía Dramática',
                desc: 'Escala 64px con contraste marcado',
              },
              {
                title: '3D Hover Effects',
                desc: 'Transforms con perspectiva y rotación',
              },
              {
                title: 'Micro-animaciones',
                desc: 'Elementos que respiran y se mueven sutilmente',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-4 rounded-xl bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm"
              >
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
