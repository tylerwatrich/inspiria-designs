import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Footer } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import TextLogo from '@/components/Branding/textLogo'

export async function Footer() {
  const footerData: Footer = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []

  return (
    <footer
      style={{
        background: 'rgba(3, 5, 10, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.07)',
      }}
    >
      <div className="max-w-7xl mx-auto px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <TextLogo />

        {navItems.length > 0 && (
          <nav className="flex flex-wrap justify-center gap-8">
            {navItems.map(({ link }, i) => (
              <CMSLink
                key={i}
                appearance="headerLink"
                className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors whitespace-nowrap"
                {...link}
              />
            ))}
          </nav>
        )}

        <p
          className="text-[10px] font-bold tracking-[0.2em] uppercase"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          &copy; {new Date().getFullYear()} Inspiria Digital
        </p>
      </div>
    </footer>
  )
}
