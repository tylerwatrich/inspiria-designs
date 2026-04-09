import React from 'react'

interface MissionSectionProps {
  eyebrow?: string
  quote: React.ReactNode
}

export function MissionSection({ eyebrow = 'Our Mission', quote }: MissionSectionProps) {
  return (
    <section
      id="about"
      className="py-32 px-6 relative overflow-hidden"
      style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2
          className="text-xs font-bold tracking-[0.4em] uppercase mb-8"
          style={{ color: '#06b6d4' }}
        >
          {eyebrow}
        </h2>
        <p
          className="text-3xl md:text-5xl font-light leading-snug italic"
          style={{ color: 'rgba(255,255,255,0.9)' }}
        >
          {quote}
        </p>
      </div>
    </section>
  )
}
