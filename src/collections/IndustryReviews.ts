import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'
import { authenticatedOrPublished } from '../access/authenticatedOrPublished'

export const IndustryReviews: CollectionConfig = {
  slug: 'industry-reviews',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'reviewType', 'reviewMonth', 'updatedAt'],
    group: 'Content',
    useAsTitle: 'title',
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. "March 2026 Industry & Job Market Review"',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL slug, e.g. "march-2026-industry-review"',
      },
    },
    {
      name: 'reviewType',
      type: 'select',
      required: true,
      options: [
        { label: 'Monthly Review (1st of month)', value: 'monthly-review' },
        { label: 'Mid-Month Update (15th of month)', value: 'mid-month-update' },
      ],
    },
    {
      name: 'reviewMonth',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. "March 2026"',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'executiveSummary',
      type: 'textarea',
      required: true,
      admin: {
        description: '2–4 sentence overview of the current market landscape',
      },
    },
    {
      name: 'thrivingIndustries',
      type: 'array',
      required: true,
      minRows: 3,
      maxRows: 8,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: { description: 'Industry name, e.g. "Construction & Infrastructure"' },
        },
        {
          name: 'growthScore',
          type: 'number',
          min: 1,
          max: 10,
          admin: {
            description: 'Growth momentum score 1–10',
          },
        },
        {
          name: 'highlights',
          type: 'textarea',
          required: true,
          admin: { description: 'What is driving growth in this sector right now' },
        },
        {
          name: 'jobOutlook',
          type: 'textarea',
          required: true,
          admin: { description: 'Job opportunities and in-demand roles in this sector' },
        },
        {
          name: 'businessOpportunity',
          type: 'textarea',
          required: true,
          admin: { description: 'How a small business owner can capitalize on this sector' },
        },
      ],
    },
    {
      name: 'downturnedIndustries',
      type: 'array',
      required: true,
      minRows: 3,
      maxRows: 8,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: { description: 'Industry name' },
        },
        {
          name: 'declineScore',
          type: 'number',
          min: 1,
          max: 10,
          admin: {
            description: 'Decline severity score 1–10 (10 = most severe)',
          },
        },
        {
          name: 'highlights',
          type: 'textarea',
          required: true,
          admin: { description: 'What is driving the downturn' },
        },
        {
          name: 'riskFactors',
          type: 'textarea',
          required: true,
          admin: { description: 'Specific risks for businesses and workers in this sector' },
        },
        {
          name: 'pivotSuggestions',
          type: 'textarea',
          required: true,
          admin: { description: 'Adjacent sectors or pivots worth considering' },
        },
      ],
    },
    {
      name: 'keyTrends',
      type: 'array',
      fields: [
        {
          name: 'trend',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Cross-sector macroeconomic trends shaping the landscape',
      },
    },
    {
      name: 'forBusinessOwners',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Actionable insights specifically for small business owners (2–4 sentences)',
      },
    },
    {
      name: 'forJobSeekers',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Actionable insights specifically for job seekers (2–4 sentences)',
      },
    },
    {
      name: 'dataDisclaimer',
      type: 'textarea',
      defaultValue:
        'This review is AI-generated based on publicly available economic data, Statistics Canada reports, and job market signals as of the review date. It is intended for general informational purposes and does not constitute financial or career advice.',
      admin: {
        description: 'Disclaimer shown at bottom of every review',
      },
    },
  ],
}
