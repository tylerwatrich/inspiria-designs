/**
 * Admin trigger endpoint — lets authenticated admin users fire cron jobs manually
 * without needing the CRON_SECRET. Auth is validated via Payload session.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

const ALLOWED_JOBS = [
  'scan-news',
  'write-post',
  'generate-images',
  'quality-audit',
  'update-articles',
] as const

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
}
