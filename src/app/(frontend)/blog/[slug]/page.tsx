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
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Zap, Check } from 'lucide-react'
import { Aurora } from '@/components/Homepage/Aurora'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })
  return posts.docs.filter(({ slug }) => !!slug).map(({ slug }) => ({ slug }))
}

type Args = { params: Promise<{ slug?: string }> }

export default async function Post({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const { isEnabled: draft } = await draftMode()
  const decodedSlug = decodeURIComponent(slug)
  const url = '/blog/' + decodedSlug
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
      ? ((post.heroImage as Media).url ?? undefined)
      : undefined

  const organization = { '@type': 'Organization', name: siteSettings.siteName, url: siteUrl }

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
      ? { author: post.populatedAuthors.map((a) => ({ '@type': 'Person', name: a.name })) }
      : { author: organization }),
  }

  const schemaGraph: object[] = [articleSchema]
  if (populatedFaqs.length > 0) {
    schemaGraph.push({
      '@type': 'FAQPage',
      mainEntity: populatedFaqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    })
  }

  const ldJson = { '@context': 'https://schema.org', '@graph': schemaGraph }

  // ─── Shared glass card style ───────────────────────────────────────────────
  const glassCard: React.CSSProperties = {
    background: 'rgba(255,255,255,0.02)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '24px',
  }

  return (
    // data-theme="dark" activates dark: Tailwind variants (including dark:prose-invert) for all children
    <article className="pb-24" data-theme="dark" style={{ color: '#fff' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />

      <Aurora />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}

      <PostHero post={post} />

      <div className="container pt-4">
        <div className="max-w-[52rem] mx-auto space-y-6">
          {/* Hidden summary for SEO */}
          {post.articleSummary && (
            <div className="hidden">
              <p>{post.articleSummary}</p>
            </div>
          )}

          {/* Key Takeaways */}
          {post.keyTakeaways && post.keyTakeaways.length > 0 && (
            <section
              className="relative overflow-hidden p-6 md:p-8"
              style={{
                ...glassCard,
                border: '1px solid rgba(0,240,255,0.15)',
              }}
            >
              {/* Faint background glyph */}
              <div
                className="absolute top-0 right-0 p-8 pointer-events-none translate-x-1/4 -translate-y-1/4"
                style={{ opacity: 0.06 }}
              >
                <Zap className="w-48 h-48" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-1.5 rounded-lg" style={{ background: 'rgba(0,240,255,0.15)' }}>
                    <Zap className="w-4 h-4" style={{ color: '#00f0ff' }} fill="currentColor" />
                  </div>
                  <h2
                    className="text-xs font-black uppercase tracking-[0.2em]"
                    style={{ color: '#00f0ff' }}
                  >
                    Key Insights
                  </h2>
                </div>

                <ul className="grid sm:grid-cols-2 gap-5">
                  {post.keyTakeaways.map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <Check className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#00f0ff' }} />
                      <p
                        className="text-sm md:text-base font-semibold leading-snug"
                        style={{ color: 'rgba(255,255,255,0.85)' }}
                      >
                        {item.point}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Last updated */}
          {post.articleUpdates &&
            post.articleUpdates.length > 0 &&
            (() => {
              const latest = post.articleUpdates[post.articleUpdates.length - 1]
              return (
                <p className="text-sm" style={{ color: '#94a3b8' }}>
                  Last updated:{' '}
                  {new Date(latest.updatedAt as string).toLocaleDateString('en-CA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )
            })()}

          {/* Article body */}
          <div style={glassCard} className="px-8 py-10 md:px-14 md:py-14">
            {/* Inline Trade Compass prompt */}
            {post.cta === 'trade-compass' && (
              <div
                className="mb-8 p-6 flex flex-col sm:flex-row items-center gap-4 rounded-xl"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.25)',
                }}
              >
                <div className="flex-1">
                  <p className="font-semibold text-white mb-1">Find your next export market</p>
                  <p className="text-sm" style={{ color: '#94a3b8' }}>
                    Use our{' '}
                    <Link
                      href="/trade-compass"
                      className="underline underline-offset-2 font-medium hover:text-red-400 transition-colors"
                      style={{ color: '#f87171' }}
                    >
                      Trade Compass
                    </Link>{' '}
                    to discover which international markets are the best fit for your Canadian
                    business — powered by real trade data.
                  </p>
                </div>
                <Link
                  href="/trade-compass"
                  className="shrink-0 font-semibold py-2.5 px-6 rounded-lg transition-colors whitespace-nowrap text-white hover:opacity-90"
                  style={{ background: '#dc2626' }}
                >
                  Try Trade Compass →
                </Link>
              </div>
            )}

            <RichText data={post.content} enableGutter={false} />
          </div>

          {/* Bottom CTA */}
          {post.cta === 'trade-compass' ? (
            <section
              className="p-8 md:p-12 text-center rounded-3xl"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
              }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">
                Discover your best export markets
              </h2>
              <p className="max-w-xl mx-auto mb-6" style={{ color: '#94a3b8' }}>
                Our Trade Compass analyzes real Canadian trade data to pinpoint which international
                markets offer the biggest opportunity for your business.
              </p>
              <Link
                href="/trade-compass"
                className="inline-block font-bold py-4 px-10 rounded-full text-[12px] tracking-widest uppercase transition-all hover:opacity-90"
                style={{ background: '#dc2626', color: '#fff' }}
              >
                Explore Trade Compass
              </Link>
            </section>
          ) : (
            <section
              className="p-8 md:p-12 text-center"
              style={{
                ...glassCard,
                border: '1px solid rgba(0,240,255,0.15)',
              }}
            >
              <h2
                className="text-xs font-bold tracking-[0.4em] uppercase mb-5"
                style={{ color: '#00f0ff' }}
              >
                Get Started
              </h2>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                Ready to grow your business online?
              </h3>
              <p className="max-w-xl mx-auto mb-8" style={{ color: '#94a3b8' }}>
                Free consultation, no pressure. Tell us about your business and where you want to
                take it.
              </p>
              <LeadCaptureModal
                triggerLabel="Book a Free Strategy Call"
                triggerClassName="bg-white text-black px-10 py-4 rounded-full text-[12px] tracking-widest uppercase font-bold transition-all hover:bg-cyan-300 hover:shadow-[0_0_35px_rgba(0,240,255,0.5)]"
                source="post"
              />
            </section>
          )}

          {/* FAQ */}
          {populatedFaqs.length > 0 && (
            <section className="mt-4">
              <h2 className="text-xl font-bold mb-6 text-white">Frequently Asked Questions</h2>
              <div
                className="overflow-hidden"
                style={glassCard}
              >
                {populatedFaqs.map((faq, i) => (
                  <details
                    key={faq.id}
                    className="group"
                    style={i > 0 ? { borderTop: '1px solid rgba(255,255,255,0.06)' } : undefined}
                  >
                    <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none select-none transition-colors hover:bg-white/5">
                      <span className="font-semibold text-white text-base leading-snug">
                        {faq.question}
                      </span>
                      <span
                        className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center group-open:rotate-45 transition-transform duration-200"
                        style={{
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: 'rgba(255,255,255,0.4)',
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path
                            d="M5 1v8M1 5h8"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-5 pt-1">
                      <p
                        className="leading-relaxed text-sm md:text-base"
                        style={{ color: '#94a3b8' }}
                      >
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

      {/* Related posts */}
      {post.relatedPosts && post.relatedPosts.length > 0 && (
        <div className="container mt-24">
          <div className="max-w-[52rem] mx-auto">
            <h2
              className="text-2xl md:text-3xl font-bold mb-8"
              style={{
                background: 'linear-gradient(180deg, #fff 30%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              More Articles
            </h2>
            <RelatedPosts docs={post.relatedPosts.filter((p) => typeof p === 'object')} />
          </div>
        </div>
      )}
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const { isEnabled: draft } = await draftMode()
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug, draft })
  return generateMeta({ doc: post, collection: 'posts' })
}

const getSiteSettings = cache(async () => {
  const payload = await getPayload({ config: configPromise })
  return payload.findGlobal({ slug: 'site-settings' })
})

const queryPostBySlug = cache(async ({ slug, draft }: { slug: string; draft: boolean }) => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    depth: 2,
    where: { slug: { equals: slug } },
  })
  return result.docs?.[0] || null
})
