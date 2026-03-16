import type { Post } from '@/payload-types'
import { imageCompass } from './image-compass'

export const postExportGuide: Omit<Post, 'createdAt' | 'id' | 'updatedAt'> = {
  title: 'How to Find New Export Markets in Canada (And Stop Relying on the U.S.)',
  slug: 'how-to-find-new-export-markets-canada-stop-relying-on-us',
  _status: 'published',
  meta: {
    title: 'How to Find New Export Markets in Canada | Inspiria Designs',
    description: 'Learn how to diversify your export strategy and find high-growth markets beyond the U.S. using the Canadian Market Compass.',
    image: imageCompass as any,
  },
  authors: [], // Will be populated during seed
  categories: [], // Will be populated during seed
  heroImage: imageCompass as any,
  content: {
    root: {
      type: 'root',
      children: [
        {
          type: 'heading',
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'The Diversification Mandate',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          tag: 'h2',
          version: 1,
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: "For decades, Canadian businesses have relied on the United States as their primary—and often only—export destination. While the proximity and shared language make it an attractive market, recent trade volatility and shifting tariffs have made over-reliance a significant risk. It's time to look globally.",
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
          version: 1,
        },
        {
          type: 'heading',
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'Introducing the Market Compass',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          tag: 'h3',
          version: 1,
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: "Our new Canadian Market Compass tool is designed to help you navigate this transition. By analyzing trade volume, FTA access, and industry-specific opportunity scores, we identify the markets where Canadian goods and services are in high demand.",
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  },
}
