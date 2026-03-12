import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/website-template-OG.webp'

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
  collection?: 'pages' | 'posts'
}): Promise<Metadata> => {
  const { doc, collection } = args

  const ogImage = getImageURL((doc?.meta as Partial<Post>['meta'])?.image ?? (doc as Partial<Post>)?.heroImage)

  const title = doc?.meta?.title ? doc?.meta?.title + ' | Inspiria Designs' : 'Inspiria Designs'

  let canonicalURL = '/'
  if (doc?.slug) {
    const slugPath = Array.isArray(doc.slug) ? doc.slug.join('/') : doc.slug
    canonicalURL = collection === 'posts' ? `/blog/${slugPath}` : `/${slugPath}`
  }

  return {
    description: doc?.meta?.description,
    alternates: {
      canonical: canonicalURL, // Allow custom override
    },
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: canonicalURL,
      // url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    title,
  }
}
