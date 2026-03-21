import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export const CTAs: CollectionConfig = {
  slug: 'ctas',
  labels: {
    singular: 'CTA',
    plural: 'CTAs',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'backgroundColor', 'buttonAction', 'updatedAt'],
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: () => true,
    update: authenticated,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Internal Name',
      admin: {
        description: 'Used to identify this CTA in the admin. Not shown publicly.',
      },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      label: 'Heading',
    },
    {
      name: 'body',
      type: 'textarea',
      label: 'Body Text',
    },
    {
      name: 'buttonText',
      type: 'text',
      required: true,
      label: 'Button Text',
    },
    {
      name: 'buttonAction',
      type: 'select',
      label: 'Button Action',
      required: true,
      defaultValue: 'lead-modal',
      options: [
        { label: 'Open Lead Capture Modal', value: 'lead-modal' },
        { label: 'Go to URL', value: 'url' },
      ],
      admin: {
        description: 'What happens when the button is clicked.',
      },
    },
    {
      name: 'buttonUrl',
      type: 'text',
      label: 'Button URL',
      admin: {
        description: 'Required when Button Action is "Go to URL".',
        condition: (data) => data?.buttonAction === 'url',
      },
    },
    {
      name: 'backgroundColor',
      type: 'select',
      label: 'Background Color',
      required: true,
      defaultValue: 'blue',
      options: [
        { label: 'Blue', value: 'blue' },
        { label: 'Red', value: 'red' },
        { label: 'Dark', value: 'dark' },
      ],
    },
  ],
}
