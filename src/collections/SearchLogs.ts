import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export const SearchLogs: CollectionConfig = {
  slug: 'search-logs',
  access: {
    create: () => true,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'industry',
    defaultColumns: ['industry', 'province', 'hideUS', 'createdAt'],
    group: 'Analytics',
  },
  fields: [
    {
      name: 'industry',
      type: 'text',
      required: true,
    },
    {
      name: 'province',
      type: 'text',
    },
    {
      name: 'hideUS',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  timestamps: true,
}
