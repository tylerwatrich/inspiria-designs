import type { GlobalConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: () => true,
    update: authenticated,
  },
  admin: {
    description: 'Global site identity used in structured data (Schema.org), SEO, and metadata.',
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      label: 'Site Name',
      defaultValue: 'Inspiria Digital',
      admin: {
        description: 'Your company or brand name. Used in Schema.org markup across all pages.',
      },
    },
    {
      name: 'siteDescription',
      type: 'textarea',
      label: 'Site Description',
      admin: {
        description: 'One to three sentence description of your business. Used in Organization schema on the home page.',
      },
    },
    {
      name: 'areaServed',
      type: 'text',
      label: 'Area Served',
      defaultValue: 'CA',
      admin: {
        description: 'ISO 3166 country code (e.g. CA, US). Used in Organization schema.',
      },
    },
  ],
}
