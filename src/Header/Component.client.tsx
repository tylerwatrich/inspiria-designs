'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header
      className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm dark:text-gray-300"
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="flex justify-between">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-brand-blue-600">
            Inspiria<span className="text-gray-700 dark:text-gray-300">Designs</span>
            {/* <Logo loading="eager" priority="high" className="invert dark:invert-0" /> */}
          </Link>
          {/* Use HeaderNav for both desktop and mobile, toggle with menu state */}

          <HeaderNav
            data={data}
            onClickLink={closeMenu}
            className={`absolute md:static left-0 right-0    md:bg-transparent px-6 md:px-0 pt-2 md:pt-0 pb-4 md:pb-0 transition-all duration-300 z-40
              ${isMenuOpen ? 'block' : 'hidden'} md:flex top-full md:top-auto items-center`}
          />

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
