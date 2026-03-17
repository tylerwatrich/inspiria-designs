import type { CollectionConfig } from 'payload'

export const QualityReviews: CollectionConfig = {
  slug: 'quality-reviews',
  admin: {
    useAsTitle: 'runLabel',
    defaultColumns: ['runLabel', 'scannedAt', 'totalScanned', 'flagged', 'avgScore'],
    disableDuplicate: true,
  },
  access: {
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'runLabel',
      type: 'text',
      admin: { readOnly: true, description: 'e.g. "Monthly scan — March 2026"' },
    },
    {
      name: 'scannedAt',
      type: 'date',
      admin: { readOnly: true },
    },
    {
      name: 'totalScanned',
      type: 'number',
      admin: { readOnly: true },
    },
    {
      name: 'flagged',
      type: 'number',
      admin: { readOnly: true, description: 'Posts with flag = needs-attention, ai-slop, incoherent, or both' },
    },
    {
      name: 'avgScore',
      type: 'number',
      admin: { readOnly: true },
    },
    {
      name: 'results',
      type: 'array',
      admin: { readOnly: true },
      fields: [
        {
          name: 'post',
          type: 'relationship',
          relationTo: 'posts',
        },
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'score',
          type: 'number',
        },
        {
          name: 'flag',
          type: 'text',
        },
        {
          name: 'issues',
          type: 'array',
          fields: [{ name: 'issue', type: 'text' }],
        },
        {
          name: 'reviewNote',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'editorialSummary',
      type: 'textarea',
      admin: {
        readOnly: true,
        description: "Claude's overall assessment of content quality this month.",
        rows: 6,
      },
    },
  ],
}
