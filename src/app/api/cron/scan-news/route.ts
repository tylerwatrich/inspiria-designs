/**
 * CRON A — News scanner
 *
 * Schedule: every 3 hours
 * URL: https://inspiriadigital.com/api/cron/scan-news
 * Header: Authorization: Bearer YOUR_CRON_SECRET
 */

import { NextRequest, NextResponse, after } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { scanForStories, rePrioritizeExisting } from '@/lib/geminiResearch'
import { automationGuard } from '@/lib/automationGuard'

export const maxDuration = 300

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config })

  const guard = await automationGuard(payload)
  if (!guard.check('scanNewsEnabled')) {
    return guard.pausedResponse('News scanning is paused.')
  }

  // Return immediately so cron-job.org doesn't time out — heavy work runs in background
  after(async () => {
    const results = { created: 0, skipped: 0, reprioritized: 0, errors: [] as string[] }

    // ─── Step 1: Scan for new stories ──────────────────────────────────────────

    console.log('[scan-news] Scanning for new stories...')
    let newStories: Awaited<ReturnType<typeof scanForStories>> = []

    try {
      newStories = await scanForStories()
      console.log(`[scan-news] Gemini found ${newStories.length} stories`)
    } catch (e) {
      console.error('[scan-news] scanForStories failed:', e)
      results.errors.push(`scanForStories: ${String(e)}`)
    }

    const recentSuggestions = await payload.find({
      collection: 'article-suggestions',
      where: {
        discoveredAt: {
          greater_than: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        },
      },
      limit: 100,
    })

    const recentHeadlines = new Set(
      recentSuggestions.docs.map((d: any) => d.headline.toLowerCase().trim())
    )

    for (const story of newStories) {
      const normalized = story.headline.toLowerCase().trim()

      if (recentHeadlines.has(normalized)) {
        results.skipped++
        continue
      }

      try {
        await payload.create({
          collection: 'article-suggestions',
          data: {
            headline: story.headline,
            summary: story.summary,
            keyPoints: story.keyPoints.map((point: string) => ({ point })),
            sources: story.sources,
            geminiContext: story.geminiContext,
            vertical: story.vertical,
            priority: story.priority,
            priorityReason: story.priorityReason,
            status: 'pending',
            discoveredAt: new Date().toISOString(),
          },
        })
        results.created++
        recentHeadlines.add(normalized)
      } catch (e) {
        console.error(`[scan-news] Failed to create suggestion "${story.headline}":`, e)
        results.errors.push(`create "${story.headline}": ${String(e)}`)
      }
    }

    // ─── Step 2: Re-prioritize existing suggestions ─────────────────────────────

    if (guard.check('rePrioritizeEnabled')) {
      const pendingAndApproved = await payload.find({
        collection: 'article-suggestions',
        where: { status: { in: ['pending', 'approved'] } },
        limit: 20,
        sort: '-discoveredAt',
      })

      if (pendingAndApproved.docs.length > 0) {
        console.log(`[scan-news] Re-prioritizing ${pendingAndApproved.docs.length} existing suggestions...`)

        try {
          const updates = await rePrioritizeExisting(
            pendingAndApproved.docs.map((d: any) => ({
              id: String(d.id),
              headline: d.headline,
              summary: d.summary,
              discoveredAt: d.discoveredAt,
            }))
          )

          for (const update of updates) {
            try {
              await payload.update({
                collection: 'article-suggestions',
                id: update.id,
                data: {
                  priority: update.newPriority,
                  priorityReason: update.newReason,
                  ...(update.markStale ? { status: 'stale' } : {}),
                },
              })
              results.reprioritized++
            } catch (e) {
              results.errors.push(`reprioritize ${update.id}: ${String(e)}`)
            }
          }
        } catch (e) {
          console.error('[scan-news] rePrioritizeExisting failed:', e)
          results.errors.push(`rePrioritize: ${String(e)}`)
        }
      }
    }

    console.log('[scan-news] Done:', results)
  })

  return NextResponse.json({ success: true, message: 'Scan started' })
}
