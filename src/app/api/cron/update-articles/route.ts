/**
 * CRON D — Weekly article updater (recent posts)
 *
 * Schedule: Every Monday at 7am UTC (0 7 * * 1)
 * URL: https://inspiria.ca/api/cron/update-articles
 * Header: Authorization: Bearer YOUR_CRON_SECRET
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { runUpdatePass } from '@/lib/updateRunner'
import { automationGuard } from '@/lib/automationGuard'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config })

  const guard = await automationGuard(payload)
  if (!guard.check('weeklyUpdateEnabled')) {
    return guard.pausedResponse('Weekly article updates are paused.')
  }

  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

  const { docs: recentPosts } = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { createdAt: { greater_than: threeMonthsAgo.toISOString() } },
      ],
    },
    limit: 100,
    depth: 0,
  })

  console.log(`[update-articles] Checking ${recentPosts.length} recent posts for updates`)

  const results = await runUpdatePass(recentPosts, payload)

  const updated = results.filter((r) => r.updated)
  const skipped = results.filter((r) => !r.updated)

  return NextResponse.json({
    success: true,
    checked: results.length,
    updated: updated.length,
    skipped: skipped.length,
    updates: updated.map((r) => ({ title: r.title, updateNumber: r.updateNumber, summary: r.summary })),
  })
}
