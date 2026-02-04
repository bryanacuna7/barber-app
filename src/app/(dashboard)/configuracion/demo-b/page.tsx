'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Clock,
  Palette,
  Settings,
  Bell,
  Gift,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  Scissors,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

/**
 * OPCIÓN B: DASHBOARD SPLIT
 *
 * Características:
 * - Sidebar permanente con navegación
 * - Preview area live (sin necesidad de guardar)
 * - No sheets, todo inline
 * - Split-screen desktop-first
 * - Más funcional, menos visual
 * - Workflow optimizado para power users
 */

type Section = 'general' | 'horario' | 'branding' | 'notificaciones' | 'lealtad' | 'avanzado'

export default function ConfiguracionDemoB() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<Section>('general')
  const [previewVisible, setPreviewVisible] = useState(true)

  // Form state (mock)
  const [formData, setFormData] = useState({
    name: 'Barbería Test',
    phone: '2222-3333',
    whatsapp: '87175866',
    address: 'San José, Costa Rica',
    brandColor: '#3b82f6',
  })

  const navigationItems = [
    { id: 'general' as Section, label: 'General', icon: Building2, color: 'blue' },
    { id: 'horario' as Section, label: 'Horario', icon: Clock, color: 'purple' },
    { id: 'branding' as Section, label: 'Branding', icon: Palette, color: 'pink' },
    { id: 'notificaciones' as Section, label: 'Notificaciones', icon: Bell, color: 'green' },
    { id: 'lealtad' as Section, label: 'Lealtad', icon: Gift, color: 'amber' },
    { id: 'avanzado' as Section, label: 'Avanzado', icon: Settings, color: 'zinc' },
  ]

  return (
    <div className="h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Top bar */}
      <div className="flex-shrink-0 h-16 px-6 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/configuracion')}
          >
            ← Volver
          </Button>

          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Demo B: Dashboard Split
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setPreviewVisible(!previewVisible)}
          className="gap-2"
        >
          {previewVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {previewVisible ? 'Ocultar' : 'Mostrar'} Preview
        </Button>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar navigation */}
        <div className="flex-shrink-0 w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4 px-3">
              Configuración
            </h2>

            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id

                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all
                      ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-medium'
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                    <span className="text-sm">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"
                      />
                    )}
                  </motion.button>
                )
              })}
            </nav>
          </div>

          {/* Features showcase */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 mt-auto">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                Características
              </h3>
              <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-blue-600" />
                  Sidebar permanente
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-blue-600" />
                  Preview en vivo
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-blue-600" />
                  Sin modales
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-blue-600" />
                  Workflow rápido
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeSection === 'general' && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                        Información General
                      </h1>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Datos básicos de tu negocio
                      </p>
                    </div>

                    <div className="space-y-4">
                      <Input
                        label="Nombre del negocio"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, name: e.target.value }))
                        }
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Teléfono"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, phone: e.target.value }))
                          }
                        />
                        <Input
                          label="WhatsApp"
                          value={formData.whatsapp}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))
                          }
                        />
                      </div>

                      <Input
                        label="Dirección"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, address: e.target.value }))
                        }
                      />
                    </div>

                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                        Los cambios se aplican automáticamente en el preview →
                      </p>
                      <Button size="lg" className="w-full sm:w-auto">
                        Guardar Cambios
                      </Button>
                    </div>
                  </div>
                )}

                {activeSection === 'horario' && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                        Horario de Atención
                      </h1>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Configura tus días y horas de operación
                      </p>
                    </div>

                    <div className="p-8 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-center">
                      <Clock className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Controles de horario aquí
                      </p>
                    </div>
                  </div>
                )}

                {activeSection === 'branding' && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                        Marca y Estilo
                      </h1>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Personaliza colores y logo
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                        Color principal
                      </label>
                      <input
                        type="color"
                        value={formData.brandColor}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, brandColor: e.target.value }))
                        }
                        className="w-full h-20 rounded-xl cursor-pointer"
                      />
                    </div>

                    <div className="p-8 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-center">
                      <Palette className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Upload de logo y más opciones
                      </p>
                    </div>
                  </div>
                )}

                {activeSection === 'notificaciones' && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                        Notificaciones
                      </h1>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Configura alertas y recordatorios
                      </p>
                    </div>

                    <div className="p-8 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-center">
                      <Bell className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Preferencias de notificaciones
                      </p>
                    </div>
                  </div>
                )}

                {activeSection === 'lealtad' && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                        Programa de Lealtad
                      </h1>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Recompensas para clientes frecuentes
                      </p>
                    </div>

                    <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 text-center">
                      <Gift className="h-12 w-12 text-amber-600 mx-auto mb-4" />
                      <p className="text-amber-900 dark:text-amber-300 font-medium">
                        Configura tu programa de puntos y recompensas
                      </p>
                    </div>
                  </div>
                )}

                {activeSection === 'avanzado' && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                        Configuración Avanzada
                      </h1>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Opciones para usuarios avanzados
                      </p>
                    </div>

                    <div className="p-8 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-center">
                      <Settings className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Más configuraciones aquí
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Preview area */}
        <AnimatePresence>
          {previewVisible && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="flex-shrink-0 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto"
            >
              <div className="p-6 sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold text-zinc-900 dark:text-white">
                    Vista Previa en Vivo
                  </h3>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Los cambios se muestran instantáneamente
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Preview card */}
                <div className="rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-800">
                  {/* Header with brand color */}
                  <div
                    className="h-24 flex items-center justify-center"
                    style={{ backgroundColor: formData.brandColor }}
                  >
                    <Scissors className="h-10 w-10 text-white" />
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">
                        {formData.name}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {formData.address}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                        <span className="font-medium">📞</span>
                        {formData.phone}
                      </div>
                      <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                        <span className="font-medium">💬</span>
                        {formData.whatsapp}
                      </div>
                    </div>

                    <button
                      className="w-full py-3 rounded-xl font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                      style={{ backgroundColor: formData.brandColor }}
                    >
                      Reservar Ahora
                    </button>
                  </div>
                </div>

                {/* Info box */}
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-900 dark:text-blue-300">
                    <strong>💡 Tip:</strong> Todos los cambios se reflejan aquí en tiempo real.
                    Cuando estés satisfecho, guarda los cambios.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
