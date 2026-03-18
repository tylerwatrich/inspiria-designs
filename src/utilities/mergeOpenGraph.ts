import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description:
    'Professional web design and digital strategy for Canadian small businesses. Websites that build credibility, generate leads, and win contracts.',
  images: [
    {
      url: `${getServerSideURL()}/og-image.jpg`,
      width: 1216,
      height: 640,
      alt: 'Inspiria Digital — Web Design for Canadian Businesses',
    },
  ],
  siteName: 'Inspiria Digital',
  title: 'Inspiria Digital — Web Design for Canadian Businesses',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
