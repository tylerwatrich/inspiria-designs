import { GlobalConfig } from 'payload'

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Home Page',
  fields: [
    {
      name: 'heroTitle',
      type: 'text',
    },
    {
      name: 'heroSubtitle',
      type: 'text',
    },
    {
      name: 'aboutImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'customHTML',
      type: 'code',
      admin: {
        language: 'html',
      },
    },
    {
      name: 'cta',
      type: 'relationship',
      relationTo: 'ctas',
      hasMany: false,
      label: 'CTA',
      admin: {
        description: 'The call-to-action shown at the bottom of the home page.',
      },
    },
  ],
}
