import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export const LogisticsContext: CollectionConfig = {
  slug: 'logistics-context',
  access: {
    create: authenticated,
    delete: authenticated,
    read: () => true, // TradeCompass reads this client-side
    update: authenticated,
  },
  admin: {
    useAsTitle: 'province',
    defaultColumns: ['province', 'market', 'confidence', 'lastReviewed'],
    group: 'Trade Tools',
    description:
      'AI-maintained logistics blurbs shown on the Trade Compass. Each record is one province → market pair. The cron updates these monthly; you can also edit manually.',
  },
  fields: [
    {
      name: 'province',
      type: 'select',
      required: true,
      options: [
        'Ontario',
        'Quebec',
        'British Columbia',
        'Alberta',
        'Saskatchewan',
        'Manitoba',
        'Nova Scotia',
        'New Brunswick',
        'Newfoundland & Labrador',
        'Prince Edward Island',
      ],
    },
    {
      name: 'market',
      type: 'text',
      required: true,
      admin: {
        description: 'Country name exactly as it appears in the Trade Compass (e.g. "Japan")',
      },
    },
    {
      name: 'note',
      type: 'textarea',
      required: true,
      admin: {
        description: 'The logistics blurb shown in the UI. 1–2 sentences max.',
      },
    },
    {
      name: 'confidence',
      type: 'select',
      defaultValue: 'estimated',
      options: [
        { label: 'Verified — AI confirmed current', value: 'verified' },
        { label: 'Estimated — AI-generated, not yet re-checked', value: 'estimated' },
        { label: 'Stale — older than 90 days', value: 'stale' },
      ],
    },
    {
      name: 'lastReviewed',
      type: 'date',
      admin: {
        description: 'Set automatically by the cron when the blurb is reviewed or updated.',
        date: { pickerAppearance: 'dayOnly' },
      },
    },
    {
      name: 'source',
      type: 'text',
      admin: {
        description:
          'Optional: note the source that informed this blurb (e.g. "Prince Rupert Port Authority 2025 report")',
      },
    },
    {
      name: 'cronNotes',
      type: 'textarea',
      admin: {
        description: 'Internal notes written by the cron — reasoning for changes or why it skipped.',
        readOnly: true,
      },
    },
  ],
  timestamps: true,
}
