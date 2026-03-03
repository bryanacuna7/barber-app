import { useEffect } from 'react'

/**
 * Sets document.title to the business name so iOS "Add to Home Screen"
 * pre-fills correctly. businessName comes from BusinessContext (always available
 * client-side), with a fallback to the apple-mobile-web-app-title meta tag for
 * non-dashboard contexts, and finally 'BarberApp'.
 */
export function useDocumentTitle(_title: string, businessName?: string): void {
  useEffect(() => {
    const appName =
      businessName ??
      document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-title"]')?.content ??
      'BarberApp'
    document.title = appName
  }, [businessName])
}
