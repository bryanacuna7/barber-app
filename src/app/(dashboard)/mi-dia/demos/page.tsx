'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  LayoutGrid,
  PanelLeftClose,
  Film,
  Zap,
  Clock,
  Star,
  TrendingUp,
  Award,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

/**
 * Mi Día Demos Navigation Hub
 *
 * Comparison page for 3 redesign options:
 * - Demo A: Bento Grid Command Center (9.5/10)
 * - Demo B: Split Dashboard Pro (7/10)
 * - Demo C: Timeline Cinema (8.5/10)
 */
export default function MiDiaDemosPage() {
  const router = useRouter()

  const demos = [
    {
      id: 'demo-a',
      path: '/mi-dia/demos/preview-a',
      name: 'Bento Grid Command Center',
      tagline: 'Máximo impacto visual con inteligencia de diseño',
      score: 9.5,
      icon: LayoutGrid,
      gradient: 'from-blue-500 via-purple-500 to-pink-500',
      features: [
        'Hero card 2x con countdown a próxima cita',
        'Grid asimétrico con tarjetas de diferentes tamaños',
        'Timeline horizontal con scroll fluido',
        'Gradientes mesh animados',
        'Efectos 3D en hover con perspectiva',
        'Animaciones spring con breathing',
      ],
      bestFor: ['Impresionar', 'Dashboard moderno', 'Usuarios visuales', 'Página principal'],
      effort: '19-25h',
      pros: [
        'Máximo impacto visual (9.5/10)',
        'Diseño memorable tipo awwwards',
        'Jerarquía clara con hero card',
        'Muy satisfactorio de usar',
      ],
      cons: [
        'Requiere más espacio en pantalla',
        'Puede distraer a usuarios enfocados en tareas',
        'Más complejo de implementar',
      ],
    },
    {
      id: 'demo-b',
      path: '/mi-dia/demos/preview-b',
      name: 'Split Dashboard Pro',
      tagline: 'Máxima eficiencia para power users',
      score: 7.0,
      icon: PanelLeftClose,
      gradient: 'from-slate-500 to-zinc-600',
      features: [
        'Panel izquierdo permanente con timeline',
        'Panel central con detalles de cita seleccionada',
        'Panel derecho con stats y acciones rápidas',
        'Edición inline (simulada en demo)',
        'Atajos de teclado (j/k para navegar)',
        'Buscador integrado',
      ],
      bestFor: ['Power users', 'Desktop primero', 'Multitasking', 'Flujo de trabajo rápido'],
      effort: '21-27h',
      pros: [
        'Muy eficiente para desktop',
        'Toda la info visible sin scroll',
        'Atajos de teclado productivos',
        'Edición rápida',
      ],
      cons: [
        'Menos impacto visual (7/10)',
        'No funciona bien en mobile',
        'Puede sentirse corporativo/aburrido',
        'Requiere pantalla grande',
      ],
    },
    {
      id: 'demo-c',
      path: '/mi-dia/demos/preview-c',
      name: 'Timeline Cinema',
      tagline: 'Experiencia cinemática con storytelling temporal',
      score: 8.5,
      icon: Film,
      gradient: 'from-purple-500 via-pink-500 to-orange-500',
      features: [
        'Timeline horizontal como protagonista',
        'Hero banner con próxima cita destacada',
        'Scroll-linked animations (parallax, scale)',
        'Marcadores de tiempo visuales (8am-8pm)',
        'Indicador de hora actual animado',
        'Tarjetas conectadas a línea de tiempo',
      ],
      bestFor: ['Narrativa visual', 'Contexto temporal', 'Experiencia inmersiva', 'Mobile-friendly'],
      effort: '18-24h',
      pros: [
        'Muy visual y atractivo (8.5/10)',
        'Contexto temporal claro',
        'Scroll natural y satisfactorio',
        'Balance entre función y diseño',
      ],
      cons: [
        'Requiere scroll horizontal (no estándar)',
        'Puede ser confuso inicialmente',
        'Menos eficiente para muchas citas',
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-30">
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-yellow-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Mi Día - Demos
            </h1>
          </div>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            3 enfoques diferentes para tu dashboard. Compara y elige el que mejor se adapte a tu flujo de trabajo.
          </p>

          {/* Back button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <Button
              variant="ghost"
              onClick={() => router.push('/mi-dia')}
              className="text-zinc-500 hover:text-white"
            >
              ← Volver a Mi Día original
            </Button>
          </motion.div>
        </motion.div>

        {/* Demo Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {demos.map((demo, index) => (
            <DemoCard key={demo.id} demo={demo} index={index} router={router} />
          ))}
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Award className="h-6 w-6 text-yellow-400" />
            Comparación Rápida
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-4 text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                    Criterio
                  </th>
                  <th className="pb-4 text-sm font-semibold text-blue-400 text-center">Demo A</th>
                  <th className="pb-4 text-sm font-semibold text-slate-400 text-center">Demo B</th>
                  <th className="pb-4 text-sm font-semibold text-purple-400 text-center">Demo C</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <ComparisonRow
                  label="Awwwards Score"
                  values={['9.5/10', '7.0/10', '8.5/10']}
                  highlight={0}
                />
                <ComparisonRow
                  label="Impacto Visual"
                  values={['Máximo', 'Mínimo', 'Alto']}
                  highlight={0}
                />
                <ComparisonRow
                  label="Eficiencia Desktop"
                  values={['Media', 'Máxima', 'Media']}
                  highlight={1}
                />
                <ComparisonRow
                  label="Mobile UX"
                  values={['Buena', 'Pobre', 'Excelente']}
                  highlight={2}
                />
                <ComparisonRow
                  label="Storytelling"
                  values={['Medio', 'Bajo', 'Alto']}
                  highlight={2}
                />
                <ComparisonRow
                  label="Esfuerzo"
                  values={['19-25h', '21-27h', '18-24h']}
                  highlight={2}
                />
                <ComparisonRow
                  label="Mejor Para"
                  values={['Impresionar', 'Productividad', 'Balance']}
                  highlight={null}
                />
              </tbody>
            </table>
          </div>

          {/* Recommendation */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/20 flex-shrink-0">
                <Star className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Recomendación</h3>
                <p className="text-zinc-300 leading-relaxed">
                  Para <strong>Mi Día</strong>, recomendamos <strong className="text-blue-400">Demo A: Bento Grid Command Center</strong>.
                  Es tu página de inicio (home), el punto de entrada cada mañana - debe impresionar y energizar.
                  El hero card con countdown crea urgencia positiva, y el bento grid hace el dashboard memorable.
                  El esfuerzo adicional (19-25h) vale la pena para la página más visitada.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Analysis Document Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-zinc-500">
            Para análisis completo con problemas identificados y arquitectura detallada, ver{' '}
            <button
              onClick={() => router.push('/MI_DIA_AWWWARDS_ANALYSIS.md')}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              MI_DIA_AWWWARDS_ANALYSIS.md
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

// Demo Card Component
function DemoCard({
  demo,
  index,
  router,
}: {
  demo: {
    id: string
    path: string
    name: string
    tagline: string
    score: number
    icon: any
    gradient: string
    features: string[]
    bestFor: string[]
    effort: string
    pros: string[]
    cons: string[]
  }
  index: number
  router: any
}) {
  const [isHovered, setIsHovered] = useState(false)
  const Icon = demo.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: index * 0.1,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      {/* Glow effect */}
      <motion.div
        animate={{
          opacity: isHovered ? 0.5 : 0.3,
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ duration: 0.3 }}
        className={`absolute -inset-1 bg-gradient-to-r ${demo.gradient} rounded-3xl blur-2xl -z-10`}
      />

      {/* Card */}
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-8 flex flex-col"
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${demo.gradient}`}>
              <Icon className="h-7 w-7 text-white" />
            </div>

            {/* Score badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-bold text-yellow-300">{demo.score}/10</span>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">{demo.name}</h3>
          <p className="text-sm text-zinc-400">{demo.tagline}</p>
        </div>

        {/* Features */}
        <div className="mb-6 flex-1">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Características
          </h4>
          <ul className="space-y-2">
            {demo.features.slice(0, 4).map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <Zap className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Best For */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Ideal Para
          </h4>
          <div className="flex flex-wrap gap-2">
            {demo.bestFor.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-zinc-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Pros/Cons Quick Summary */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-semibold text-emerald-400 mb-2">Pros</h4>
            <p className="text-xs text-zinc-400">{demo.pros.length} ventajas</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-amber-400 mb-2">Cons</h4>
            <p className="text-xs text-zinc-400">{demo.cons.length} consideraciones</p>
          </div>
        </div>

        {/* Effort estimate */}
        <div className="mb-6 p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">Esfuerzo estimado</span>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-zinc-400" />
              <span className="text-sm font-bold text-white">{demo.effort}</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => router.push(demo.path)}
          className={`w-full bg-gradient-to-r ${demo.gradient} text-white font-semibold shadow-lg hover:shadow-xl transition-all group`}
        >
          Ver Demo en Vivo
          <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    </motion.div>
  )
}

// Comparison Row Component
function ComparisonRow({
  label,
  values,
  highlight,
}: {
  label: string
  values: [string, string, string]
  highlight: number | null
}) {
  return (
    <tr>
      <td className="py-3 text-sm text-zinc-400">{label}</td>
      {values.map((value, i) => (
        <td
          key={i}
          className={cn(
            'py-3 text-sm text-center font-medium',
            highlight === i ? 'text-white bg-white/5' : 'text-zinc-400'
          )}
        >
          {value}
        </td>
      ))}
    </tr>
  )
}
