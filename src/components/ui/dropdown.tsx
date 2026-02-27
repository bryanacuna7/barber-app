'use client'

import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { ChevronDown, Check } from 'lucide-react'
import { animations, reducedMotion } from '@/lib/design-system'

// Shared animation variants using design-system tokens
const dropdownVariants = {
  initial: { opacity: 0, scale: 0.95, y: -4 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -4 },
}

const reducedVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

// Dropdown Menu
interface DropdownProps {
  trigger: ReactNode
  children: ReactNode
  align?: 'left' | 'right'
  className?: string
}

export function Dropdown({ trigger, children, align = 'left', className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  const close = useCallback(() => {
    setIsOpen(false)
    // Focus restore to trigger
    triggerRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        close()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [close])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        close()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, close])

  const variants = prefersReducedMotion ? reducedVariants : dropdownVariants
  const transition = prefersReducedMotion
    ? { duration: reducedMotion.spring.snappy.duration }
    : animations.spring.snappy

  return (
    <div ref={dropdownRef} className={cn('relative inline-block', className)}>
      <div ref={triggerRef} tabIndex={-1} onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            className={cn(
              'absolute z-50 mt-2 min-w-[200px]',
              'bg-white dark:bg-zinc-900 rounded-xl shadow-lg',
              'border border-zinc-200 dark:border-zinc-800',
              'py-1.5',
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Dropdown Item
interface DropdownItemProps {
  children: ReactNode
  onClick?: () => void
  icon?: ReactNode
  danger?: boolean
  disabled?: boolean
  className?: string
}

export function DropdownItem({
  children,
  onClick,
  icon,
  danger = false,
  disabled = false,
  className,
}: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left',
        'transition-colors duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        danger
          ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
          : 'text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800',
        className
      )}
    >
      {icon && <span className="w-4 h-4 flex-shrink-0">{icon}</span>}
      {children}
    </button>
  )
}

// Dropdown Separator
export function DropdownSeparator() {
  return <div className="my-1.5 border-t border-zinc-200 dark:border-zinc-800" />
}

// Dropdown Label
interface DropdownLabelProps {
  children: ReactNode
}

export function DropdownLabel({ children }: DropdownLabelProps) {
  return (
    <div className="px-4 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">
      {children}
    </div>
  )
}

// Select Dropdown (for forms)
interface SelectOption {
  value: string
  label: string
}

interface SelectDropdownProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
}

export function SelectDropdown({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  className,
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const prefersReducedMotion = useReducedMotion()

  const selectedOption = options.find((opt) => opt.value === value)

  const close = useCallback(() => {
    setIsOpen(false)
    triggerRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        close()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [close])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        close()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, close])

  const variants = prefersReducedMotion ? reducedVariants : dropdownVariants
  const transition = prefersReducedMotion
    ? { duration: reducedMotion.spring.snappy.duration }
    : animations.spring.snappy

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-4 py-2.5',
          'bg-white dark:bg-zinc-900 rounded-xl',
          'border border-zinc-200 dark:border-zinc-800',
          'text-sm text-left',
          'transition-[border-color,box-shadow] duration-200',
          'hover:border-zinc-300 dark:hover:border-zinc-700',
          'focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2',
          isOpen && 'ring-2 ring-zinc-500 ring-offset-2'
        )}
      >
        <span className={cn(selectedOption ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500')}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-zinc-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            className={cn(
              'absolute z-50 w-full mt-2',
              'bg-white dark:bg-zinc-900 rounded-xl shadow-lg',
              'border border-zinc-200 dark:border-zinc-800',
              'py-1.5 max-h-60 overflow-auto'
            )}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  close()
                }}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-2.5 text-sm text-left',
                  'transition-colors duration-150',
                  option.value === value
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                )}
              >
                {option.label}
                {option.value === value && (
                  <Check className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
