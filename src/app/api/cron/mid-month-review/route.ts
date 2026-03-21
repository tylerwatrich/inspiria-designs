/**
 * CRON — Mid-Month Industry & Job Market Update
 *
 * Schedule: 15th of every month at 8am UTC (0 8 15 * *)
 * URL: https://inspiriadigital.com/api/cron/mid-month-review
 * Header: Authorization: Bearer YOUR_CRON_SECRET
 */

import { NextRequest, NextResponse, after } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { writeIndustryReview } from '@/lib/industryReviewWriter'

export const maxDuration = 300

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const reviewMonth = now.toLocaleString('en-CA', { month: 'long', year: 'numeric' })

  const payload = await getPayload({ config })

  // Check if a mid-month update already exists for this month to avoid duplicates
  const existing = await payload.find({
    collection: 'industry-reviews',
    where: {
      reviewMonth: { equals: reviewMonth },
      reviewType: { equals: 'mid-month-update' },
    },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    return NextResponse.json({
      success: true,
      message: `Mid-month update for ${reviewMonth} already exists (id: ${existing.docs[0].id})`,
    })
  }

  // Return immediately — heavy work runs in background
  after(async () => {
    console.log(`[mid-month-review] Generating ${reviewMonth} mid-month update...`)

    let review
    try {
      review = await writeIndustryReview(reviewMonth, 'mid-month-update')
    } catch (e) {
      console.error('[mid-month-review] AI generation failed:', e)
      return
    }

    try {
      const created = await payload.create({
        collection: 'industry-reviews',
        data: {
          title: review.title,
          slug: review.slug,
          reviewType: 'mid-month-update',
          reviewMonth: review.reviewMonth,
          publishedAt: new Date().toISOString(),
          executiveSummary: review.executiveSummary,
          thrivingIndustries: review.thrivingIndustries,
          downturnedIndustries: review.downturnedIndustries,
          keyTrends: review.keyTrends.map((t) => ({ trend: t })),
          forBusinessOwners: review.forBusinessOwners,
          forJobSeekers: review.forJobSeekers,
          _status: 'published',
        },
      })
      console.log(`[mid-month-review] Published: "${created.title}" (id: ${created.id})`)
    } catch (e) {
      console.error('[mid-month-review] Failed to save review to Payload:', e)
    }
  })

  return NextResponse.json({ success: true, message: `Generating ${reviewMonth} mid-month update` })
}
