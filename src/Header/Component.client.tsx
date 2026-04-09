'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import TextLogo from '@/components/Branding/textLogo'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    // Set initial state in case page loads mid-scroll
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: isScrolled ? 'rgba(3, 5, 10, 0.85)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: isScrolled ? 'blur(20px)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
      }}
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
        <TextLogo />

        <HeaderNav
          data={data}
          onClickLink={closeMenu}
          className={`absolute md:static left-0 right-0 md:bg-transparent px-6 md:px-0 pt-2 md:pt-0 pb-4 md:pb-0 transition-all duration-300 z-40
            ${isMenuOpen ? 'block' : 'hidden'} md:flex top-full md:top-auto items-center`}
          style={
            isMenuOpen
              ? { background: 'rgba(3,5,10,0.95)', backdropFilter: 'blur(20px)' }
              : undefined
          }
        />

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white/70 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
      </div>
    </header>
  )
}
