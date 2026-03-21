import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Briefcase, Users, BarChart2, ChevronLeft } from 'lucide-react'

type Args = {
  params: Promise<{ slug: string }>
}

async function getReview(slug: string) {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'industry-reviews',
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: false,
  })
  return result.docs[0] ?? null
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const reviews = await payload.find({
    collection: 'industry-reviews',
    limit: 200,
    overrideAccess: false,
    select: { slug: true },
  })
  return reviews.docs.filter(({ slug }) => !!slug).map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const review = await getReview(slug)
  if (!review) return {}
  return {
    title: `${review.title} | Inspiria Digital`,
    description: review.executiveSummary,
  }
}

function ScoreBar({ score, max = 10, color }: { score: number; max?: number; color: string }) {
  const pct = Math.round((score / max) * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 w-8 text-right">
        {score}/10
      </span>
    </div>
  )
}

export default async function IndustryReviewPage({ params }: Args) {
  const { slug } = await params
  const review = await getReview(slug)

  if (!review) notFound()

  const isUpdate = review.reviewType === 'mid-month-update'
  const publishedDate = review.publishedAt
    ? new Date(review.publishedAt).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <main className="bg-light-bg dark:bg-zinc-900 min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back link */}
        <Link
          href="/industry-review"
          className="inline-flex items-center gap-1 text-sm text-brand-blue-500 hover:text-brand-blue-600 mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          All Industry Reviews
        </Link>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                isUpdate
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-brand-blue-500/10 text-brand-blue-600 dark:text-brand-blue-400'
              }`}
            >
              {isUpdate ? 'Mid-Month Update' : 'Monthly Review'}
            </span>
            {publishedDate && (
              <span className="text-xs text-gray-500 dark:text-gray-400">{publishedDate}</span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4 leading-tight">
            {review.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            {review.executiveSummary}
          </p>
        </header>

        {/* Key Trends */}
        {review.keyTrends && review.keyTrends.length > 0 && (
          <section className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700 p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-5 h-5 text-brand-blue-500" />
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Key Macro Trends</h2>
            </div>
            <ul className="space-y-2">
              {(review.keyTrends as { trend: string }[]).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-blue-500 flex-shrink-0" />
                  {item.trend}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Thriving Industries */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Thriving Industries
            </h2>
          </div>
          <div className="space-y-5">
            {(review.thrivingIndustries as any[]).map((industry, i) => (
              <div
                key={i}
                className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700 p-6"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    {industry.name}
                  </h3>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm whitespace-nowrap">
                    Growth {industry.growthScore}/10
                  </span>
                </div>
                {industry.growthScore && (
                  <div className="mb-4">
                    <ScoreBar score={industry.growthScore} color="bg-emerald-500" />
                  </div>
                )}
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                  {industry.highlights}
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Users className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                        Job Outlook
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{industry.jobOutlook}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Briefcase className="w-4 h-4 text-brand-blue-500" />
                      <span className="text-xs font-semibold text-brand-blue-600 dark:text-brand-blue-400 uppercase tracking-wide">
                        Business Opportunity
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {industry.businessOpportunity}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Downturned Industries */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <TrendingDown className="w-6 h-6 text-rose-500" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Sectors Under Pressure
            </h2>
          </div>
          <div className="space-y-5">
            {(review.downturnedIndustries as any[]).map((industry, i) => (
              <div
                key={i}
                className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700 p-6"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    {industry.name}
                  </h3>
                  <span className="text-rose-600 dark:text-rose-400 font-bold text-sm whitespace-nowrap">
                    Pressure {industry.declineScore}/10
                  </span>
                </div>
                {industry.declineScore && (
                  <div className="mb-4">
                    <ScoreBar score={industry.declineScore} color="bg-rose-500" />
                  </div>
                )}
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                  {industry.highlights}
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                        Risk Factors
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{industry.riskFactors}</p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                        Pivot Suggestions
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {industry.pivotSuggestions}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Actionable Insights */}
        <section className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-brand-blue-500 text-white rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-5 h-5" />
              <h2 className="text-lg font-bold">For Business Owners</h2>
            </div>
            <p className="text-blue-50 text-sm leading-relaxed">{review.forBusinessOwners}</p>
          </div>
          <div className="bg-emerald-600 text-white rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5" />
              <h2 className="text-lg font-bold">For Job Seekers</h2>
            </div>
            <p className="text-emerald-50 text-sm leading-relaxed">{review.forJobSeekers}</p>
          </div>
        </section>

        {/* Disclaimer */}
        {review.dataDisclaimer && (
          <div className="border border-gray-200 dark:border-zinc-700 rounded-xl p-4 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            {review.dataDisclaimer}
          </div>
        )}
      </div>
    </main>
  )
}
