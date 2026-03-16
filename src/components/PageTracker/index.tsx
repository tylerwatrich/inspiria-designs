'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export function PageTracker() {
  const pathname = usePathname()
  const pageEntryTimeRef = useRef<number>(Date.now())
  const maxScrollDepthRef = useRef<number>(0)

  // One-time init: session ID, UTM capture, fingerprint generation
  useEffect(() => {
    // New session ID per browser session (cleared when tab closes)
    if (!sessionStorage.getItem('sessionId')) {
      sessionStorage.setItem('sessionId', crypto.randomUUID())
      sessionStorage.setItem('isNewSession', 'true')
    }

    // Capture UTM params and referrer from the landing page only
    if (!sessionStorage.getItem('utmCaptured')) {
      const params = new URLSearchParams(window.location.search)
      sessionStorage.setItem(
        'utmData',
        JSON.stringify({
          utmSource: params.get('utm_source') || '',
          utmMedium: params.get('utm_medium') || '',
          utmCampaign: params.get('utm_campaign') || '',
          utmContent: params.get('utm_content') || '',
          utmTerm: params.get('utm_term') || '',
        }),
      )
      sessionStorage.setItem('sessionReferrer', document.referrer || '')
      sessionStorage.setItem('utmCaptured', 'true')
    }

    // Generate browser fingerprint if not already stored
    if (!localStorage.getItem('fingerprintId')) {
      import('@fingerprintjs/fingerprintjs')
        .then((FingerprintJS) => FingerprintJS.load())
        .then((fp) => fp.get())
        .then((result) => {
          localStorage.setItem('fingerprintId', result.visitorId)
        })
        .catch(() => {
          // Fail silently — fingerprinting is best-effort
        })
    }
  }, [])

  // Scroll depth tracking — track max % scrolled on the current page
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY + window.innerHeight
      const total = document.documentElement.scrollHeight
      const depth = total > 0 ? Math.round((scrolled / total) * 100) : 0
      if (depth > maxScrollDepthRef.current) {
        maxScrollDepthRef.current = depth
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Track page view on each route change
  useEffect(() => {
    // Capture time and scroll from the previous page before resetting
    const now = Date.now()
    const timeOnPage = Math.round((now - pageEntryTimeRef.current) / 1000)
    const scrollDepth = maxScrollDepthRef.current

    // Reset for the new page
    pageEntryTimeRef.current = now
    maxScrollDepthRef.current = 0

    const visitorId = localStorage.getItem('visitorId') || undefined
    const fingerprintId = localStorage.getItem('fingerprintId') || undefined
    const sessionId = sessionStorage.getItem('sessionId') || undefined
    const isNewSession = sessionStorage.getItem('isNewSession') === 'true'
    const referrer = sessionStorage.getItem('sessionReferrer') || undefined
    const utmData = JSON.parse(sessionStorage.getItem('utmData') || '{}')

    // Clear new-session flag after first use
    if (isNewSession) {
      sessionStorage.removeItem('isNewSession')
    }

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        fingerprintId,
        sessionId,
        path: pathname,
        title: document.title,
        referrer,
        ...utmData,
        timeOnPage,
        scrollDepth,
        isNewSession,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.visitorId) localStorage.setItem('visitorId', data.visitorId)
      })
      .catch(() => {
        // Fail silently — tracking must never break the site
      })
  }, [pathname])

  return null
}
