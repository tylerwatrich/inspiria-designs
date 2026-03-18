import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export const FAQs: CollectionConfig = {
  slug: 'faqs',
  access: {
    create: authenticated,
    delete: authenticated,
    read: () => true,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'updatedAt'],
    description: 'Reusable FAQ entries that can be assigned to one or more posts.',
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
      label: 'Question',
    },
    {
      name: 'answer',
      type: 'textarea',
      required: true,
      label: 'Answer',
      admin: {
        description: 'Plain-text answer. Keep it concise — one to four sentences.',
      },
    },
  ],
}
