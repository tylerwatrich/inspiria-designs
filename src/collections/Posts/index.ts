import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  UnorderedListFeature, // Import for bullet points
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
  // This config controls what's populated by default when a post is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'posts'>
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
    defaultColumns: ['title', 'slug', 'updatedAt'],
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
              name: 'url',
              type: 'text',
              admin: {
                readOnly: true,
                position: 'sidebar', // optional: keeps it out of the main form
              },
              hooks: {
                afterRead: [
                  ({ originalDoc }) => {
                    // Ensure the slug exists before returning the URL
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
              type: 'select',
              label: 'CTA',
              defaultValue: 'blue',
              admin: {
                description: 'Which call-to-action to show on this post.',
              },
              options: [
                { label: 'Strategy Call (blue)', value: 'blue' },
                { label: 'Trade Compass (red)', value: 'trade-compass' },
              ],
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
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
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
    // This field is only used to populate the user data via the `populateAuthors` hook
    // This is because the `user` collection has access control locked to protect user privacy
    // GraphQL will also not return mutated user data that differs from the underlying schema
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
  ],
  hooks: {
    // afterChange: [revalidatePost],
    afterRead: [populateAuthors],
    // afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
