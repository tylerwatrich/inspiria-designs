/**
 * Design Preview — Version 2
 * Uses the ai_studio_redesign.html content exactly, rendered with
 * the same aurora design system as the main homepage.
 *
 * Route: /design-preview
 */

import React from 'react'
import { Plus_Jakarta_Sans } from 'next/font/google'

import { Aurora } from '@/components/Homepage/Aurora'
import { HeroSection } from '@/components/Homepage/HeroSection'
import { ServicesGrid, ServiceItem } from '@/components/Homepage/ServicesGrid'
import { MissionSection } from '@/components/Homepage/MissionSection'

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '600', '800'],
  display: 'swap',
})

// --- Services data — exact content from ai_studio_redesign.html ---
const servicesV2: ServiceItem[] = [
  {
    iconColor: 'text-cyan-400',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    title: 'Web Development',
    description:
      'We build fast, scalable, and responsive websites using modern frameworks. Our code is clean, our performance is unmatched, and our architectures are built to last.',
  },
  {
    iconColor: 'text-emerald-400',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'SEO & AEO',
    description:
      'Transition your brand into the future with AI Engine Optimization (AEO). We ensure your content is not just searchable by Google, but authoritative for AI LLMs.',
  },
  {
    iconColor: 'text-purple-400',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    title: 'UI/UX Design',
    description:
      'Design that converts. We focus on the user journey, combining aesthetic minimalism with functional precision to ensure your visitors stay engaged.',
  },
  {
    iconColor: 'text-orange-400',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    title: 'Brand Identity',
    description:
      'We define how the world sees you. From logo systems to visual language, we create cohesive identities that resonate across all digital touchpoints.',
  },
  {
    iconColor: 'text-blue-400',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Strategic Growth',
    description:
      'Beyond the build. We partner with brands to identify market opportunities, optimize funnel conversions, and execute marketing strategies that produce measurable ROI.',
    wide: true,
  },
]

// ─────────────────────────────────────────────
//  Footer — from ai_studio_redesign.html
// ─────────────────────────────────────────────

function PreviewFooter() {
  return (
    <footer
      className="py-24 px-8"
      style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        {/* Brand */}
        <div className="max-w-xs">
          <div className="text-xl font-extrabold mb-6 uppercase tracking-tighter">
            INSPIRIA<span style={{ color: '#06b6d4' }}>DIGITAL</span>
          </div>
          <p className="text-sm leading-relaxed mb-6" style={{ color: '#64748b' }}>
            A Canadian digital agency specializing in the intersection of high-end design and
            algorithmic search dominance.
          </p>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-16">
          <div>
            <h5
              className="text-[10px] font-bold tracking-[0.3em] uppercase mb-6"
              style={{ color: '#fff' }}
            >
              Follow
            </h5>
            <ul className="text-sm space-y-4 text-slate-500">
              {['LinkedIn', 'Instagram', 'X / Twitter'].map((s) => (
                <li key={s}>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5
              className="text-[10px] font-bold tracking-[0.3em] uppercase mb-6"
              style={{ color: '#fff' }}
            >
              Office
            </h5>
            <p className="text-sm leading-loose" style={{ color: '#64748b' }}>
              Toronto, Canada
              <br />
              hello@inspiriadigital.com
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="max-w-7xl mx-auto mt-20 pt-8 flex flex-col md:flex-row justify-between text-[10px] tracking-[0.2em] uppercase font-bold"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: '#475569' }}
      >
        <div>&copy; {new Date().getFullYear()} Inspiria Digital. All Rights Reserved.</div>
        <div className="mt-4 md:mt-0">Precision Engineered in Canada</div>
      </div>
    </footer>
  )
}

// ─────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────

export default function DesignPreviewPage() {
  return (
    <main className={jakartaSans.className} style={{ color: '#fff' }}>
      {/* Aurora background + scroll progress (client) */}
      <Aurora />

      <HeroSection
        badge="Optimizing for the Next Era of Search"
        headline={
          <>
            Elevate Your Digital <br />Search Presence.
          </>
        }
        subtitle="Inspiria Digital bridges the gap between complex web architecture and intuitive human experiences. We craft high-performance websites optimized for both humans and AI search engines."
        primaryCta={{ label: 'Start Your Transformation', href: '#services' }}
        secondaryCta={{ label: 'Explore Our Work', href: '#' }}
      />

      <ServicesGrid
        eyebrow="Our Capabilities"
        heading="Comprehensive solutions for digital dominance."
        services={servicesV2}
      />

      <MissionSection
        eyebrow="Our Mission"
        quote={
          <>
            &ldquo;To empower businesses by creating digital environments where{' '}
            <span
              className="font-bold not-italic"
              style={{
                color: '#fff',
                textDecoration: 'underline',
                textDecorationColor: '#00f0ff',
                textUnderlineOffset: '8px',
              }}
            >
              innovation meets impact
            </span>
            , ensuring long-term authority in an AI-first world.&rdquo;
          </>
        }
      />

      <PreviewFooter />
    </main>
  )
}

export const metadata = {
  title: 'Design Preview — Inspiria Digital',
  description: 'Design preview page — Inspiria Digital web agency.',
}
