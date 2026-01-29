import { cn } from '@/lib/utils/cn'

interface VisuallyHiddenProps {
  children: React.ReactNode
  className?: string
}

/**
 * Visually hides content while keeping it accessible to screen readers
 */
export function VisuallyHidden({ children, className }: VisuallyHiddenProps) {
  return (
    <span
      className={cn(
        'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
        className
      )}
      style={{ clip: 'rect(0, 0, 0, 0)' }}
    >
      {children}
    </span>
  )
}
