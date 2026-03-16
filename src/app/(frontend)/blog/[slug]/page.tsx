import type { Metadata } from 'next'
import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { LeadCaptureModal } from '@/components/LeadCaptureModal'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import Link from 'next/link'
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

  return posts.docs.filter(({ slug }) => !!slug).map(({ slug }) => ({ slug }))
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
            {post.cta === 'trade-compass' && (
              <div className="mb-8 border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Find your next export market
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use our{' '}
                    <Link
                      href="/trade-compass"
                      className="text-red-600 dark:text-red-400 underline underline-offset-2 font-medium hover:text-red-700"
                    >
                      Trade Compass
                    </Link>{' '}
                    to discover which international markets are the best fit for your Canadian
                    business — powered by real trade data.
                  </p>
                </div>
                <Link
                  href="/trade-compass"
                  className="shrink-0 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors whitespace-nowrap"
                >
                  Try Trade Compass →
                </Link>
              </div>
            )}
            <RichText data={post.content} enableGutter={false} />
          </div>

          {post.cta === 'trade-compass' ? (
            <section className="mt-6 bg-red-600 text-white rounded-2xl shadow-floating-lg p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Discover your best export markets
              </h2>
              <p className="text-red-100 max-w-xl mx-auto mb-6">
                Our Trade Compass analyzes real Canadian trade data to pinpoint which international
                markets offer the biggest opportunity for your business.
              </p>
              <Link
                href="/trade-compass"
                className="inline-block bg-white text-red-600 font-bold py-3 px-8 rounded-lg shadow-floating hover:bg-red-50 transition-all transform hover:scale-105"
              >
                Explore Trade Compass
              </Link>
            </section>
          ) : (
            <section className="mt-10 bg-brand-blue-500 text-white rounded-2xl shadow-floating-lg p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Ready to grow your business online?
              </h2>
              <p className="text-blue-100 max-w-xl mx-auto mb-6">
                Free consultation, no pressure. Tell us about your business and where you want to
                take it.
              </p>
              <LeadCaptureModal
                triggerLabel="Book a Free Strategy Call"
                triggerClassName="bg-white text-brand-blue-600 font-bold py-3 px-8 rounded-lg shadow-floating hover:bg-gray-100 transition-all transform hover:scale-105"
                source="post"
              />
            </section>
          )}
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
