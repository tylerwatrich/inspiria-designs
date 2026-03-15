import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

export const ArticleTypes: CollectionConfig = {
  slug: 'article-types',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'description'],
    description: 'Content format categories used to classify and report on articles.',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      label: 'Type Name',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'What this article type means and when to use it.',
      },
    },
  ],
}
