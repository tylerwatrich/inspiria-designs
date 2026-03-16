'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const visitorId = localStorage.getItem('visitorId') || undefined

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        path: pathname,
        title: document.title,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.visitorId) {
          localStorage.setItem('visitorId', data.visitorId)
        }
      })
      .catch(() => {
        // Fail silently — tracking must never break the site
      })
  }, [pathname])

  return null
}
