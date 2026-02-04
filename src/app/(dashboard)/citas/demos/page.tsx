'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Zap, LayoutGrid, ArrowRight, Award, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

/**
 * Navigation hub para comparar 3 diseños de CITAS
 */

const demos = [
  {
    id: 'a',
    path: '/citas/demos/preview-a',
    title: 'Timeline Command Center',
    subtitle: 'Power User Paradise',
    score: '8.5/10',
    effort: '28-35h',
    style: 'Brutalist Professional',
    color: 'from-orange-500 to-red-500',
    bgGradient: 'from-orange-950/20 to-red-950/20',
    features: [
      'Timeline horizontal tipo DAW',
      'Revenue stats en header',
      'Command palette ⌘K',
      'Keyboard shortcuts legend',
      'Time density heatmap',
      'Drag & drop rescheduling',
    ],
    bestFor: 'Power users, 15+ citas/día, keyboard warriors',
    icon: <Zap className="w-8 h-8" />,
  },
  {
    id: 'b',
    path: '/citas/demos/preview-b',
    title: 'Calendar Cinema',
    subtitle: 'Visual Storytelling',
    score: '9/10',
    effort: '32-40h',
    style: 'Glassmorphism Cinema',
    color: 'from-blue-500 to-purple-500',
    bgGradient: 'from-blue-950/20 to-purple-950/20',
    features: [
      'Time blocks con % ocupancy',
      'Gap opportunities destacados',
      'Quick actions context-aware',
      'Revenue storytelling',
      'Mesh gradients animados',
      'Hero date con personality',
    ],
    bestFor: 'Barbers que optimizan revenue, visualización clara',
    icon: <Calendar className="w-8 h-8" />,
  },
  {
    id: 'b-enhanced',
    path: '/citas/demos/preview-b-enhanced',
    title: 'Calendar Cinema Enhanced',
    subtitle: 'Multi-View + Drag & Drop',
    score: '9.3/10',
    effort: '44-58h',
    style: 'Glassmorphism Cinema Pro',
    color: 'from-blue-500 via-purple-500 to-pink-500',
    bgGradient: 'from-blue-950/20 via-purple-950/20 to-pink-950/20',
    features: [
      'Multiple views: TODAY / WEEK / MONTH',
      'Drag & drop rescheduling',
      'Mini timeline horizontal (quick scan)',
      'Mobile-optimized responsive',
      'Click día en week/month → TODAY view',
      'All Cinema features + Google Calendar UX',
    ],
    bestFor: 'Todos los barbers - combina belleza + funcionalidad completa',
    icon: <Calendar className="w-8 h-8" />,
  },
  {
    id: 'b-fusion',
    path: '/citas/demos/preview-b-fusion',
    title: 'Calendar Cinema + macOS Polish',
    subtitle: 'Cinema + Apple Refinement',
    score: '9.8/10',
    effort: '52-70h',
    style: 'Cinema + macOS Professional',
    color: 'from-red-500 via-purple-500 to-blue-500',
    bgGradient: 'from-red-950/20 via-purple-950/20 to-blue-950/20',
    features: [
      'Mini calendar sidebar (RIGHT) - macOS style',
      'Current time indicator mejorado (red line + dot)',
      'Large date header (4 Wednesday)',
      'Week grid con timeline compartida (LEFT)',
      'All Day section para eventos especiales',
      'Cinema blocks + gaps + revenue (valor agregado)',
    ],
    bestFor: 'MÁXIMO POLISH - fusión de Cinema storytelling + macOS familiarity',
    icon: <Calendar className="w-8 h-8" />,
    recommended: true,
  },
  {
    id: 'c',
    path: '/citas/demos/preview-c',
    title: 'Grid Kanban Pro',
    subtitle: 'Workflow Optimization',
    score: '8/10',
    effort: '30-38h',
    style: 'Bento Grid Kanban',
    color: 'from-green-500 to-cyan-500',
    bgGradient: 'from-green-950/20 to-cyan-950/20',
    features: [
      'Kanban por workflow status',
      'Drag entre columnas = cambio estado',
      'Collapsed completadas (solo count)',
      'Batch actions para multi-select',
      'Real-time collaboration',
      'Presence indicators',
    ],
    bestFor: 'Multi-barber shops, colaboración frecuente',
    icon: <LayoutGrid className="w-8 h-8" />,
  },
]

