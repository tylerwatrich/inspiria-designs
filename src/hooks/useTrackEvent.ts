'use client'

import { useCallback } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Hook for tracking custom events.
 *
 * Usage:
 *   const trackEvent = useTrackEvent()
 *   trackEvent('click', 'CTA Click - Contact Us', { location: 'hero' })
 */
export function useTrackEvent() {
  const pathname = usePathname()

  const trackEvent = useCallback(
    (
      eventType: string,
      eventName: string,
      properties?: Record<string, unknown>,
    ) => {
      try {
        const visitorId = localStorage.getItem('visitorId') || undefined
        const fingerprintId = localStorage.getItem('fingerprintId') || undefined
        const sessionId = sessionStorage.getItem('sessionId') || undefined

        fetch('/api/track-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType,
            eventName,
            properties,
            visitorId,
            fingerprintId,
            sessionId,
            path: pathname,
            occurredAt: new Date().toISOString(),
          }),
        }).catch(() => {
          // Fail silently — event tracking must never break the site
        })
      } catch {
        // Fail silently
      }
    },
    [pathname],
  )

  return trackEvent
}
