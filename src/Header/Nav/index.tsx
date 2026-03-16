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
            className="block text-center md:inline md:text-left py-2 md:py-0 whitespace-nowrap font-bold text-gray-700 dark:text-gray-200 hover:text-brand-blue-500 transition-colors"
            onClick={onClickLink}
            size="clear"
          />
        )
      })}
      <Link
        href="#contact"
        onClick={onClickLink}
        className="w-full text-center mt-4 md:mt-0 bg-brand-blue-500 text-white font-bold py-2 px-5 rounded-lg shadow-floating hover:bg-brand-blue-600 transition-all block"
      >
        Get a Quote
      </Link>
    </nav>
  )
}
