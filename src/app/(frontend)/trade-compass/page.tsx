import type { Metadata } from 'next'
import TradeCompass from '@/components/TradeCompass'
import { Aurora } from '@/components/Homepage/Aurora'

export const metadata: Metadata = {
  title: 'Canadian Trade Compass | Inspiria Designs',
  description:
    'Find the best markets for your Canadian business — by province or globally. Trade intelligence covering tariffs, FTAs, and opportunity scores for 12 industries.',
}

export default function TradeCompassPage() {
  return (
    <>
      <Aurora />
      <TradeCompass />
    </>
  )
}
