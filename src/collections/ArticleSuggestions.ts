import type { CollectionConfig } from 'payload'

export const ArticleSuggestions: CollectionConfig = {
  slug: 'article-suggestions',
  admin: {
    useAsTitle: 'headline',
    defaultColumns: ['headline', 'vertical', 'priority', 'status', 'scheduledFor', 'discoveredAt'],
    listSearchableFields: ['headline', 'summary'],
  },
  fields: [
    {
      name: 'headline',
      type: 'text',
      required: true,
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      admin: { description: 'What the story is about — 2-3 sentences from Gemini.' },
    },
    {
      name: 'keyPoints',
      type: 'array',
      fields: [{ name: 'point', type: 'text' }],
      admin: { description: 'Key facts Gemini surfaced.' },
    },
    {
      name: 'sources',
      type: 'array',
      fields: [
        { name: 'url', type: 'text' },
        { name: 'title', type: 'text' },
      ],
      admin: { description: 'Source URLs Gemini found.' },
    },
    {
      name: 'geminiContext',
      type: 'textarea',
      admin: {
        description: 'Raw research context from Gemini for use when writing.',
        rows: 8,
      },
    },
    {
      name: 'vertical',
      type: 'select',
      options: [
        { label: 'Nuclear', value: 'nuclear' },
        { label: 'AI & Cloud', value: 'ai-cloud' },
        { label: 'Construction Tech', value: 'construction-tech' },
        { label: 'Finance', value: 'finance' },
        { label: 'Trade & Policy', value: 'trade' },
        { label: 'Deep Tech', value: 'deep-tech' },
      ],
      required: true,
    },
    {
      name: 'priority',
      type: 'number',
      min: 1,
      max: 100,
      required: true,
      admin: {
        description: '1–100. Gemini sets this; Claude adjusts during writing cron. 80+ = breaking, 60–79 = timely, 40–59 = evergreen, <40 = low.',
      },
    },
    {
      name: 'priorityReason',
      type: 'textarea',
      admin: { description: 'Why Gemini scored it this way.' },
    },
    {
      name: 'smbRelevance',
      type: 'number',
      min: 1,
      max: 10,
      admin: {
        description: '1–10. How directly relevant is this story to a Canadian small business owner? 9–10 = affects most SMBs directly (rate change, tax rule). 7–8 = significant subset. 5–6 = useful context. 1–4 = mostly exec/investor interest.',
      },
    },
    {
      name: 'scheduledFor',
      type: 'date',
      admin: {
        description: 'If set, the writing cron ignores this suggestion until this date. Leave blank for immediate queue.',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending Review', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Denied', value: 'denied' },
        { label: 'Published', value: 'published' },
        { label: 'Stale', value: 'stale' },
      ],
      required: true,
    },
    {
      name: 'discoveredAt',
      type: 'date',
      admin: { readOnly: true },
    },
    {
      name: 'publishedPost',
      type: 'relationship',
      relationTo: 'posts',
      admin: { readOnly: true, description: 'Set automatically when Claude writes this article.' },
    },
    {
      name: 'claudeEditorialNote',
      type: 'textarea',
      admin: {
        readOnly: true,
        description: 'Why Claude chose (or skipped) this suggestion.',
      },
    },
  ],
}
