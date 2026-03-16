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
import type { Post, Faq, Media } from '@/payload-types'
import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import { getServerSideURL } from '@/utilities/getURL'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Check, Zap, Info } from 'lucide-react'

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

  const populatedFaqs = (post.faqs ?? []).filter(
    (f): f is Faq => typeof f === 'object' && f !== null,
  )

  const [siteSettings] = await Promise.all([getSiteSettings()])
  const siteUrl = getServerSideURL()
  const postUrl = `${siteUrl}/blog/${decodedSlug}`
  const heroImageUrl =
    post.heroImage && typeof post.heroImage === 'object'
      ? (post.heroImage as Media).url ?? undefined
      : undefined

  const organization = {
    '@type': 'Organization',
    name: siteSettings.siteName,
    url: siteUrl,
  }

  const articleSchema = {
    '@type': 'Article',
    headline: post.title,
    ...(post.articleSummary || post.meta?.description
      ? { description: post.articleSummary || post.meta?.description }
      : {}),
    url: postUrl,
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    dateModified: post.updatedAt,
    publisher: organization,
    ...(heroImageUrl ? { image: heroImageUrl } : {}),
    ...(post.populatedAuthors && post.populatedAuthors.length > 0
      ? {
          author: post.populatedAuthors.map((a) => ({
            '@type': 'Person',
            name: a.name,
          })),
        }
      : { author: organization }),
  }

  const schemaGraph: object[] = [articleSchema]

  if (populatedFaqs.length > 0) {
    schemaGraph.push({
      '@type': 'FAQPage',
      mainEntity: populatedFaqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    })
  }

  const ldJson = {
    '@context': 'https://schema.org',
    '@graph': schemaGraph,
  }

  return (
    <article className="bg-light-bg dark:bg-zinc-900 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}

      <PostHero post={post} />

      <div className="container pt-12">
        <div className="max-w-[52rem] mx-auto">
          {/* Article Summary & Takeaways above the article block */}
          <div className="space-y-6 mb-10">
            {/* Article Summary (Hidden from view but present for SEO/AI) */}
            {post.articleSummary && (
              <div className="hidden">
                <p>{post.articleSummary}</p>
              </div>
            )}

            {/* Key Takeaways */}
            {post.keyTakeaways && post.keyTakeaways.length > 0 && (
              <section className="bg-zinc-900 dark:bg-black rounded-2xl p-6 md:p-8 text-white shadow-floating-lg overflow-hidden relative animate-in fade-in slide-in-from-top-4 duration-700 delay-100 fill-both">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                  <Zap className="w-48 h-48" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-brand-blue-500 p-1.5 rounded-lg">
                      <Zap className="w-4 h-4 text-white fill-current" />
                    </div>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em]">Key Insights</h2>
                  </div>
                  <ul className="grid sm:grid-cols-2 gap-6">
                    {post.keyTakeaways.map((item, i) => (
                      <li key={i} className="flex gap-3">
                        <Check className="w-5 h-5 text-brand-blue-500 shrink-0 mt-0.5" />
                        <p className="text-sm md:text-base font-semibold leading-snug text-zinc-100">
                          {item.point}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}
          </div>

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
            {/* RichText content */}
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

          {/* FAQ Section */}
          {populatedFaqs.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-6">
                Frequently Asked Questions
              </h2>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-2xl overflow-hidden bg-white dark:bg-zinc-800 shadow-floating">
                {populatedFaqs.map((faq) => (
                  <details key={faq.id} className="group">
                    <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none select-none hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-100 text-base leading-snug">
                        {faq.question}
                      </span>
                      <span className="shrink-0 w-5 h-5 rounded-full border border-zinc-300 dark:border-zinc-600 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-open:rotate-45 transition-transform duration-200">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-5 pt-1">
                      <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-sm md:text-base">
                        {faq.answer}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
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

const getSiteSettings = cache(async () => {
  const payload = await getPayload({ config: configPromise })
  return payload.findGlobal({ slug: 'site-settings' })
})

// Accept draft as a parameter instead of calling draftMode() again
const queryPostBySlug = cache(async ({ slug, draft }: { slug: string; draft: boolean }) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    depth: 2,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
