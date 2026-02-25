import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer relative inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer items-center rounded-full p-[2px]',
      'transition-colors duration-200 ease-in-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary,#7C3AED)] focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-[#30D158] dark:data-[state=checked]:bg-[#30D158]',
      'data-[state=checked]:ring-1 data-[state=checked]:ring-[rgba(48,209,88,0.42)]',
      'data-[state=checked]:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_0_0_1px_rgba(48,209,88,0.22),0_8px_18px_rgba(0,0,0,0.28)]',
      'data-[state=unchecked]:bg-[#D2D4DB] dark:data-[state=unchecked]:bg-[#3A3D46]',
      'data-[state=unchecked]:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]',
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none relative block h-[27px] w-[27px] rounded-full ring-0',
        'transition-transform duration-200 ease-in-out',
        'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
        'data-[state=checked]:bg-white data-[state=checked]:shadow-[0_3px_10px_rgba(0,0,0,0.35)]',
        'data-[state=unchecked]:bg-[#F5F5F7] dark:data-[state=unchecked]:bg-[#D0D3DB]',
        'data-[state=unchecked]:shadow-[0_1px_5px_rgba(0,0,0,0.25)]',
        'after:absolute after:inset-[35%] after:rounded-full',
        'after:bg-[#24A148] after:opacity-0 after:transition-opacity',
        'data-[state=checked]:after:opacity-100'
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
