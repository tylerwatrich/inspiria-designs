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
    defaultColumns: ['visitorId', 'deviceType', 'browser', 'country', 'city', 'pageCount', 'sessionCount', 'lastVisit'],
    description: 'One record per anonymous visitor — identity, device, location, attribution, and full activity history.',
    components: {
      views: {
        edit: {
          activityFeed: {
            Component: '@/components/VisitorActivityTab',
            path: '/activity',
            tab: {
              label: 'Activity',
              href: '/activity',
              order: 200,
            },
          },
        },
      },
    },
  },
  fields: [
    {
      name: 'visitorId',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'UUID stored in the visitor\'s localStorage',
      },
    },
    {
      name: 'fingerprintId',
      type: 'text',
      index: true,
      admin: {
        description: 'Stable browser fingerprint — persists across localStorage clears',
      },
    },
    {
      name: 'deviceType',
      type: 'select',
      options: ['desktop', 'mobile', 'tablet'],
      admin: {
        description: 'Device category parsed from user-agent',
      },
    },
    {
      name: 'browser',
      type: 'text',
      admin: {
        description: 'Browser name and major version (e.g. "Chrome 124")',
      },
    },
    {
      name: 'os',
      type: 'text',
      admin: {
        description: 'Operating system (e.g. "macOS 14", "Windows 11")',
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
      name: 'sessionCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of distinct browser sessions',
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
        description: 'Raw browser/device user agent string',
      },
    },
    // First-touch attribution — set on record create, never overwritten
    {
      name: 'firstSource',
      type: 'text',
      admin: {
        description: 'Referrer domain on the very first visit',
      },
    },
    {
      name: 'firstUtmSource',
      type: 'text',
    },
    {
      name: 'firstUtmMedium',
      type: 'text',
    },
    {
      name: 'firstUtmCampaign',
      type: 'text',
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
