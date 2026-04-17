'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { cn } from '@/utilities/ui'

interface HeaderNavProps {
  data: HeaderType
  onClickLink?: () => void
  className?: string
  style?: React.CSSProperties
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ data, onClickLink, className, style }) => {
  const navItems = data?.navItems || []

  return (
    <nav className={cn('items-center md:space-x-10', className)} style={style}>
      {navItems.map(({ link }, i) => {
        return (
          <CMSLink
            key={i}
            {...link}
            appearance="headerLink"
            className="block text-center md:inline md:text-left py-2 md:py-0 whitespace-nowrap text-[11px] font-bold tracking-[0.2em] uppercase text-white/60 hover:text-white hover:text-cyan-400 transition-colors"
            onClick={onClickLink}
            size="clear"
          />
        )
      })}
      <Link
        href="#contact"
        onClick={onClickLink}
        className="w-full text-center mt-4 md:mt-0 px-6 py-2 border border-white/10 rounded-full text-[11px] font-bold tracking-widest uppercase text-white hover:bg-white hover:text-black transition-all block"
      >
        Get in Touch
      </Link>
    </nav>
  )
}
