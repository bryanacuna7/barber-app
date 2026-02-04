'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Search, X, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Fuse from 'fuse.js'
import { cn } from '@/lib/utils'

// All searchable settings with keywords
const SEARCHABLE_SETTINGS = [
  // General Tab
  {
    id: 'business-name',
    title: 'Nombre del negocio',
    description: 'Cambiar el nombre de tu barbería',
    keywords: ['nombre', 'negocio', 'barbería', 'empresa', 'tienda'],
    tab: 'general',
    section: 'info',
  },
  {
    id: 'phone',
    title: 'Teléfono',
    description: 'Número de contacto principal',
    keywords: ['teléfono', 'contacto', 'llamar', 'número'],
    tab: 'general',
    section: 'info',
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp',
    description: 'Número de WhatsApp para mensajes',
    keywords: ['whatsapp', 'mensaje', 'chat', 'contacto'],
    tab: 'general',
    section: 'info',
  },
  {
    id: 'address',
    title: 'Dirección',
    description: 'Ubicación física del negocio',
    keywords: ['dirección', 'ubicación', 'lugar', 'local', 'donde'],
    tab: 'general',
    section: 'info',
  },
  {
    id: 'booking-link',
    title: 'Enlace de Reservas',
    description: 'Página pública para que clientes reserven',
    keywords: ['reservas', 'enlace', 'link', 'público', 'compartir'],
    tab: 'general',
    section: 'booking',
  },

  // Horario Tab
  {
    id: 'operating-hours',
    title: 'Horario de Atención',
    description: 'Días y horas de apertura',
    keywords: ['horario', 'horas', 'apertura', 'cerrado', 'abierto', 'días'],
    tab: 'horario',
    section: 'hours',
  },
  {
    id: 'buffer-time',
    title: 'Tiempo entre citas',
    description: 'Minutos extra entre cada reserva',
    keywords: ['buffer', 'tiempo', 'citas', 'espacio', 'minutos'],
    tab: 'horario',
    section: 'booking-config',
  },
  {
    id: 'advance-booking',
    title: 'Días de anticipación',
    description: 'Con cuánta anticipación pueden reservar',
    keywords: ['anticipación', 'días', 'adelantado', 'reservar', 'futuro'],
    tab: 'horario',
    section: 'booking-config',
  },

  // Branding Tab
  {
    id: 'brand-color',
    title: 'Color principal',
    description: 'Color de tu marca',
    keywords: ['color', 'marca', 'branding', 'primario', 'tema'],
    tab: 'branding',
    section: 'brand',
  },
  {
    id: 'logo',
    title: 'Logo del negocio',
    description: 'Sube el logo de tu barbería',
    keywords: ['logo', 'imagen', 'marca', 'icono', 'subir'],
    tab: 'branding',
    section: 'brand',
  },

  // Avanzado Tab
  {
    id: 'notifications',
    title: 'Notificaciones',
    description: 'Configura alertas y recordatorios',
    keywords: ['notificaciones', 'alertas', 'recordatorios', 'avisos'],
    tab: 'avanzado',
    section: 'notifications',
  },
  {
    id: 'loyalty',
    title: 'Programa de Lealtad',
    description: 'Recompensas para clientes frecuentes',
    keywords: ['lealtad', 'puntos', 'recompensas', 'programa', 'fidelidad'],
    tab: 'avanzado',
    section: 'loyalty',
  },
  {
    id: 'logout',
    title: 'Cerrar sesión',
    description: 'Salir de tu cuenta',
    keywords: ['cerrar', 'sesión', 'logout', 'salir', 'desconectar'],
    tab: 'avanzado',
    section: 'session',
  },
]

interface SettingsSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (tabId: string, settingId: string) => void
}

export function SettingsSearchModal({ isOpen, onClose, onNavigate }: SettingsSearchModalProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(
    () =>
      new Fuse(SEARCHABLE_SETTINGS, {
        keys: ['title', 'description', 'keywords'],
        threshold: 0.3,
        includeScore: true,
      }),
    []
  )

  // Search results
  const results = useMemo(() => {
    if (!query.trim()) {
      return SEARCHABLE_SETTINGS.slice(0, 8) // Show recent/popular
    }
    return fuse.search(query).map((result) => result.item)
  }, [query, fuse])

  // Reset on open
  useEffect(() => {
    if (!isOpen) return

    // Reset state for fresh modal
    const timer = setTimeout(() => {
      setQuery('')
      setSelectedIndex(0)
      inputRef.current?.focus()
    }, 50)

    return () => clearTimeout(timer)
  }, [isOpen])

  const handleSelect = useCallback(
    (setting: (typeof SEARCHABLE_SETTINGS)[0]) => {
      onNavigate(setting.tab, setting.id)
      onClose()
    },
    [onNavigate, onClose]
  )

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % results.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault()
        handleSelect(results[selectedIndex])
      } else if (e.key === 'Escape') {
        onClose()
      }
    },
    [results, selectedIndex, onClose, handleSelect]
  )

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border-2 border-zinc-200 dark:border-zinc-700 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-200 dark:border-zinc-700">
                <Search className="h-5 w-5 text-zinc-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setSelectedIndex(0)
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Buscar configuraciones..."
                  className="flex-1 bg-transparent text-[15px] text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
                  aria-label="Buscar configuraciones"
                />
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Cerrar búsqueda"
                >
                  <X className="h-4 w-4 text-zinc-500" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[400px] overflow-y-auto">
                {results.length > 0 ? (
                  <div className="p-2">
                    {results.map((setting, index) => (
                      <button
                        key={setting.id}
                        onClick={() => handleSelect(setting)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer text-left',
                          index === selectedIndex
                            ? 'bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800'
                            : 'border-2 border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              'text-[15px] font-semibold mb-0.5',
                              index === selectedIndex
                                ? 'text-blue-700 dark:text-blue-400'
                                : 'text-zinc-900 dark:text-white'
                            )}
                          >
                            {setting.title}
                          </p>
                          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 truncate">
                            {setting.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400">
                          <span className="text-[11px] uppercase font-semibold px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800">
                            {setting.tab}
                          </span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-[15px] text-zinc-500 dark:text-zinc-400 mb-2">
                      No se encontraron configuraciones
                    </p>
                    <p className="text-[13px] text-zinc-400">Intenta con otras palabras clave</p>
                  </div>
                )}
              </div>

              {/* Footer - Keyboard shortcuts hint */}
              <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-[12px] text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 font-mono">
                      ↑↓
                    </kbd>
                    Navegar
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 font-mono">
                      ↵
                    </kbd>
                    Seleccionar
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 font-mono">
                      esc
                    </kbd>
                    Cerrar
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
