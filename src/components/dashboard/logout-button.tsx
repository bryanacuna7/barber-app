'use client'

import { type ReactNode, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface LogoutButtonProps {
  className?: string
  children: ReactNode
  redirectTo?: string
}

export function LogoutButton({ className, children, redirectTo = '/login' }: LogoutButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogout = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    const supabase = createClient()

    try {
      await supabase.auth.signOut()
    } finally {
      window.location.assign(redirectTo)
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isSubmitting}
      aria-busy={isSubmitting}
      className={className}
    >
      {children}
    </button>
  )
}
