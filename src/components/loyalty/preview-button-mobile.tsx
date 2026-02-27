'use client'

/**
 * Preview Button Mobile
 * Floating button that opens preview modal on mobile devices
 * Z-index: 40 (above content, below sticky headers which are typically z-50)
 */

import { useState } from 'react'
import { Eye } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'
import { LoyaltyPreview } from './loyalty-preview'
import type { LoyaltyProgram } from '@/lib/gamification/loyalty-calculator'

interface Props {
  program: LoyaltyProgram | null
  className?: string
}

export function PreviewButtonMobile({ program, className = '' }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating button - visible only on mobile/tablet */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 left-1/2 z-40 flex h-11 -translate-x-1/2 items-center gap-2 rounded-xl bg-white px-4 text-[15px] font-semibold text-zinc-900 shadow-lg ring-1 ring-black/5 transition-[box-shadow,transform] hover:shadow-xl active:scale-95 dark:bg-zinc-800 dark:text-white dark:ring-white/10 lg:hidden ${className}`}
        aria-label="Ver preview del programa"
      >
        <Eye className="h-4 w-4" />
        <span>Ver Preview</span>
      </button>

      {/* Modal sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Vista Previa</SheetTitle>
            <SheetClose onClose={() => setIsOpen(false)} />
          </SheetHeader>

          <div className="mt-4">
            <LoyaltyPreview program={program} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
