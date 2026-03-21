import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  UnorderedListFeature,
  OrderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Banner } from '../../blocks/Banner/config'
import { Code } from '../../blocks/Code/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { populateAuthors } from './hooks/populateAuthors'
import { revalidateDelete, revalidatePost } from './hooks/revalidatePost'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Posts: CollectionConfig<'posts'> = {
  slug: 'posts',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    categories: true,
    updatedAt: true,
    _status: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    defaultColumns: ['title', 'slug', 'qualityAudit.flag', 'qualityAudit.score', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'posts',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'posts',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'ui',
      name: 'aiWriteButton',
      admin: {
        components: {
          Field: '@/components/admin/AIWriteButton#AIWriteButton',
        },
      },
    },
    {
      type: 'ui',
      name: 'generateImageButton',
      admin: {
        components: {
          Field: '@/components/admin/GenerateImageButton#GenerateImageButton',
        },
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'heroImageUrl',
              type: 'text',
              label: 'Hero Image URL (AI-generated)',
              admin: {
                readOnly: true,
                description: 'Auto-populated by the write-post cron via Black Forest Labs Flux. Requires BFL_API_KEY env var.',
              },
            },
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ defaultFeatures }) => {
                  return [
                    ...defaultFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                    UnorderedListFeature(),
                    OrderedListFeature(),
                  ]
                },
              }),
              label: false,
              required: true,
            },
            {
              name: 'articleSummary',
              type: 'textarea',
              label: 'Article Summary',
              admin: {
                description: 'A brief overview of what this article covers. Displayed at the top of the post.',
              },
            },
            {
              name: 'keyTakeaways',
              type: 'array',
              label: 'Key Takeaways',
              maxRows: 6,
              admin: {
                description: 'Bullet points summarizing the main insights of this article.',
              },
              fields: [
                {
                  name: 'point',
                  type: 'text',
                  label: 'Takeaway',
                  required: true,
                },
              ],
            },
            {
              name: 'url',
              type: 'text',
              admin: {
                readOnly: true,
                position: 'sidebar',
              },
              hooks: {
                afterRead: [
                  ({ originalDoc }) => {
                    if (!originalDoc?.slug) return ''
                    return `/blog/${originalDoc.slug}`
                  },
                ],
              },
            },
          ],
          label: 'Content',
        },
        {
          fields: [
            {
              name: 'faqs',
              type: 'relationship',
              relationTo: 'faqs',
              hasMany: true,
              label: 'FAQs',
              admin: {
                description: 'Assign FAQ entries to display on this post.',
              },
            },
            {
              name: 'relatedPosts',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              filterOptions: ({ id }) => {
                return {
                  id: {
                    not_in: [id],
                  },
                }
              },
              hasMany: true,
              relationTo: 'posts',
            },
            {
              name: 'categories',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              hasMany: true,
              relationTo: 'categories',
            },
            {
              name: 'funnelStage',
              type: 'select',
              label: 'Funnel Stage',
              admin: {
                description: 'Where in the buyer journey does this post target?',
              },
              options: [
                { label: 'Awareness', value: 'awareness' },
                { label: 'Consideration', value: 'consideration' },
                { label: 'Conversion', value: 'conversion' },
              ],
            },
            {
              name: 'aiGenerated',
              type: 'checkbox',
              label: 'AI-Generated',
              defaultValue: false,
              admin: {
                description: 'Check if this post was written or heavily drafted by AI.',
              },
            },
            {
              name: 'cta',
              type: 'relationship',
              relationTo: 'ctas',
              hasMany: false,
              label: 'CTA',
              admin: {
                description: 'Which call-to-action to show on this post. Manage CTAs in the CTAs collection.',
              },
            },
          ],
          label: 'Meta',
        },
        {
          label: 'Demographics',
          fields: [
            {
              name: 'articleType',
              type: 'relationship',
              relationTo: 'article-types',
              hasMany: false,
              label: 'Article Type',
              admin: {
                description: 'The content format of this post (Guide, Pain Point, Listicle, etc.)',
              },
            },
            {
              name: 'targetIndustry',
              type: 'relationship',
              relationTo: 'target-audience',
              hasMany: true,
              label: 'Target Industry',
              admin: {
                description: 'Which industry vertical(s) is this post written for?',
              },
            },
            {
              name: 'targetBusinessSize',
              type: 'select',
              hasMany: true,
              label: 'Target Business Size',
              admin: {
                description: 'Which business size(s) within that industry does this post address?',
              },
              options: [
                { label: 'Solo / Freelancer (1)', value: 'solo' },
                { label: 'Micro (2–10 employees)', value: 'micro' },
                { label: 'Small (11–50 employees)', value: 'small' },
                { label: 'Medium (51–250 employees)', value: 'medium' },
                { label: 'Large (250+ employees)', value: 'large' },
              ],
            },
          ],
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            {
              name: 'primaryKeyword',
              type: 'text',
              label: 'Primary Keyword',
              admin: {
                description: 'The main SEO keyword this post is targeting. Used for reporting and content gap analysis.',
              },
            },
            {
              name: 'targetKeyword',
              type: 'text',
              label: 'Target Keyword',
              admin: {
                description: 'The specific search query you want this post to rank for.',
              },
            },
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'authors',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'users',
    },
    {
      name: 'populatedAuthors',
      type: 'array',
      access: {
        update: () => false,
      },
      admin: {
        disabled: true,
        readOnly: true,
      },
      fields: [
        {
          name: 'id',
          type: 'text',
        },
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      index: true,
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    // ─── Quality Audit (populated by monthly cron) ───────────────────────────
    {
      name: 'qualityAudit',
      type: 'group',
      admin: { description: 'Populated automatically by the monthly quality scan.' },
      fields: [
        {
          name: 'score',
          type: 'number',
          min: 0,
          max: 100,
          admin: { description: '0–100. 80+ is solid. 60–79 needs attention. Below 60 is flagged.', readOnly: true },
        },
        {
          name: 'flag',
          type: 'select',
          options: [
            { label: '✅ Clean', value: 'clean' },
            { label: '⚠️ Needs Attention', value: 'needs-attention' },
            { label: '🚨 AI Slop', value: 'ai-slop' },
            { label: '🚨 Incoherent', value: 'incoherent' },
            { label: '🚨 Both', value: 'both' },
          ],
          admin: { readOnly: true },
        },
        {
          name: 'issues',
          type: 'array',
          admin: { readOnly: true },
          fields: [{ name: 'issue', type: 'text' }],
        },
        {
          name: 'reviewNote',
          type: 'textarea',
          admin: { readOnly: true, rows: 4 },
        },
        {
          name: 'lastReviewedAt',
          type: 'date',
          admin: { readOnly: true },
        },
      ],
    },
    // ─── Article Updates (populated by weekly/monthly update crons) ──────────
    {
      name: 'lastCheckedForUpdates',
      type: 'date',
      admin: { readOnly: true },
    },
    {
      name: 'articleUpdates',
      type: 'array',
      admin: { readOnly: true },
      fields: [
        { name: 'updateNumber', type: 'number', admin: { readOnly: true } },
        { name: 'updatedAt', type: 'date', admin: { readOnly: true } },
        { name: 'summary', type: 'text', admin: { readOnly: true } },
        { name: 'updateText', type: 'textarea', admin: { readOnly: true, rows: 4 } },
      ],
    },
  ],
  hooks: {
    // afterChange: [revalidatePost],
    afterRead: [populateAuthors],
    // afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
