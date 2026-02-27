'use client'

import { useEffect, useRef, type ReactNode } from 'react'
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

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isOpen && (
        <div
          ref={overlayRef}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
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
              'max-h-[90vh] overflow-hidden flex flex-col',
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
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
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
