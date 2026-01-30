'use client'

import { createContext, useContext, useState, useCallback, type ReactNode, useEffect } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// ============================================================================
// COMPOSITION PATTERNS APPLIED:
// ✅ Already uses Context pattern (good!)
// ✅ Already has Provider + hook API (excellent!)
// ✅ Maintains existing API (addToast, success, error, etc.)
// ============================================================================

// ============================================================================
// WEB INTERFACE GUIDELINES APPLIED:
// 1. Added aria-live="polite" for screen readers
// 2. Added aria-atomic="true" for complete announcements
// 3. Added aria-hidden="true" on decorative icons
// 4. Added prefers-reduced-motion support
// 5. Fixed X icon aria-hidden
// ============================================================================

// Types
type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (message: string, type?: ToastType, duration?: number) => void
  removeToast: (id: string) => void
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Provider
interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 4000) => {
      const id = Math.random().toString(36).slice(2)
      const toast: Toast = { id, message, type, duration }

      setToasts((prev) => [...prev, toast])

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration)
      }
    },
    [removeToast]
  )

  const success = useCallback((message: string) => addToast(message, 'success'), [addToast])
  const error = useCallback((message: string) => addToast(message, 'error', 6000), [addToast])
  const warning = useCallback((message: string) => addToast(message, 'warning'), [addToast])
  const info = useCallback((message: string) => addToast(message, 'info'), [addToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

// Toast Container
interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Individual Toast
interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
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

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const Icon = icons[toast.type]
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return

    const startTime = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / toast.duration) * 100)
      setProgress(remaining)

      if (remaining === 0) {
        clearInterval(timer)
      }
    }, 50)

    return () => clearInterval(timer)
  }, [toast.duration])

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100 || info.offset.x < -100) {
      onRemove(toast.id)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8, transition: { duration: 0.2 } }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05, rotate: 5 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'pointer-events-auto relative overflow-hidden',
        'flex items-start gap-3 p-4 rounded-xl border shadow-lg',
        'backdrop-blur-sm cursor-grab active:cursor-grabbing',
        styles[toast.type],
        // prefers-reduced-motion support
        'motion-reduce:transition-none motion-reduce:animate-none'
      )}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <motion.div
          className={cn(
            'absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-full',
            'motion-reduce:hidden' // Hide animated progress bar for reduced motion
          )}
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.05, ease: 'linear' }}
          aria-hidden="true"
        />
      )}

      <Icon
        className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconStyles[toast.type])}
        aria-hidden="true"
      />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className={cn(
          'p-1 rounded-lg',
          'hover:bg-black/10 dark:hover:bg-white/10',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2',
          'motion-safe:transition-colors motion-safe:duration-200',
          'motion-reduce:transition-none',
          'flex-shrink-0'
        )}
        aria-label="Close notification"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </motion.div>
  )
}

// ============================================================================
// IMPROVEMENTS MADE
// ============================================================================

/*

BEFORE (Issues):
- Missing aria-live="polite" on container
- Missing aria-atomic on toast items
- Icons without aria-hidden="true"
- No prefers-reduced-motion support
- Close button X without aria-hidden

AFTER (Fixed):
✅ aria-live="polite" on container for screen reader announcements
✅ aria-atomic="true" on individual toasts
✅ aria-hidden="true" on all decorative icons
✅ role="status" on toast items
✅ prefers-reduced-motion support:
   - motion-reduce:transition-none
   - motion-reduce:animate-none
   - motion-reduce:hidden on progress bar
✅ focus-visible on close button
✅ Proper aria-label on buttons

EXISTING STRENGTHS (Maintained):
✅ Context pattern for state management
✅ Clean hook API (useToast())
✅ Helper methods (success, error, warning, info)
✅ Drag to dismiss
✅ Auto-dismiss with timer
✅ Beautiful animations

USAGE (Unchanged):
const { success, error, warning, info } = useToast()

// Simple usage
success('Changes saved!')
error('Failed to save changes')
warning('Unsaved changes will be lost')
info('New update available')

// Advanced usage
addToast('Custom message', 'success', 5000)

*/
