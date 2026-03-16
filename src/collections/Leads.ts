import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export const Leads: CollectionConfig = {
  slug: 'leads',
  access: {
    create: () => true,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'source', 'createdAt'],
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'source',
      type: 'select',
      options: [
        { label: 'Homepage', value: 'homepage' },
        { label: 'Trade Compass', value: 'trade-compass' },
      ],
    },
  ],
  timestamps: true,
}
