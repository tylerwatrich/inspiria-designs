'use client'

import React from 'react'

interface HeroSectionProps {
  badge?: string
  headline: React.ReactNode
  subtitle: string
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
}

export function HeroSection({
  badge,
  headline,
  subtitle,
  primaryCta,
  secondaryCta,
}: HeroSectionProps) {
  return (
    <section className="pt-32 pb-24 px-6 relative">
      <div className="max-w-6xl mx-auto text-center">
        {badge && (
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-white/10 text-[10px] tracking-[0.3em] font-bold uppercase mb-10"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#00f0ff' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00f0ff', flexShrink: 0 }} />
            <span>{badge}</span>
          </div>
        )}

        <h1
          className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8"
          style={{
            background: 'linear-gradient(180deg, #fff 30%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {headline}
        </h1>

        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-14 leading-relaxed font-light"
          style={{ color: '#94a3b8' }}>
          {subtitle}
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-5">
          <a
            href={primaryCta.href}
            className="px-10 py-5 rounded-full text-[12px] tracking-widest uppercase font-bold transition-all"
            style={{
              background: '#fff',
              color: '#000',
              display: 'inline-block',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.background = '#00f0ff'
              el.style.boxShadow = '0 0 35px rgba(0,240,255,0.5)'
              el.style.transform = 'scale(1.02)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.background = '#fff'
              el.style.boxShadow = 'none'
              el.style.transform = 'scale(1)'
            }}
          >
            {primaryCta.label}
          </a>
          <a
            href={secondaryCta.href}
            className="px-10 py-5 rounded-full text-[12px] tracking-widest uppercase font-bold border transition-all"
            style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            {secondaryCta.label}
          </a>
        </div>
      </div>
    </section>
  )
}
