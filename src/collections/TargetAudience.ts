import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

export const TargetAudience: CollectionConfig = {
  slug: 'target-audience',
  admin: {
    useAsTitle: 'industry',
    defaultColumns: ['industry', 'businessSizes', 'updatedAt'],
    description:
      'Detailed targeting profile for each industry — keywords, business sizes, and linked articles.',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // Keep the legacy `industry` text field in sync with the selected Industry name.
        // This preserves useAsTitle, admin list display, and any existing references.
        // Sync legacy text field from the related Industry name.
        // Guard with try/catch — during hook-initiated creates the Industry record
        // may not be visible yet in the same DB transaction.
        if (data.industryRef && !data.industry) {
          try {
            const industry = await req.payload.findByID({
              collection: 'industries',
              id: data.industryRef,
            })
            if (industry?.name) {
              data.industry = industry.name
            }
          } catch {
            // Industry lookup failed — text field will be synced on next save
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      // Legacy text field — kept for useAsTitle and backward compat.
      // Synced automatically from industryRef via beforeChange hook.
      // Hidden in admin; use the industryRef relationship field instead.
      name: 'industry',
      type: 'text',
      required: false,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'industryRef',
      type: 'relationship',
      relationTo: 'industries',
      hasMany: false,
      label: 'Industry',
      admin: {
        description: 'Which industry does this profile belong to?',
      },
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
