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
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
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
              'relative w-full rounded-[28px]',
              'bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl',
                  'shadow-[0_24px_70px_rgba(9,9,11,0.35)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.62)]',
              'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px',
              'before:bg-gradient-to-r before:from-transparent before:via-zinc-300/70 before:to-transparent dark:before:via-zinc-600/60',
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
              <div className="flex items-center justify-between px-5 pt-5 pb-2 sm:px-6 sm:pt-6 sm:pb-2">
                <div className="flex-1 pr-4">
                  {title && (
                    <h2
                      id="modal-title"
                      className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-[1.35rem]"
                    >
                      {title}
                    </h2>
                  )}
                  {description && <p className="mt-1 text-sm text-muted">{description}</p>}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-zinc-400 transition-colors active:scale-95 hover:text-zinc-700 dark:hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500" 
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
                'overflow-y-auto overscroll-contain px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] touch-pan-y sm:px-6 sm:pt-4 [-webkit-overflow-scrolling:touch]'
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
  return <div className={cn('mt-6 flex items-center justify-end gap-3', className)}>{children}</div>
}
