import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

export const Industries: CollectionConfig = {
  slug: 'industries',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'updatedAt'],
    description: 'Industry verticals. Adding one here makes it available as a Target Audience profile.',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return

        // Auto-create a Target Audience profile when a new Industry is added
        const existing = await req.payload.find({
          collection: 'target-audience',
          where: { industryRef: { equals: doc.id } },
          limit: 1,
        })

        if (existing.docs.length > 0) return

        // Pass industry name directly so TA's beforeChange hook doesn't need
        // to re-fetch the Industry record (which may not be visible yet in the
        // same transaction on some DB drivers).
        await req.payload.create({
          collection: 'target-audience',
          data: {
            industry: doc.name,      // text field — set explicitly to avoid lookup
            industryRef: doc.id,     // relationship field
          },
        })
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Industry Name',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Brief description of this industry vertical.',
      },
    },
  ],
}
