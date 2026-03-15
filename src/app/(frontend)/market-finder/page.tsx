import type { Metadata } from 'next'
import CanadianMarketFinder from '@/components/MarketFinder'

export const metadata: Metadata = {
  title: 'Canadian Market Compass | Inspiria Designs',
  description:
    'Find the best markets for your Canadian business — by province or globally. Trade intelligence covering tariffs, FTAs, and opportunity scores for 12 industries.',
}

export default function MarketFinderPage() {
  return <CanadianMarketFinder />
}
