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
        return <CMSLink key={i} {...link} appearance="link" />
      })}
      <Link href="/search">
        <span className="sr-only">Search</span>
        <SearchIcon className="w-5 text-primary" />
      </Link>
    </nav>
  )
}
