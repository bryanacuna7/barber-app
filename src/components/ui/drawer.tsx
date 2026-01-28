'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  description?: string
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  className?: string
}

export function Drawer({
  isOpen,
  onClose,
  children,
  title,
  description,
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
}: DrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

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

  // Focus trap
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      drawerRef.current.focus()
    }
  }, [isOpen])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          ref={overlayRef}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-50 flex items-end justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'drawer-title' : undefined}
        >
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer container */}
          <motion.div
            ref={drawerRef}
            tabIndex={-1}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'relative w-full bg-white dark:bg-zinc-900 rounded-t-[28px] shadow-2xl',
              'border border-zinc-200 dark:border-zinc-800 border-b-0',
              'max-h-[85vh] overflow-hidden flex flex-col',
              'pb-safe', // Safe area for iOS home indicator
              className
            )}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            </div>

            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between px-6 pb-4 pt-2">
                <div className="flex-1 pr-4">
                  {title && (
                    <h2
                      id="drawer-title"
                      className="text-[20px] font-bold text-zinc-900 dark:text-zinc-100"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-1 text-[15px] text-zinc-500 dark:text-zinc-400">
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className={cn(
                      'p-2 rounded-xl transition-colors duration-200',
                      'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300',
                      'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                      'focus:outline-none focus:ring-2 focus:ring-zinc-500'
                    )}
                    aria-label="Cerrar"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
