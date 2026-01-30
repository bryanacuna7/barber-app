'use client'

import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// ============================================================================
// CONTEXT & TYPES
// ============================================================================

interface ModalContextValue {
  state: {
    isOpen: boolean
  }
  actions: {
    close: () => void
  }
  meta: {
    titleId: string
    contentRef: React.RefObject<HTMLDivElement>
    closeButtonRef: React.RefObject<HTMLButtonElement>
  }
}

const ModalContext = createContext<ModalContextValue | null>(null)

function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('Modal components must be used within Modal.Root')
  }
  return context
}

// ============================================================================
// PROVIDER (State Management)
// ============================================================================

interface ModalRootProps {
  children: ReactNode
  isOpen: boolean
  onClose: () => void
}

function ModalRoot({ children, isOpen, onClose }: ModalRootProps) {
  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2, 9)}`).current
  const contentRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

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

  // Focus management: focus first focusable element or close button
  useEffect(() => {
    if (isOpen && contentRef.current) {
      const focusableElements = contentRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      if (focusableElements.length > 0) {
        focusableElements[0].focus()
      } else if (closeButtonRef.current) {
        closeButtonRef.current.focus()
      }
    }
  }, [isOpen])

  // Focus trap
  useEffect(() => {
    if (!isOpen || !contentRef.current) return

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !contentRef.current) return

      const focusableElements = contentRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <ModalContext.Provider
      value={{
        state: { isOpen },
        actions: { close: onClose },
        meta: { titleId, contentRef, closeButtonRef },
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}

// ============================================================================
// COMPOUND COMPONENTS
// ============================================================================

interface ModalOverlayProps {
  children: ReactNode
  closeOnClick?: boolean
  className?: string
}

function ModalOverlay({ children, closeOnClick = true, className }: ModalOverlayProps) {
  const { actions, meta } = useModal()
  const overlayRef = useRef<HTMLDivElement>(null)

  const handleClick = (e: React.MouseEvent) => {
    if (closeOnClick && e.target === overlayRef.current) {
      actions.close()
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleClick}
      className={cn('fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6', className)}
      role="dialog"
      aria-modal="true"
      aria-labelledby={meta.titleId}
    >
      {/* Backdrop with blur */}
      <div
        className={cn(
          'absolute inset-0 bg-black/60 backdrop-blur-sm',
          'motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200'
        )}
        aria-hidden="true"
      />
      {children}
    </div>
  )
}

interface ModalContentProps {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
}

function ModalContent({ children, size = 'md', className }: ModalContentProps) {
  const { meta } = useModal()

  return (
    <div
      ref={meta.contentRef}
      className={cn(
        'relative w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl',
        'motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:slide-in-from-bottom-4',
        'motion-safe:duration-300 motion-safe:ease-out',
        'border border-zinc-200 dark:border-zinc-800',
        'max-h-[90vh] overflow-hidden flex flex-col',
        'overscroll-contain', // FIX: Added overscroll-behavior
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  )
}

interface ModalHeaderProps {
  children: ReactNode
  className?: string
}

function ModalHeader({ children, className }: ModalHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between p-6',
        'border-b border-zinc-200 dark:border-zinc-800',
        className
      )}
    >
      {children}
    </div>
  )
}

interface ModalTitleProps {
  children: ReactNode
  className?: string
}

function ModalTitle({ children, className }: ModalTitleProps) {
  const { meta } = useModal()

  return (
    <h2
      id={meta.titleId}
      className={cn(
        'text-xl font-semibold text-zinc-900 dark:text-zinc-100',
        'flex-1 pr-4',
        className
      )}
    >
      {children}
    </h2>
  )
}

interface ModalDescriptionProps {
  children: ReactNode
  className?: string
}

function ModalDescription({ children, className }: ModalDescriptionProps) {
  return (
    <p className={cn('mt-1 text-sm text-zinc-500 dark:text-zinc-400', className)}>{children}</p>
  )
}

interface ModalCloseButtonProps {
  className?: string
  'aria-label'?: string
}

function ModalCloseButton({
  className,
  'aria-label': ariaLabel = 'Cerrar',
}: ModalCloseButtonProps) {
  const { actions, meta } = useModal()

  return (
    <button
      ref={meta.closeButtonRef}
      onClick={actions.close}
      className={cn(
        'p-2 rounded-xl transition-all duration-200',
        'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300',
        'hover:bg-zinc-100 dark:hover:bg-zinc-800',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500', // FIX: Using focus-visible
        'active:scale-95',
        className
      )}
      aria-label={ariaLabel}
    >
      <X className="w-5 h-5" />
    </button>
  )
}

interface ModalBodyProps {
  children: ReactNode
  className?: string
}

function ModalBody({ children, className }: ModalBodyProps) {
  return <div className={cn('flex-1 overflow-y-auto p-6', className)}>{children}</div>
}

interface ModalFooterProps {
  children: ReactNode
  className?: string
}

function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 p-6',
        'border-t border-zinc-200 dark:border-zinc-800',
        className
      )}
    >
      {children}
    </div>
  )
}

// ============================================================================
// EXPLICIT VARIANTS (Pre-composed patterns)
// ============================================================================

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
}

function ConfirmModal({ isOpen, onClose, title, description, children }: ConfirmModalProps) {
  return (
    <Modal.Root isOpen={isOpen} onClose={onClose}>
      <Modal.Overlay>
        <Modal.Content size="sm">
          <Modal.Header>
            <div>
              <Modal.Title>{title}</Modal.Title>
              {description && <Modal.Description>{description}</Modal.Description>}
            </div>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body>{children}</Modal.Body>
        </Modal.Content>
      </Modal.Overlay>
    </Modal.Root>
  )
}

interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer: ReactNode
}

function FormModal({ isOpen, onClose, title, description, children, footer }: FormModalProps) {
  return (
    <Modal.Root isOpen={isOpen} onClose={onClose}>
      <Modal.Overlay closeOnClick={false}>
        <Modal.Content size="lg">
          <Modal.Header>
            <div>
              <Modal.Title>{title}</Modal.Title>
              {description && <Modal.Description>{description}</Modal.Description>}
            </div>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body>{children}</Modal.Body>
          <Modal.Footer>{footer}</Modal.Footer>
        </Modal.Content>
      </Modal.Overlay>
    </Modal.Root>
  )
}

interface FullscreenModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

function FullscreenModal({ isOpen, onClose, title, children }: FullscreenModalProps) {
  return (
    <Modal.Root isOpen={isOpen} onClose={onClose}>
      <Modal.Overlay closeOnClick={false}>
        <Modal.Content size="full">
          {title && (
            <Modal.Header>
              <Modal.Title>{title}</Modal.Title>
              <Modal.CloseButton />
            </Modal.Header>
          )}
          <Modal.Body>{children}</Modal.Body>
        </Modal.Content>
      </Modal.Overlay>
    </Modal.Root>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export const Modal = {
  Root: ModalRoot,
  Overlay: ModalOverlay,
  Content: ModalContent,
  Header: ModalHeader,
  Title: ModalTitle,
  Description: ModalDescription,
  CloseButton: ModalCloseButton,
  Body: ModalBody,
  Footer: ModalFooter,
  // Pre-composed variants
  Confirm: ConfirmModal,
  Form: FormModal,
  Fullscreen: FullscreenModal,
}

// Legacy export for backwards compatibility (optional)
export { ModalFooter }
