import Link from 'next/link'
import { LeadCaptureModal } from '@/components/LeadCaptureModal'

const colorMap = {
  blue: {
    section: 'bg-brand-blue-500 text-white',
    body: 'text-blue-100',
    button: 'bg-white text-brand-blue-600 hover:bg-gray-100',
  },
  red: {
    section: 'bg-red-600 text-white',
    body: 'text-red-100',
    button: 'bg-white text-red-600 hover:bg-red-50',
  },
  dark: {
    section: 'bg-zinc-900 text-white',
    body: 'text-zinc-400',
    button: 'bg-white text-zinc-900 hover:bg-zinc-100',
  },
}

interface CTAData {
  heading: string
  body?: string | null
  buttonText: string
  buttonAction: 'lead-modal' | 'url' | string
  buttonUrl?: string | null
  backgroundColor: 'blue' | 'red' | 'dark' | string
}

interface CTABlockProps {
  cta: CTAData
  source?: 'homepage' | 'post' | 'trade-compass'
  className?: string
}

export function CTABlock({ cta, source = 'post', className = '' }: CTABlockProps) {
  const colors = colorMap[cta.backgroundColor as keyof typeof colorMap] ?? colorMap.blue
  const buttonClass = `inline-block font-bold py-3 px-8 rounded-lg shadow-floating transition-all transform hover:scale-105 ${colors.button}`

  return (
    <section
      className={`rounded-2xl shadow-floating-lg p-8 md:p-12 text-center ${colors.section} ${className}`}
    >
      <h2 className="text-2xl md:text-3xl font-bold mb-3">{cta.heading}</h2>
      {cta.body && <p className={`max-w-xl mx-auto mb-6 ${colors.body}`}>{cta.body}</p>}
      {cta.buttonAction === 'lead-modal' ? (
        <LeadCaptureModal
          triggerLabel={cta.buttonText}
          triggerClassName={buttonClass}
          source={source}
        />
      ) : (
        <Link href={cta.buttonUrl ?? '#'} className={buttonClass}>
          {cta.buttonText}
        </Link>
      )}
    </section>
  )
}
