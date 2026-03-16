import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export const PageViews: CollectionConfig = {
  slug: 'page-views',
  access: {
    create: () => true,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'visitorId',
    defaultColumns: ['visitorId', 'ipAddress', 'country', 'city', 'pageCount', 'lastVisit'],
    description: 'Tracks every visitor, pages they visited, and their location.',
  },
  fields: [
    {
      name: 'visitorId',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Unique ID stored in the visitor\'s localStorage',
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
      admin: {
        description: 'IP address at time of last visit',
      },
    },
    {
      name: 'country',
      type: 'text',
      admin: {
        description: '2-letter country code from Vercel edge headers',
      },
    },
    {
      name: 'city',
      type: 'text',
    },
    {
      name: 'region',
      type: 'text',
      admin: {
        description: 'Region/state/province code',
      },
    },
    {
      name: 'pageCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Total number of pages visited (maintained automatically)',
      },
    },
    {
      name: 'lastVisit',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'userAgent',
      type: 'text',
      admin: {
        description: 'Browser/device user agent string',
      },
    },
    {
      name: 'pages',
      type: 'array',
      admin: {
        description: 'Every page this visitor has viewed',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'path',
          type: 'text',
          admin: {
            description: 'URL path (e.g. /blog/some-post)',
          },
        },
        {
          name: 'title',
          type: 'text',
          admin: {
            description: 'Page title at time of visit',
          },
        },
        {
          name: 'visitedAt',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
    },
  ],
  timestamps: true,
}
