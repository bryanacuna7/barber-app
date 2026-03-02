import { useEffect } from 'react'

/**
 * Sets document.title to `${title} | BarberApp`.
 * No cleanup restore — each page sets its own title on mount.
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} | BarberApp`
  }, [title])
}
