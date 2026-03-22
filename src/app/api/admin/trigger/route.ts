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

function getBaseUrl(req: NextRequest): string {
  // NEXT_PUBLIC_SERVER_URL is set in Vercel env vars and local .env
  if (process.env.NEXT_PUBLIC_SERVER_URL) {
    return process.env.NEXT_PUBLIC_SERVER_URL
  }
  // Vercel deployment URL (not set in preview deployments for the canonical URL)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  // Fallback: derive from request
  return req.nextUrl.origin
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const job = body?.job as string

    if (!ALLOWED_JOBS.includes(job as (typeof ALLOWED_JOBS)[number])) {
      return NextResponse.json({ error: `Unknown job: ${job}` }, { status: 400 })
    }

    const baseUrl = getBaseUrl(req)
    const cronUrl = `${baseUrl}/api/cron/${job}`

    const res = await fetch(cronUrl, {
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    })

    const text = await res.text()
    try {
      const data = JSON.parse(text)
      return NextResponse.json(data, { status: res.status })
    } catch {
      console.error(`[admin/trigger] Cron route returned non-JSON (status ${res.status}):`, text.slice(0, 200))
      return NextResponse.json(
        { error: `Cron route returned unexpected response (status ${res.status})` },
        { status: 502 },
      )
    }
  } catch (e: any) {
    console.error('[admin/trigger] Unhandled error:', e)
    return NextResponse.json({ error: e?.message ?? 'Internal server error' }, { status: 500 })
  }
}
