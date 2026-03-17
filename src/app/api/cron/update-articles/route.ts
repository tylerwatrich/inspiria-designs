/**
 * CRON D — Weekly article updater (recent posts)
 *
 * Schedule: Every Monday at 7am UTC (0 7 * * 1)
 * URL: https://inspiriadigital.com/api/cron/update-articles
 * Header: Authorization: Bearer YOUR_CRON_SECRET
 */

import { NextRequest, NextResponse, after } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { runUpdatePass } from '@/lib/updateRunner'
import { automationGuard } from '@/lib/automationGuard'

export const maxDuration = 300

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

  // Return immediately so cron-job.org doesn't time out — heavy work runs in background
  after(async () => {
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
    console.log(`[update-articles] Done — ${updated.length}/${results.length} updated`)
  })

  return NextResponse.json({ success: true, message: 'Update pass started' })
}
