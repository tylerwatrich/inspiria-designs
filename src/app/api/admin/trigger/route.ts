/**
 * Admin trigger endpoint — lets admin users fire cron jobs manually from the dashboard.
 *
 * Instead of HTTP-fetching the cron routes (which has URL-resolution issues on preview
 * deployments), we import their GET handlers directly and call them with a synthetic request.
 * after() still works — it registers against the current request lifecycle regardless of
 * which handler originally called it.
 */

import { NextRequest, NextResponse } from 'next/server'
import { GET as scanNews } from '@/app/api/cron/scan-news/route'
import { GET as writePost } from '@/app/api/cron/write-post/route'
import { GET as generateImages } from '@/app/api/cron/generate-images/route'
import { GET as qualityAudit } from '@/app/api/cron/quality-audit/route'
import { GET as updateArticles } from '@/app/api/cron/update-articles/route'

const JOBS = {
  'scan-news': scanNews,
  'write-post': writePost,
  'generate-images': generateImages,
  'quality-audit': qualityAudit,
  'update-articles': updateArticles,
} as const

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const job = body?.job as string

    if (!Object.hasOwn(JOBS, job)) {
      return NextResponse.json({ error: `Unknown job: ${job}` }, { status: 400 })
    }

    // Build a synthetic request that satisfies the cron route's CRON_SECRET auth check,
    // then call its GET handler in-process — no HTTP round-trip, no URL resolution needed.
    const syntheticReq = new NextRequest(
      new URL(`/api/cron/${job}`, req.nextUrl.origin),
      { headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` } },
    )

    return JOBS[job as keyof typeof JOBS](syntheticReq)
  } catch (e: any) {
    console.error('[admin/trigger] Unhandled error:', e)
    return NextResponse.json({ error: e?.message ?? 'Internal server error' }, { status: 500 })
  }
}
