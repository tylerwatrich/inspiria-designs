import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export const PageVisits: CollectionConfig = {
  slug: 'page-visits',
  access: {
    create: () => true,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'path',
    defaultColumns: ['path', 'title', 'visitorId', 'country', 'city', 'ipAddress', 'visitedAt'],
    description: 'Flat log of every individual page visit across all visitors.',
  },
  fields: [
    {
      name: 'path',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'visitedAt',
      type: 'date',
      index: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'visitorId',
      type: 'text',
      index: true,
      admin: {
        description: 'Matches the visitorId in the Page Views collection',
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
    },
    {
      name: 'country',
      type: 'text',
    },
    {
      name: 'city',
      type: 'text',
    },
    {
      name: 'region',
      type: 'text',
    },
    {
      name: 'userAgent',
      type: 'text',
    },
  ],
  timestamps: false,
}
