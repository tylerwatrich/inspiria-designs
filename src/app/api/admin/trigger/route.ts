/**
 * Admin trigger endpoint — lets admin users fire cron jobs manually from the dashboard.
 * No separate auth check: consistent with other /api/admin/* routes in this codebase.
 * The underlying cron routes still enforce CRON_SECRET, so external callers can't bypass.
 */

import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_JOBS = [
  'scan-news',
  'write-post',
  'generate-images',
  'quality-audit',
  'update-articles',
] as const

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const job = body?.job as string

    if (!ALLOWED_JOBS.includes(job as (typeof ALLOWED_JOBS)[number])) {
      return NextResponse.json({ error: `Unknown job: ${job}` }, { status: 400 })
    }

    const cronUrl = new URL(`/api/cron/${job}`, req.nextUrl.origin)
    const res = await fetch(cronUrl.toString(), {
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (e: any) {
    console.error('[admin/trigger] Unhandled error:', e)
    return NextResponse.json({ error: e?.message ?? 'Internal server error' }, { status: 500 })
  }
}
