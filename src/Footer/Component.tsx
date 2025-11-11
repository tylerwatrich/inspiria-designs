import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer } from '@/payload-types'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import TextLogo from '@/components/Branding/textLogo'
import Slogan from '@/components/Branding/slogan'

export async function Footer() {
  const footerData: Footer = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []

  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-black mt-20">
      <div className="container px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="mb-4 md:mb-0">
            <TextLogo />
            <Slogan />
          </div>
          <nav className="flex space-x-6 mb-4 md:mb-0">
            {navItems.map(({ link }, i) => {
              return (
                <CMSLink
                  appearance="headerLink"
                  className="whitespace-nowrap text-gray-600 hover:text-brand-blue-500 transition-colors dark:text-gray-300"
                  key={i}
                  {...link}
                />
              )
            })}
          </nav>
          <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
            <ThemeSelector />
          </div>
        </div>
      </div>
    </footer>
  )
}