export default function CitasDemosPage() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Animated mesh background */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-1.5 bg-orange-500/20 border border-orange-400/30 rounded-full text-sm font-bold text-orange-400 mb-4">
            MÓDULO 3 DE 7
          </div>
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            Rediseño CITAS
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            3 propuestas de diseño para calendario de citas
          </p>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto">
            Cada demo representa un approach completamente diferente. Compara funcionalidad,
            estética y workflow. Elige el que mejor se ajuste a tu estilo de trabajo.
          </p>
        </motion.div>

        {/* Demo cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-8 max-w-[1800px] mx-auto mb-16">
          {demos.map((demo, index) => (
            <motion.div
              key={demo.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              onHoverStart={() => setHoveredId(demo.id)}
              onHoverEnd={() => setHoveredId(null)}
              className="relative group"
            >
              {demo.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <div className="px-3 py-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full text-xs font-bold text-white flex items-center gap-1 shadow-lg">
                    <Award className="w-3 h-3" />
                    <span>RECOMENDADO</span>
                  </div>
                </div>
              )}

              <Link href={demo.path}>
                <div className={cn(
                  'bg-white/5 backdrop-blur-xl rounded-2xl border-2 overflow-hidden transition-all duration-300',
                  hoveredId === demo.id
                    ? 'border-white/40 shadow-2xl scale-105'
                    : 'border-white/10 hover:border-white/20'
                )}>
                  {/* Demo header */}
                  <div className={`bg-gradient-to-br ${demo.bgGradient} p-6 border-b border-white/10`}>
                    <div className={`w-16 h-16 bg-gradient-to-br ${demo.color} rounded-2xl flex items-center justify-center mb-4 text-white`}>
                      {demo.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">{demo.title}</h2>
                    <p className="text-sm text-gray-300">{demo.subtitle}</p>
                  </div>

                  {/* Scores */}
                  <div className="p-6 border-b border-white/10">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Awwwards Score</div>
                        <div className={`text-2xl font-bold bg-gradient-to-r ${demo.color} bg-clip-text text-transparent`}>
                          {demo.score}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Esfuerzo</div>
                        <div className="text-lg font-bold text-white">{demo.effort}</div>
                      </div>
                    </div>
                  </div>

                  {/* Style */}
                  <div className="p-6 border-b border-white/10">
                    <div className="text-xs text-gray-500 mb-2">ESTILO VISUAL</div>
                    <div className="text-sm font-bold text-white">{demo.style}</div>
                  </div>

                  {/* Features */}
                  <div className="p-6 border-b border-white/10">
                    <div className="text-xs text-gray-500 mb-3">CARACTERÍSTICAS</div>
                    <ul className="space-y-2">
                      {demo.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${demo.color} mt-2 shrink-0`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Best for */}
                  <div className="p-6">
                    <div className="text-xs text-gray-500 mb-2">IDEAL PARA</div>
                    <div className="text-sm text-gray-300">{demo.bestFor}</div>
                  </div>

                  {/* CTA */}
                  <div className={cn(
                    'p-6 bg-gradient-to-r transition-all duration-300',
                    hoveredId === demo.id
                      ? `${demo.color} opacity-100`
                      : 'from-white/5 to-white/5 opacity-70'
                  )}>
                    <div className="flex items-center justify-between text-white">
                      <span className="font-bold">Ver Demo {demo.id.toUpperCase()}</span>
                      <ArrowRight className={cn(
                        'w-5 h-5 transition-transform duration-300',
                        hoveredId === demo.id ? 'translate-x-1' : ''
                      )} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Comparison matrix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="max-w-7xl mx-auto bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
        >
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white mb-2">Comparación Rápida</h2>
            <p className="text-sm text-gray-400">
              Matriz de decisión para elegir el diseño correcto
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-400">CRITERIO</th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-orange-400">A</th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-blue-400">B</th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-purple-400">B+</th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-red-400">B++ ⭐</th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-green-400">C</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-white/10">
                  <td className="px-4 py-3 text-gray-300">Visual</td>
                  <td className="px-4 py-3 text-center text-white font-bold">8/10</td>
                  <td className="px-4 py-3 text-center text-white font-bold">9/10</td>
                  <td className="px-4 py-3 text-center text-white font-bold">9.5/10</td>
                  <td className="px-4 py-3 text-center text-red-400 font-bold">9.8/10</td>
                  <td className="px-4 py-3 text-center text-white font-bold">7.5/10</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="px-4 py-3 text-gray-300">Function</td>
                  <td className="px-4 py-3 text-center text-white font-bold">9/10</td>
                  <td className="px-4 py-3 text-center text-white font-bold">7/10</td>
                  <td className="px-4 py-3 text-center text-white font-bold">9/10</td>
                  <td className="px-4 py-3 text-center text-red-400 font-bold">9.5/10</td>
                  <td className="px-4 py-3 text-center text-white font-bold">8.5/10</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="px-4 py-3 text-gray-300">Views</td>
                  <td className="px-4 py-3 text-center text-gray-400">Day</td>
                  <td className="px-4 py-3 text-center text-gray-400">Day</td>
                  <td className="px-4 py-3 text-center text-white">3 views</td>
                  <td className="px-4 py-3 text-center text-red-400 font-bold">3 + sidebar</td>
                  <td className="px-4 py-3 text-center text-gray-400">Day</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="px-4 py-3 text-gray-300">Polish</td>
                  <td className="px-4 py-3 text-center text-white">7/10</td>
                  <td className="px-4 py-3 text-center text-white">8/10</td>
                  <td className="px-4 py-3 text-center text-white">8.5/10</td>
                  <td className="px-4 py-3 text-center text-red-400 font-bold">10/10</td>
                  <td className="px-4 py-3 text-center text-white">7/10</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="px-4 py-3 text-gray-300">Mobile</td>
                  <td className="px-4 py-3 text-center text-white">7/10</td>
                  <td className="px-4 py-3 text-center text-white">8/10</td>
                  <td className="px-4 py-3 text-center text-white">9/10</td>
                  <td className="px-4 py-3 text-center text-red-400 font-bold">9/10</td>
                  <td className="px-4 py-3 text-center text-white">6/10</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-300 font-bold">Score</td>
                  <td className="px-4 py-3 text-center text-orange-400 font-bold">8.5</td>
                  <td className="px-4 py-3 text-center text-blue-400 font-bold">9.0</td>
                  <td className="px-4 py-3 text-center text-purple-400 font-bold">9.3</td>
                  <td className="px-4 py-3 text-center text-red-400 font-bold text-lg">9.8</td>
                  <td className="px-4 py-3 text-center text-green-400 font-bold">8.0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recommendation box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="max-w-4xl mx-auto mt-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-2xl border border-blue-400/30 p-8"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">
                💡 Recomendación del UI/UX Team
              </h3>
              <p className="text-gray-300 mb-4">
                <strong className="text-red-400">OPCIÓN B FUSION: Cinema + macOS Polish</strong> es la elección ideal - score 9.8/10:
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-red-400 rounded-full mt-2 shrink-0" />
                  <span><strong>macOS Calendar familiarity</strong> - mini calendar sidebar, clean grid, red time indicator = cero learning curve</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-red-400 rounded-full mt-2 shrink-0" />
                  <span><strong>Cinema storytelling preservado</strong> - time blocks, gaps, revenue progress = valor agregado único</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-red-400 rounded-full mt-2 shrink-0" />
                  <span><strong>Professional polish</strong> - #1C1C1E background, subtle grid lines, Apple-quality refinement</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-red-400 rounded-full mt-2 shrink-0" />
                  <span><strong>Week view con shared timeline</strong> - 7 columns + timeline left = efficient scanning</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-red-400 rounded-full mt-2 shrink-0" />
                  <span><strong>Mejor de ambos mundos</strong> - belleza + funcionalidad + familiarity = 9.8/10</span>
                </li>
              </ul>
              <div className="mt-4 pt-4 border-t border-white/10 text-xs text-gray-400">
                Compara B (original) → B+ (enhanced) → B++ (fusion) para ver la evolución
              </div>
            </div>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 text-sm">
            Explora cada demo, interactúa con las funcionalidades, y decide cuál implementar.
            <br />
            ¿Preguntas? Vuelve aquí para revisar la comparación.
          </p>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(40px, 30px) scale(1.05);
          }
        }

        .animate-blob {
          animation: blob 20s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
