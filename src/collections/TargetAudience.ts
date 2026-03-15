import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

export const TargetAudience: CollectionConfig = {
  slug: 'target-audience',
  admin: {
    useAsTitle: 'industry',
    defaultColumns: ['industry', 'businessSizes', 'updatedAt'],
    description:
      'Industries you are targeting, their business size profiles, and keyword banks for AI content generation.',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  fields: [
    {
      name: 'industry',
      type: 'text',
      required: true,
      label: 'Industry Name',
    },
    {
      name: 'businessSizes',
      type: 'select',
      hasMany: true,
      label: 'Target Business Sizes',
      options: [
        { label: 'Solo / Freelancer (1)', value: 'solo' },
        { label: 'Micro (2–10 employees)', value: 'micro' },
        { label: 'Small (11–50 employees)', value: 'small' },
        { label: 'Medium (51–250 employees)', value: 'medium' },
        { label: 'Large (250+ employees)', value: 'large' },
      ],
    },
    {
      name: 'keywords',
      type: 'array',
      label: 'Keywords & Phrases',
      admin: {
        description: 'Words and phrases AI uses when writing articles for this industry.',
      },
      fields: [
        {
          name: 'keyword',
          type: 'text',
          required: true,
          label: 'Keyword or Phrase',
        },
      ],
    },
    {
      name: 'relatedPosts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      label: 'Articles Written for This Industry',
      admin: {
        description:
          'Posts written targeting this industry. Foundation for the per-industry performance dashboard.',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notes',
      admin: {
        description:
          'Internal notes about this industry — pain points, content angles, lead patterns.',
      },
    },
  ],
}
