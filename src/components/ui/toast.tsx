'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
  useEffect,
  useRef,
} from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { animations } from '@/lib/design-system'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastAction {
  label: string
  onClick: () => void
}

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
  action?: ToastAction
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (message: string, type?: ToastType, duration?: number, action?: ToastAction) => void
  removeToast: (id: string) => void
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
  undoable: (message: string, onUndo: () => void, duration?: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)
const noop = () => {}
const serverToastFallback: ToastContextValue = {
  toasts: [],
  addToast: noop,
  removeToast: noop,
  success: noop,
  error: noop,
  warning: noop,
  info: noop,
  undoable: noop,
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    if (typeof window === 'undefined') {
      return serverToastFallback
    }
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 4000, action?: ToastAction) => {
      const id = Math.random().toString(36).slice(2)
      const toast: Toast = { id, message, type, duration, action }
      setToasts((prev) => [...prev, toast])
    },
    []
  )

  const success = useCallback((message: string) => addToast(message, 'success'), [addToast])
  const error = useCallback((message: string) => addToast(message, 'error', 6000), [addToast])
  const warning = useCallback((message: string) => addToast(message, 'warning'), [addToast])
  const info = useCallback((message: string) => addToast(message, 'info'), [addToast])
  const undoable = useCallback(
    (message: string, onUndo: () => void, duration: number = 5000) => {
      addToast(message, 'info', duration, { label: 'Deshacer', onClick: onUndo })
    },
    [addToast]
  )

  const value = useMemo(
    () => ({ toasts, addToast, removeToast, success, error, warning, info, undoable }),
    [toasts, addToast, removeToast, success, error, warning, info, undoable]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <>
      {/* Mobile: top-center, below status bar */}
      <div className="sm:hidden fixed top-[calc(env(safe-area-inset-top,0px)+12px)] left-3 right-3 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={onRemove} mobile />
          ))}
        </AnimatePresence>
      </div>
      {/* Desktop: bottom-right */}
      <div className="hidden sm:flex fixed bottom-4 right-4 z-[100] w-full max-w-sm flex-col gap-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
  mobile?: boolean
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const styles = {
  success:
    'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
  error:
    'bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
  warning:
    'bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
  info: 'bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
}

const iconStyles = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
}

function ToastItem({ toast, onRemove, mobile = false }: ToastItemProps) {
  const Icon = icons[toast.type]
  const [progress, setProgress] = useState(100)
  const remainingRef = useRef(Math.max(0, toast.duration ?? 0))
  const lastTickRef = useRef(0)
  const pausedRef = useRef(false)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    const durationMs = toast.duration
    if (!durationMs || durationMs <= 0) return

    remainingRef.current = durationMs
    lastTickRef.current = Date.now()

    const clearTicker = () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    const tick = () => {
      if (pausedRef.current) {
        lastTickRef.current = Date.now()
        return
      }

      const now = Date.now()
      const delta = now - lastTickRef.current
      lastTickRef.current = now

      remainingRef.current = Math.max(0, remainingRef.current - delta)
      setProgress((remainingRef.current / durationMs) * 100)

      if (remainingRef.current <= 0) {
        clearTicker()
        onRemove(toast.id)
      }
    }

    intervalRef.current = window.setInterval(tick, 50)

    return clearTicker
  }, [toast.duration, toast.id, onRemove])

  const pause = () => {
    pausedRef.current = true
  }

  const resume = () => {
    pausedRef.current = false
    lastTickRef.current = Date.now()
  }

  const handleActionClick = () => {
    toast.action?.onClick()
    onRemove(toast.id)
  }

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 100 || info.offset.x < -100) {
      onRemove(toast.id)
    }
  }

  return (
    <motion.div
      layout
      initial={mobile ? { opacity: 0, y: -16, scale: 0.96 } : { opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={
        mobile
          ? { opacity: 0, y: -16, scale: 0.96, transition: { duration: 0.15 } }
          : { opacity: 0, x: 300, scale: 0.8, transition: { duration: 0.2 } }
      }
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05, rotate: 5 }}
      transition={animations.spring.snappy}
      onMouseEnter={pause}
      onMouseLeave={resume}
      className={cn(
        'pointer-events-auto relative overflow-hidden',
        'flex items-start gap-3 p-4 rounded-xl border shadow-lg',
        'backdrop-blur-sm cursor-grab active:cursor-grabbing',
        styles[toast.type]
      )}
      role="alert"
    >
      {toast.duration && toast.duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-full"
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.05, ease: 'linear' }}
        />
      )}

      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconStyles[toast.type])} />

      <div className="flex flex-1 items-center gap-2 min-w-0">
        <p className="text-sm font-medium min-w-0">{toast.message}</p>
        {toast.action && (
          <button
            type="button"
            onClick={handleActionClick}
            className="shrink-0 text-xs font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={() => onRemove(toast.id)}
        className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex-shrink-0"
        aria-label="Cerrar"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}
