import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

export const ArticleAreas: CollectionConfig = {
  slug: 'article-areas',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'description'],
    description:
      'Narrative separations for articles — defines which section of the site an article belongs to (e.g. Canadian Business News, Industry Insights, Resources).',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: () => true,
    update: authenticated,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Area Name',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'What this area covers and the narrative intent behind it.',
      },
    },
  ],
}
