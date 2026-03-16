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
    defaultColumns: ['path', 'visitorId', 'sessionId', 'country', 'utmSource', 'timeOnPage', 'scrollDepth', 'visitedAt'],
    description: 'Flat log of every individual page visit with behavioral and attribution data.',
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
      name: 'sessionId',
      type: 'text',
      index: true,
      admin: {
        description: 'UUID from sessionStorage — groups all pages in a single browser session',
      },
    },
    {
      name: 'isNewSession',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'True if this is the first page of a new session',
      },
    },
    // Behavioral fields — sent with the NEXT route change (time/scroll from the previous page)
    {
      name: 'timeOnPage',
      type: 'number',
      admin: {
        description: 'Seconds spent on this page (recorded on the following navigation)',
      },
    },
    {
      name: 'scrollDepth',
      type: 'number',
      admin: {
        description: 'Max scroll depth reached (0–100%)',
      },
    },
    // Attribution
    {
      name: 'referrer',
      type: 'text',
      admin: {
        description: 'document.referrer at time of visit',
      },
    },
    {
      name: 'utmSource',
      type: 'text',
    },
    {
      name: 'utmMedium',
      type: 'text',
    },
    {
      name: 'utmCampaign',
      type: 'text',
    },
    {
      name: 'utmContent',
      type: 'text',
    },
    {
      name: 'utmTerm',
      type: 'text',
    },
    // Geo + device
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
