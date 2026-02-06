'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Clock,
  Palette,
  Settings,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Phone,
  MessageCircle,
  MapPin,
  Check,
  Save,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

/**
 * OPCIÓN C: PROGRESSIVE DISCLOSURE
 *
 * Características:
 * - Cards que expanden IN-PLACE (no sheets, no overlays)
 * - Layout animations fluidas (Framer Motion layout)
 * - Sin context switching
 * - Mantiene orientación espacial
 * - Experiencia única y continua
 * - Balance entre visual y funcional
 */

type Section = 'general' | 'horario' | 'branding' | 'avanzado' | null

export default function ConfiguracionDemoC() {
  const router = useRouter()
  const [expandedSection, setExpandedSection] = useState<Section>(null)

  // Form state (mock)
  const [formData, setFormData] = useState({
    name: 'Barbería Test',
    phone: '2222-3333',
    whatsapp: '87175866',
    address: 'San José, Costa Rica',
  })

  const [hasChanges, setHasChanges] = useState(false)

  const toggleSection = (section: Section) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-bold uppercase tracking-wider text-purple-600">
                  Demo C: Progressive Disclosure
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-white mb-2">
                Configuración
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Expande las secciones para editarlas sin perder contexto
              </p>
            </div>

            <Button variant="outline" size="sm" onClick={() => router.push('/configuracion')}>
              ← Volver
            </Button>
          </div>

          {/* Save bar */}
          <AnimatePresence>
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex items-center justify-between"
              >
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  Tienes cambios sin guardar
                </p>
                <Button size="sm" className="gap-2">
                  <Save className="h-4 w-4" />
                  Guardar Cambios
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Cards with progressive disclosure */}
        <motion.div layout className="space-y-4">
          {/* General Card */}
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <motion.button
              layout="position"
              onClick={() => toggleSection('general')}
              className="w-full p-6 flex items-center gap-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <motion.div
                layout
                className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg"
              >
                <Building2 className="h-7 w-7 text-white" strokeWidth={2} />
              </motion.div>

              <motion.div layout="position" className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">
                  Información General
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {expandedSection === 'general'
                    ? 'Edita los datos de tu negocio'
                    : 'Nombre, contacto y dirección'}
                </p>
              </motion.div>

              <motion.div layout className="flex-shrink-0">
                {expandedSection === 'general' ? (
                  <ChevronUp className="h-5 w-5 text-zinc-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-zinc-400" />
                )}
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {expandedSection === 'general' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="overflow-hidden"
                >
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6 pt-0 space-y-4 border-t border-zinc-200 dark:border-zinc-700 mt-2"
                  >
                    <Input
                      label="Nombre del negocio"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                        setHasChanges(true)
                      }}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Teléfono"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, phone: e.target.value }))
                          setHasChanges(true)
                        }}
                        icon={Phone}
                      />
                      <Input
                        label="WhatsApp"
                        value={formData.whatsapp}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))
                          setHasChanges(true)
                        }}
                        icon={MessageCircle}
                      />
                    </div>

                    <Input
                      label="Dirección"
                      value={formData.address}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, address: e.target.value }))
                        setHasChanges(true)
                      }}
                      icon={MapPin}
                    />

                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setExpandedSection(null)
                          setHasChanges(false)
                        }}
                        className="gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Listo
                      </Button>
                      <button
                        onClick={() => setExpandedSection(null)}
                        className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                      >
                        Cancelar
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Horario Card */}
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
            className="rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <motion.button
              layout="position"
              onClick={() => toggleSection('horario')}
              className="w-full p-6 flex items-center gap-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <motion.div
                layout
                className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg"
              >
                <Clock className="h-7 w-7 text-white" strokeWidth={2} />
              </motion.div>

              <motion.div layout="position" className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">
                  Horario de Atención
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {expandedSection === 'horario'
                    ? 'Configura tus días y horarios'
                    : 'Días y horas de operación'}
                </p>
              </motion.div>

              <motion.div layout className="flex-shrink-0">
                {expandedSection === 'horario' ? (
                  <ChevronUp className="h-5 w-5 text-zinc-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-zinc-400" />
                )}
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {expandedSection === 'horario' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="overflow-hidden"
                >
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6 pt-0 space-y-4 border-t border-zinc-200 dark:border-zinc-700 mt-2"
                  >
                    <div className="p-8 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-center">
                      <Clock className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                      <p className="text-sm text-purple-900 dark:text-purple-300">
                        Controles de horario aquí (toggles, time pickers, etc.)
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button size="sm" onClick={() => setExpandedSection(null)} className="gap-2">
                        <Check className="h-4 w-4" />
                        Listo
                      </Button>
                      <button
                        onClick={() => setExpandedSection(null)}
                        className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                      >
                        Cancelar
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Branding Card */}
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.2 }}
            className="rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <motion.button
              layout="position"
              onClick={() => toggleSection('branding')}
              className="w-full p-6 flex items-center gap-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <motion.div
                layout
                className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg"
              >
                <Palette className="h-7 w-7 text-white" strokeWidth={2} />
              </motion.div>

              <motion.div layout="position" className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">
                  Marca y Estilo
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {expandedSection === 'branding'
                    ? 'Personaliza tu identidad visual'
                    : 'Colores y logo'}
                </p>
              </motion.div>

              <motion.div layout className="flex-shrink-0">
                {expandedSection === 'branding' ? (
                  <ChevronUp className="h-5 w-5 text-zinc-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-zinc-400" />
                )}
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {expandedSection === 'branding' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="overflow-hidden"
                >
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6 pt-0 space-y-4 border-t border-zinc-200 dark:border-zinc-700 mt-2"
                  >
                    <div className="p-8 rounded-xl bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800 text-center">
                      <Palette className="h-12 w-12 text-pink-600 mx-auto mb-3" />
                      <p className="text-sm text-pink-900 dark:text-pink-300">
                        Color picker y logo upload aquí
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button size="sm" onClick={() => setExpandedSection(null)} className="gap-2">
                        <Check className="h-4 w-4" />
                        Listo
                      </Button>
                      <button
                        onClick={() => setExpandedSection(null)}
                        className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                      >
                        Cancelar
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Avanzado Card */}
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.3 }}
            className="rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <motion.button
              layout="position"
              onClick={() => toggleSection('avanzado')}
              className="w-full p-6 flex items-center gap-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <motion.div
                layout
                className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg"
              >
                <Settings className="h-7 w-7 text-white" strokeWidth={2} />
              </motion.div>

              <motion.div layout="position" className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">
                  Configuración Avanzada
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {expandedSection === 'avanzado'
                    ? 'Notificaciones, lealtad y más'
                    : 'Opciones adicionales'}
                </p>
              </motion.div>

              <motion.div layout className="flex-shrink-0">
                {expandedSection === 'avanzado' ? (
                  <ChevronUp className="h-5 w-5 text-zinc-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-zinc-400" />
                )}
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {expandedSection === 'avanzado' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="overflow-hidden"
                >
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6 pt-0 space-y-4 border-t border-zinc-200 dark:border-zinc-700 mt-2"
                  >
                    <div className="p-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center">
                      <Settings className="h-12 w-12 text-amber-600 mx-auto mb-3" />
                      <p className="text-sm text-amber-900 dark:text-amber-300">
                        Notificaciones, lealtad y otras configuraciones
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button size="sm" onClick={() => setExpandedSection(null)} className="gap-2">
                        <Check className="h-4 w-4" />
                        Listo
                      </Button>
                      <button
                        onClick={() => setExpandedSection(null)}
                        className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                      >
                        Cancelar
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Features showcase */}
        <motion.div
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800"
        >
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
            Características de esta versión
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {[
              'Expande in-place (sin overlays)',
              'Layout animations fluidas',
              'Sin pérdida de contexto',
              'Balance visual/funcional',
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300"
              >
                <Check className="h-4 w-4 text-purple-600 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
