import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Calendar, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Industry & Job Market Reviews | Inspiria Digital',
  description:
    'Monthly Canadian industry and job market reviews — find out which sectors are thriving, which are under pressure, and what it means for your business or career.',
}

export const revalidate = 3600

export default async function IndustryReviewIndexPage() {
  const payload = await getPayload({ config: configPromise })

  const reviews = await payload.find({
    collection: 'industry-reviews',
    limit: 24,
    sort: '-publishedAt',
    overrideAccess: false,
  })

  const latest = reviews.docs[0] ?? null
  const archive = reviews.docs.slice(1)

  // Group archive by month
  const grouped: Record<string, typeof archive> = {}
  for (const review of archive) {
    const month = review.reviewMonth ?? 'Other'
    if (!grouped[month]) grouped[month] = []
    grouped[month].push(review)
  }

  return (
    <main className="bg-light-bg dark:bg-zinc-900 min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-3">
            Industry & Job Market Reviews
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
            Monthly analysis of Canada&apos;s top-performing and struggling sectors — so you can
            pivot your business, hire into growth areas, or find your next career move.
          </p>
        </div>

        {/* Latest Review Highlight */}
        {latest && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold text-brand-blue-500 uppercase tracking-widest">
                Latest
              </span>
            </div>
            <Link href={`/industry-review/${latest.slug}`} className="group block">
              <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700 p-7 hover:border-brand-blue-300 dark:hover:border-brand-blue-600 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      latest.reviewType === 'mid-month-update'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-brand-blue-500/10 text-brand-blue-600 dark:text-brand-blue-400'
                    }`}
                  >
                    {latest.reviewType === 'mid-month-update' ? 'Mid-Month Update' : 'Monthly Review'}
                  </span>
                  {latest.publishedAt && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(latest.publishedAt).toLocaleDateString('en-CA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3 group-hover:text-brand-blue-500 transition-colors">
                  {latest.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  {latest.executiveSummary}
                </p>
                <div className="flex items-center gap-6 text-sm">
                  {latest.thrivingIndustries && (
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="w-4 h-4" />
                      {(latest.thrivingIndustries as any[]).length} thriving sectors
                    </span>
                  )}
                  {latest.downturnedIndustries && (
                    <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                      <TrendingDown className="w-4 h-4" />
                      {(latest.downturnedIndustries as any[]).length} under pressure
                    </span>
                  )}
                  <span className="ml-auto flex items-center gap-1 text-brand-blue-500 font-medium">
                    Read full review <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* What's Inside */}
        <section className="grid md:grid-cols-3 gap-5 mb-12">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-zinc-700">
            <TrendingUp className="w-8 h-8 text-emerald-500 mb-3" />
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">Thriving Sectors</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Top industries with strong growth signals, job demand, and business opportunity right
              now.
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-zinc-700">
            <TrendingDown className="w-8 h-8 text-rose-500 mb-3" />
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">
              Sectors Under Pressure
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Industries contracting or facing headwinds — with pivot strategies for those affected.
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-zinc-700">
            <Calendar className="w-8 h-8 text-brand-blue-500 mb-3" />
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">Twice Monthly</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Full review on the 1st. Mid-month pulse check on the 15th. Always current.
            </p>
          </div>
        </section>

        {/* Archive */}
        {Object.keys(grouped).length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">
              Previous Reviews
            </h2>
            <div className="space-y-8">
              {Object.entries(grouped).map(([month, monthReviews]) => (
                <div key={month}>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
                    {month}
                  </h3>
                  <div className="space-y-3">
                    {monthReviews.map((review) => (
                      <Link
                        key={review.id}
                        href={`/industry-review/${review.slug}`}
                        className="group flex items-center justify-between bg-white dark:bg-zinc-800 rounded-xl px-5 py-4 shadow-sm border border-gray-100 dark:border-zinc-700 hover:border-brand-blue-300 dark:hover:border-brand-blue-600 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                              review.reviewType === 'mid-month-update'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                : 'bg-brand-blue-500/10 text-brand-blue-600 dark:text-brand-blue-400'
                            }`}
                          >
                            {review.reviewType === 'mid-month-update' ? 'Mid-Month' : 'Monthly'}
                          </span>
                          <span className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-brand-blue-500 transition-colors">
                            {review.title}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand-blue-500 transition-colors flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {reviews.docs.length === 0 && (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium">First review coming on the 1st of next month.</p>
            <p className="text-sm mt-1">Check back soon — or bookmark this page.</p>
          </div>
        )}
      </div>
    </main>
  )
}
