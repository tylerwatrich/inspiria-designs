'use client'

import React from 'react'

export interface ServiceItem {
  icon: React.ReactNode
  iconColor: string
  title: string
  description: string
  /** Set to true to make this card span 2 columns on lg screens */
  wide?: boolean
}

interface ServicesGridProps {
  eyebrow?: string
  heading: string
  services: ServiceItem[]
}

export function ServicesGrid({ eyebrow = 'Our Capabilities', heading, services }: ServicesGridProps) {
  return (
    <section id="services" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <h2
            className="text-xs font-bold tracking-[0.4em] uppercase mb-6"
            style={{ color: '#06b6d4' }}
          >
            {eyebrow}
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold max-w-2xl leading-tight text-white">
            {heading}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <div
              key={i}
              className={`aurora-card-hover p-12 group cursor-default${service.wide ? ' lg:col-span-2' : ''}`}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '24px',
              }}
            >
              {/* Icon box */}
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(0,240,255,0.05)',
                  border: '1px solid rgba(0,240,255,0.15)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                }}
              >
                <span className={service.iconColor}>{service.icon}</span>
              </div>

              <h4 className="text-2xl font-bold mb-5 text-white">{service.title}</h4>
              <p className="leading-relaxed text-sm" style={{ color: '#94a3b8' }}>
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
