import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type CardProps = HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white/90 p-6 backdrop-blur-sm',
        'shadow-[0_0_0_0.5px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]',
        'dark:bg-zinc-800/80 dark:border dark:border-zinc-700/50',
        'dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]',
        className
      )}
      {...props}
    />
  )
}

type CardHeaderProps = HTMLAttributes<HTMLDivElement>

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn('mb-4', className)}
      {...props}
    />
  )
}

type CardTitleProps = HTMLAttributes<HTMLHeadingElement>

export function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn(
        'text-lg font-semibold text-zinc-900 dark:text-white',
        className
      )}
      {...props}
    />
  )
}

type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p
      className={cn(
        'mt-1 text-sm text-zinc-500 dark:text-zinc-400',
        className
      )}
      {...props}
    />
  )
}

type CardContentProps = HTMLAttributes<HTMLDivElement>

export function CardContent({ className, ...props }: CardContentProps) {
  return (
    <div
      className={cn('', className)}
      {...props}
    />
  )
}

type CardFooterProps = HTMLAttributes<HTMLDivElement>

export function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn('mt-4 flex items-center', className)}
      {...props}
    />
  )
}
