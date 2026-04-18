import type { Metadata } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { PageTracker } from '@/components/PageTracker'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '600', '800'],
  display: 'swap',
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()
  // app/layout.tsx
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  // TEMPORARY CHECK
  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href="/favicon-inspiria.jpg" rel="icon" type="image/jpeg" sizes="512x512" />
        <link href="/favicon-inspiria.jpg" rel="apple-touch-icon" sizes="512x512" />
      </head>

      <body className={`${inter.className} ${jakartaSans.className} dark:bg-zinc-900`}>
        <Providers>
          <PageTracker />
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />

          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!} />
    </html>
  )
}

export const metadata: Metadata = {
  // title: 'Inspiria Designs - Modern Web & Graphic Design',
  // description:
  // 'Creative Ideas, Stunning Designs. We are a passionate team of designers and developers creating beautiful, user-friendly websites and graphics.',
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
  },
}
