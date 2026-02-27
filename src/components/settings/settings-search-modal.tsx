'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  X,
  ArrowRight,
  Store,
  Phone,
  MessageCircle,
  MapPin,
  Link2,
  Clock,
  Timer,
  CalendarClock,
  Palette,
  Image,
  Bell,
  Gift,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Fuse from 'fuse.js'
import { cn } from '@/lib/utils'

// Icon mapping for each setting
const SETTING_ICONS = {
  'business-name': Store,
  phone: Phone,
  whatsapp: MessageCircle,
  address: MapPin,
  'booking-link': Link2,
  'operating-hours': Clock,
  'buffer-time': Timer,
  'advance-booking': CalendarClock,
  'brand-color': Palette,
  logo: Image,
  notifications: Bell,
  loyalty: Gift,
  logout: LogOut,
}

// Category colors
const CATEGORY_COLORS = {
  general: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
  horario: {
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
  },
  branding: {
    bg: 'bg-pink-500/10 dark:bg-pink-500/20',
    text: 'text-pink-700 dark:text-pink-300',
    border: 'border-pink-200 dark:border-pink-800',
  },
  avanzado: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
  },
}

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
  onNavigate?: (tabId: string, settingId: string) => void
}

export function SettingsSearchModal({ isOpen, onClose, onNavigate }: SettingsSearchModalProps) {
  const router = useRouter()
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
      if (onNavigate) {
        onNavigate(setting.tab, setting.id)
      } else {
        router.push(`/configuracion/${setting.tab}`)
      }
      onClose()
    },
    [onNavigate, onClose, router]
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
          {/* Enhanced Backdrop with stronger blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -30 }}
              transition={{
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1], // Custom easing for smoother feel
              }}
              className="w-full max-w-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.28)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.45)] border border-zinc-200/50 dark:border-zinc-700/50 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input - Enhanced */}
              <div className="relative flex items-center gap-4 px-6 py-5 border-b border-zinc-200/80 dark:border-zinc-700/80 bg-gradient-to-b from-zinc-50/50 to-transparent dark:from-zinc-800/30">
                <div className="relative">
                  <Search className="h-5 w-5 text-zinc-400 dark:text-zinc-500" strokeWidth={2.5} />
                  <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-blue-500 dark:text-blue-400" />
                </div>
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
                  className="flex-1 bg-transparent text-[16px] font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none border-none shadow-none [&:focus]:outline-none [&:focus]:border-none [&:focus]:shadow-none [&:focus]:ring-0"
                  style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                  aria-label="Buscar configuraciones"
                />
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-[background-color,transform] duration-200 hover:scale-105 active:scale-95"
                  aria-label="Cerrar búsqueda"
                >
                  <X className="h-4 w-4 text-muted" strokeWidth={2.5} />
                </button>
              </div>

              {/* Results - Enhanced */}
              <div className="max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                {results.length > 0 ? (
                  <div className="p-3 space-y-1">
                    {results.map((setting, index) => {
                      const Icon = SETTING_ICONS[setting.id as keyof typeof SETTING_ICONS]
                      const categoryColors =
                        CATEGORY_COLORS[setting.tab as keyof typeof CATEGORY_COLORS]
                      const isSelected = index === selectedIndex

                      return (
                        <motion.button
                          key={setting.id}
                          onClick={() => handleSelect(setting)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          initial={false}
                          animate={{
                            scale: isSelected ? 1.02 : 1,
                          }}
                          transition={{
                            duration: 0.2,
                            ease: 'easeOut',
                          }}
                          className={cn(
                            'group w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors duration-200 cursor-pointer text-left relative overflow-hidden',
                            isSelected
                              ? 'bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-950/40 dark:to-blue-950/20 shadow-lg shadow-blue-100/50 dark:shadow-blue-900/20'
                              : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                          )}
                        >
                          {/* Icon with gradient background */}
                          <div
                            className={cn(
                              'flex-shrink-0 p-2.5 rounded-xl transition-colors duration-200',
                              isSelected
                                ? 'bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 shadow-lg shadow-blue-500/30'
                                : 'bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700'
                            )}
                          >
                            {Icon && (
                              <Icon
                                className={cn(
                                  'h-5 w-5 transition-colors duration-200',
                                  isSelected ? 'text-white' : 'text-zinc-600 dark:text-zinc-400'
                                )}
                                strokeWidth={2}
                              />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                'text-[15px] font-semibold mb-0.5 transition-colors duration-200',
                                isSelected
                                  ? 'text-blue-700 dark:text-blue-300'
                                  : 'text-zinc-900 dark:text-white'
                              )}
                            >
                              {setting.title}
                            </p>
                            <p
                              className={cn(
                                'text-[13px] truncate transition-colors duration-200',
                                isSelected ? 'text-blue-600/70 dark:text-blue-400/70' : 'text-muted'
                              )}
                            >
                              {setting.description}
                            </p>
                          </div>

                          {/* Category badge and arrow */}
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                'text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg border transition-colors duration-200',
                                categoryColors.bg,
                                categoryColors.text,
                                isSelected ? categoryColors.border : 'border-transparent'
                              )}
                            >
                              {setting.tab}
                            </span>
                            <ArrowRight
                              className={cn(
                                'h-4 w-4 transition-[color,transform] duration-200',
                                isSelected
                                  ? 'text-blue-600 dark:text-blue-400 translate-x-1'
                                  : 'text-zinc-400 dark:text-zinc-600'
                              )}
                              strokeWidth={2.5}
                            />
                          </div>

                          {/* Selected indicator - subtle gradient line */}
                          {isSelected && (
                            <motion.div
                              layoutId="selected-indicator"
                              className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-r-full"
                              transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 30,
                              }}
                            />
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="py-16 px-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                      <Search
                        className="h-7 w-7 text-zinc-400 dark:text-zinc-500"
                        strokeWidth={2}
                      />
                    </div>
                    <p className="text-[15px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      No se encontraron configuraciones
                    </p>
                    <p className="text-[13px] text-muted">Intenta con otras palabras clave</p>
                  </div>
                )}
              </div>

              {/* Footer - Enhanced keyboard shortcuts */}
              <div className="px-6 py-4 bg-gradient-to-t from-zinc-50/80 to-transparent dark:from-zinc-800/40 border-t border-zinc-200/80 dark:border-zinc-700/80">
                <div className="flex items-center gap-5 text-[12px] text-muted">
                  <span className="flex items-center gap-2">
                    <kbd className="min-w-[28px] px-2 py-1 rounded-lg bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 shadow-sm font-mono text-center">
                      ↑↓
                    </kbd>
                    <span className="font-medium">Navegar</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <kbd className="min-w-[28px] px-2 py-1 rounded-lg bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 shadow-sm font-mono text-center">
                      ↵
                    </kbd>
                    <span className="font-medium">Seleccionar</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <kbd className="px-2 py-1 rounded-lg bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 shadow-sm font-mono">
                      esc
                    </kbd>
                    <span className="font-medium">Cerrar</span>
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
