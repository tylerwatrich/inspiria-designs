'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'
import { cn } from '@/utilities/ui'

interface HeaderNavProps {
  data: HeaderType
  onClickLink?: () => void
  className?: string
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ data, onClickLink, className }) => {
  const navItems = data?.navItems || []

  return (
    <nav className={cn('items-center md:space-x-8', className)}>
      {navItems.map(({ link }, i) => {
        return (
          <CMSLink
            key={i}
            {...link}
            appearance="headerLink"
            className="whitespace-nowrap text-gray-600 hover:text-brand-blue-500 transition-colors"
            onClick={onClickLink}
          />
        )
      })}
      <Link
        href="#contact"
        onClick={onClickLink}
        className="w-full text-center mt-4 md:mt-0 bg-brand-blue-500 text-white font-medium py-2 px-5 rounded-lg shadow-floating hover:bg-brand-blue-600 transition-all block"
      >
        Get a Quote
      </Link>
    </nav>
  )
}
