'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { animations, reducedMotion } from '@/lib/design-system'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  className?: string
  /**
   * When true, the modal expands to near-full screen height on mobile.
   * Use for complex forms (create appointment, client detail).
   * Leave false (default) for confirm dialogs and small modals.
   */
  mobileFullHeight?: boolean
  /**
   * When true, content area fills available height.
   * Set false for compact forms to avoid dead space on mobile.
   */
  contentFill?: boolean
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
  mobileFullHeight = false,
  contentFill = true,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<Element | null>(null)
  const prefersReducedMotion = useReducedMotion()

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Lock body scroll when open — released in onExitComplete, not on isOpen change
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus()
    }
  }, [isOpen])

  const handleExitComplete = () => {
    document.body.style.overflow = ''
    // Restore focus defensively
    const prev = previousFocusRef.current
    if (prev && 'focus' in prev && (prev as HTMLElement).isConnected) {
      ;(prev as HTMLElement).focus()
    }
    previousFocusRef.current = null
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose()
    }
  }

  const modal = (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isOpen && (
        <div
          ref={overlayRef}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-[80] flex items-start justify-center px-4 py-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: prefersReducedMotion
                ? reducedMotion.spring.default.duration
                : animations.duration.normal,
            }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal container */}
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
            transition={
              prefersReducedMotion
                ? { duration: reducedMotion.spring.sheet.duration }
                : animations.spring.sheet
            }
            className={cn(
              'relative w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl',
              'border border-zinc-200 dark:border-zinc-800',
              // Full-height on mobile only when explicitly requested (complex forms)
              mobileFullHeight
                ? 'h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-1.5rem)] max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-1.5rem)] sm:h-auto sm:max-h-[90vh]'
                : 'max-h-[90dvh]',
              'overflow-hidden flex flex-col min-h-0',
              'focus-visible:!outline-none',
              sizeClasses[size],
              className
            )}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between p-5 sm:p-6 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex-1 pr-4">
                  {title && (
                    <h2
                      id="modal-title"
                      className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100"
                    >
                      {title}
                    </h2>
                  )}
                  {description && <p className="mt-1 text-sm text-muted">{description}</p>}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className={cn(
                      'inline-flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-200',
                      'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300',
                      'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                      'focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2',
                      'active:scale-95'
                    )}
                    aria-label="Cerrar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div
              className={cn(
                contentFill && 'flex-1 min-h-0',
                'overflow-y-auto overscroll-contain p-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:p-6 touch-pan-y [-webkit-overflow-scrolling:touch]'
              )}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  if (typeof document === 'undefined') return null
  return createPortal(modal, document.body)
}

// Modal Footer component for actions
interface ModalFooterProps {
  children: ReactNode
  className?: string
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 pt-6 mt-6',
        'border-t border-zinc-200 dark:border-zinc-800',
        className
      )}
    >
      {children}
    </div>
  )
}
