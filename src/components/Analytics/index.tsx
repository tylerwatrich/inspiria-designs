'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export default function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) {
      console.error('Missing NEXT_PUBLIC_GA_MEASUREMENT_ID')
      return
    }

    // Load the gtag script from our proxy
    const script = document.createElement('script')
    script.src = `/api/gtag?id=${GA_MEASUREMENT_ID}`
    script.async = true
    script.onload = () => {
      console.log('✅ Gtag loaded from proxy')

      // Initialize gtag
      window.dataLayer = window.dataLayer || []
      function gtag(...args: any[]) {
        window.dataLayer!.push(args)
      }
      window.gtag = gtag

      gtag('js', new Date())
      gtag('config', GA_MEASUREMENT_ID, {
        page_path: window.location.pathname,
      })

      console.log('✅ GA4 initialized')
    }
    script.onerror = () => {
      console.error('❌ Failed to load gtag from proxy')
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, []) // Only run once on mount

  useEffect(() => {
    if (pathname && window.gtag && GA_MEASUREMENT_ID) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ''),
      })
    }
  }, [pathname, searchParams])

  return null
}
