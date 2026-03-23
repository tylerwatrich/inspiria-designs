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

  const run = await payload.create({
    collection: 'job-runs',
    data: { jobType: 'scan-news', status: 'running', startedAt: new Date().toISOString() },
  })

  // Return immediately so cron-job.org doesn't time out — heavy work runs in background
  after(async () => {
    const results = { created: 0, skipped: 0, reprioritized: 0, errors: [] as string[] }
    let jobStatus: 'completed' | 'error' = 'completed'
    let message = 'Completed'

    try {
      // ─── Step 1: Scan for new stories ──────────────────────────────────────────

      console.log('[scan-news] Scanning for new stories...')
      let newStories: Awaited<ReturnType<typeof scanForStories>> = []

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const [recentSuggestions, recentPosts] = await Promise.all([
        payload.find({
          collection: 'article-suggestions',
          where: { discoveredAt: { greater_than: sevenDaysAgo } },
          limit: 100,
        }),
        payload.find({
          collection: 'posts',
          where: { createdAt: { greater_than: sevenDaysAgo } },
          limit: 20,
          sort: '-createdAt',
        }),
      ])

      // Cap to 40 most-recent headlines — each extra headline adds tokens to every scan prompt
      const recentlyCovered = [
        ...recentSuggestions.docs.map((d: any) => ({ headline: d.headline })),
        ...recentPosts.docs.map((d: any) => ({ headline: d.title })),
      ].slice(0, 40)

      const scanDelay = () => new Promise((resolve) => setTimeout(resolve, 65_000))

      try {
        // Run area scans sequentially with 45s gaps — each scan + web-search round trip
        // consumes a large slice of the 50k input-tokens/min budget; the gap lets the
        // window roll over before the next scan fires.
        const cbnStories = await scanForStories('canadian-business-news', recentlyCovered)
        await scanDelay()
        const iiStories = await scanForStories('industry-insights', recentlyCovered)
        await scanDelay()
        const resourceStories = await scanForStories('resources', recentlyCovered)
        newStories = [...cbnStories, ...iiStories, ...resourceStories]
        console.log(`[scan-news] Found ${cbnStories.length} CBN + ${iiStories.length} Industry + ${resourceStories.length} Resources stories`)
      } catch (e) {
        console.error('[scan-news] scanForStories failed:', e)
        results.errors.push(`scanForStories: ${String(e)}`)
      }

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
              area: story.area,
              vertical: story.vertical,
              priority: story.priority,
              priorityReason: story.priorityReason,
              smbRelevance: story.smbRelevance,
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
      // Wait 60s before rePrioritize — the 3 area scans consume most of the
      // 50k input tokens/min budget; this lets the rate-limit window roll over.

      await new Promise((resolve) => setTimeout(resolve, 60_000))

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

      message = `Created ${results.created}, skipped ${results.skipped}, reprioritized ${results.reprioritized}${results.errors.length ? ` (${results.errors.length} errors: ${results.errors[0]})` : ''}`
      console.log('[scan-news] Done:', results)
    } catch (e) {
      jobStatus = 'error'
      message = String(e)
      console.error('[scan-news] Unhandled error:', e)
    } finally {
      try {
        await payload.update({
          collection: 'job-runs',
          id: run.id,
          data: { status: jobStatus, completedAt: new Date().toISOString(), message },
        })
      } catch {}
    }
  })

  return NextResponse.json({ success: true, message: 'Scan started' })
}
