import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export const TrackingEvents: CollectionConfig = {
  slug: 'tracking-events',
  access: {
    create: () => true,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'eventName',
    defaultColumns: ['eventName', 'eventType', 'visitorId', 'path', 'occurredAt'],
    description: 'Custom event log — button clicks, form interactions, video plays, etc.',
  },
  fields: [
    {
      name: 'eventType',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Category of event (e.g. "click", "form_start", "form_submit", "video_play")',
      },
    },
    {
      name: 'eventName',
      type: 'text',
      required: true,
      admin: {
        description: 'Descriptive label (e.g. "CTA Click - Contact Us")',
      },
    },
    {
      name: 'properties',
      type: 'textarea',
      admin: {
        description: 'JSON string of additional key-value data for this event',
      },
    },
    {
      name: 'visitorId',
      type: 'text',
      index: true,
    },
    {
      name: 'fingerprintId',
      type: 'text',
    },
    {
      name: 'sessionId',
      type: 'text',
      index: true,
    },
    {
      name: 'path',
      type: 'text',
      admin: {
        description: 'URL path where the event occurred',
      },
    },
    {
      name: 'occurredAt',
      type: 'date',
      index: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
  timestamps: false,
}
