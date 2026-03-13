import type { Metadata } from 'next'
import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'
import type { Post } from '@/payload-types'
import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return posts.docs.map(({ slug }) => ({ slug }))
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const { isEnabled: draft } = await draftMode()

  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/blog/' + decodedSlug

  // Pass draft mode to the query function
  const post = await queryPostBySlug({ slug: decodedSlug, draft })

  if (!post) return <PayloadRedirects url={url} />

  return (
    <article className="bg-light-bg dark:bg-zinc-900 pb-24">
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}

      <PostHero post={post} />

      <div className="container pt-12">
        <div className="max-w-[52rem] mx-auto">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-floating px-8 py-10 md:px-14 md:py-14">
            <RichText data={post.content} enableGutter={false} />
          </div>
        </div>
      </div>

      {post.relatedPosts && post.relatedPosts.length > 0 && (
        <div className="container mt-20">
          <div className="max-w-[52rem] mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-8">
              More <span className="text-brand-blue-500">Articles</span>
            </h2>
            <RelatedPosts docs={post.relatedPosts.filter((post) => typeof post === 'object')} />
          </div>
        </div>
      )}
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const { isEnabled: draft } = await draftMode()

  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug, draft })

  return generateMeta({
    doc: post,
    collection: 'posts',
  })
}

// Accept draft as a parameter instead of calling draftMode() again
const queryPostBySlug = cache(async ({ slug, draft }: { slug: string; draft: boolean }) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
