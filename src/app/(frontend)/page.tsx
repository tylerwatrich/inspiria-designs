import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'

import { Media } from '@/components/Media'
import { Media as MediaType } from '@/payload-types'
import { LeadCaptureModal } from '@/components/LeadCaptureModal'
import { getServerSideURL } from '@/utilities/getURL'

import { Aurora } from '@/components/Homepage/Aurora'
import { HeroSection } from '@/components/Homepage/HeroSection'
import { ServicesGrid, ServiceItem } from '@/components/Homepage/ServicesGrid'
import { MissionSection } from '@/components/Homepage/MissionSection'

// --- Services data (Version 1 — current homepage content) ---
const servicesV1: ServiceItem[] = [
  {
    iconColor: 'text-cyan-400',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
        />
      </svg>
    ),
    title: 'Web Design & Development',
    description:
      'Fast, mobile-ready websites built to rank on Google — and optimized for AI search tools like ChatGPT and Perplexity that are changing how people find businesses. Not just something that looks good — something that gets found.',
  },
  {
    iconColor: 'text-purple-400',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
        />
      </svg>
    ),
    title: 'Brand Identity',
    description:
      'A visual identity that tells your story instantly. Logos, colours, and style that people remember and trust — built to look sharp across every digital surface.',
  },
  {
    iconColor: 'text-emerald-400',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    title: 'UI/UX Design',
    description:
      'Intuitive digital experiences that keep people engaged and make it easy for them to take action. Design that converts — built around real user behaviour.',
  },
  {
    iconColor: 'text-orange-400',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    title: 'SEO & AEO',
    description:
      'Rank on Google and get cited by AI. We optimize your content to be authoritative for both traditional search engines and the AI tools your future clients are already using.',
    wide: true,
  },
]

interface AboutProps {
  aboutImage?: number | MediaType | null
}

function AboutSection({ aboutImage }: AboutProps) {
  const checkmarks = [
    { label: 'Built for Canada', body: 'We know the market and understand the landscape.' },
    { label: 'No runaround', body: 'Direct, honest, and moving fast — no corporate bloat.' },
    {
      label: 'Real results',
      body: 'Websites built to show up on Google and get cited by AI tools like ChatGPT and Perplexity.',
    },
  ]

  return (
    <section className="py-32 px-6 aurora-section-divider">
      <div className="max-w-7xl mx-auto">
        <div className="aurora-about-glass p-8 md:p-16 flex flex-col md:flex-row items-center gap-12">
          {/* Text */}
          <div className="w-full md:w-1/2">
            <h2
              className="text-xs font-bold tracking-[0.4em] uppercase mb-6"
              style={{ color: '#06b6d4' }}
            >
              Why Choose Us
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold leading-tight text-white mb-6">
              We move fast. <br />
              We don&apos;t cut corners.
            </h3>
            <p className="text-sm leading-relaxed mb-8" style={{ color: '#94a3b8' }}>
              {
                "We're not a faceless agency running cookie-cutter templates. We take the time to understand your business, move fast, and deliver work that actually moves the needle. No fluff, no runaround."
              }
            </p>
            <ul className="space-y-5">
              {checkmarks.map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span
                    className="mt-0.5 flex-shrink-0 flex items-center justify-center rounded-full w-5 h-5 text-xs font-bold"
                    style={{ background: 'rgba(0,240,255,0.15)', color: '#00f0ff' }}
                  >
                    ✓
                  </span>
                  <span className="text-sm" style={{ color: '#94a3b8' }}>
                    <span className="font-semibold text-white">{item.label}:</span> {item.body}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Image */}
          {aboutImage && (
            <div className="w-full md:w-1/2 relative min-h-[400px] rounded-2xl overflow-hidden">
              <Media
                resource={aboutImage}
                fill={true}
                size="(max-width: 768px) 100vw, 50vw"
                imgClassName="object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function ContactSection() {
  return (
    <section id="contact" className="py-32 px-6 aurora-section-divider">
      <div className="max-w-4xl mx-auto aurora-cta-section">
        <h2
          className="text-xs font-bold tracking-[0.4em] uppercase mb-6"
          style={{ color: '#06b6d4' }}
        >
          Get Started
        </h2>
        <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Ready to start growing?
        </h3>
        <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: '#94a3b8' }}>
          Tell us about your business and where you want to take it. Free consultation, no pressure.
        </p>
        <LeadCaptureModal
          triggerLabel="Contact Us Now"
          triggerClassName="bg-white text-black px-10 py-5 rounded-full text-[12px] tracking-widest uppercase font-bold transition-all hover:bg-cyan-300 hover:shadow-[0_0_35px_rgba(0,240,255,0.5)]"
          source="homepage"
        />
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────

export default async function HomePage() {
  const payload = await getPayload({ config })
  const [home, siteSettings] = await Promise.all([
    payload.findGlobal({ slug: 'home' }),
    payload.findGlobal({ slug: 'site-settings' }),
  ])

  const siteUrl = getServerSideURL()

  const ldJson = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: siteSettings.siteName,
        url: siteUrl,
        ...(siteSettings.siteDescription ? { description: siteSettings.siteDescription } : {}),
        ...(siteSettings.areaServed ? { areaServed: siteSettings.areaServed } : {}),
        knowsAbout: [
          'Web Design',
          'Web Development',
          'Brand Identity',
          'UI/UX Design',
          'SEO',
          'AEO',
        ],
      },
      {
        '@type': 'WebSite',
        name: siteSettings.siteName,
        url: siteUrl,
      },
    ],
  }

  return (
    <main style={{ color: '#fff' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />

      {/* Aurora background + scroll progress (client) */}
      <Aurora />

      <HeroSection
        badge="Optimizing for the Next Era of Search"
        headline={
          <>
            Your business <br />
            deserves to be found.
          </>
        }
        subtitle="We build digital presence that actually works — websites, branding, and online strategy that turns visitors into customers and makes your business look like it means business."
        primaryCta={{ label: 'Start Your Transformation', href: '#contact' }}
        secondaryCta={{ label: 'Explore Our Work', href: '#services' }}
      />

      <ServicesGrid
        eyebrow="Our Capabilities"
        heading="Everything your business needs to get online and get competitive."
        services={servicesV1}
      />

      <MissionSection
        eyebrow="Our Mission"
        quote={
          <>
            &ldquo;To empower Canadian businesses by creating digital environments where{' '}
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

      <AboutSection aboutImage={home.aboutImage} />

      <ContactSection />
    </main>
  )
}

export const metadata = {
  title: 'Inspiria Designs — Web Design & Digital Strategy',
  description:
    'Fast, modern websites for Canadian businesses. Web design, brand identity, SEO, and AI search optimization.',
}
