import { useEffect } from 'react'

/**
 * Sets document.title to `${title} | ${appName}` where appName comes from
 * the `apple-mobile-web-app-title` meta tag (set per-business by generateMetadata).
 * Falls back to 'BarberApp' when the meta tag is absent.
 * No cleanup restore — each page sets its own title on mount.
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    const appName =
      document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-title"]')?.content ??
      'BarberApp'
    document.title = `${title} | ${appName}`
  }, [title])
}
