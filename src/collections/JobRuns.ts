import type { CollectionConfig } from 'payload'

export const JobRuns: CollectionConfig = {
  slug: 'job-runs',
  admin: {
    useAsTitle: 'jobType',
    defaultColumns: ['jobType', 'status', 'startedAt', 'completedAt', 'message'],
    group: 'Automation',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: () => false,
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'jobType',
      type: 'select',
      required: true,
      options: ['scan-news', 'write-post', 'generate-images', 'quality-audit', 'update-articles'],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: ['running', 'completed', 'error'],
    },
    { name: 'startedAt', type: 'date', required: true },
    { name: 'completedAt', type: 'date' },
    { name: 'message', type: 'text' },
  ],
}
